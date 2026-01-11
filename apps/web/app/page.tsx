"use client";

import {
  completeQuestInstance,
  createChildProfile,
  createSupabaseClient,
  ensureQuestInstancesForToday,
  fetchChildren,
  fetchQuestInstancesForToday,
  fetchXpTotal,
  getOrCreateFamily,
  type ChildProfile,
  type Family,
  type QuestInstance,
} from "@level-up-life/api";
import { ageYears, computeLevel, getPeriod } from "@level-up-life/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

const supabase = createSupabaseClient();

export default function Home() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [childForm, setChildForm] = useState({ name: "", birthdate: "" });
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const hasSetInitialChild = useRef(false);

  // Session handling
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        queryClient.clear();
        setSelectedChildId(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [queryClient]);

  const familyQuery = useQuery<Family>({
    queryKey: ["family", session?.user.id],
    queryFn: async () => getOrCreateFamily(supabase, session!.user.id, "My Family"),
    enabled: !!session,
  });

  const childrenQuery = useQuery<ChildProfile[]>({
    queryKey: ["children", familyQuery.data?.id],
    queryFn: async () => fetchChildren(supabase, familyQuery.data!.id),
    enabled: !!familyQuery.data?.id,
  });

  useEffect(() => {
    if (!hasSetInitialChild.current && (childrenQuery.data?.length ?? 0) > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedChildId(childrenQuery.data![0].id);
      hasSetInitialChild.current = true;
    }
  }, [childrenQuery.data]);

  const questsQuery = useQuery<QuestInstance[]>({
    queryKey: ["quests", selectedChildId],
    queryFn: async () => fetchQuestInstancesForToday(supabase, selectedChildId!),
    enabled: !!selectedChildId,
  });

  const xpQuery = useQuery<number>({
    queryKey: ["xp", selectedChildId],
    queryFn: async () => fetchXpTotal(supabase, selectedChildId!),
    enabled: !!selectedChildId,
  });

  const authMutation = useMutation({
    mutationFn: async () => {
      if (isSigningUp) {
        const { error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw error;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password,
      });
      if (error) throw error;
    },
  });

  const addChildMutation = useMutation({
    mutationFn: async () => {
      if (!familyQuery.data) return;
      await createChildProfile(supabase, {
        family_id: familyQuery.data.id,
        display_name: childForm.name,
        birthdate: childForm.birthdate,
      });
    },
    onSuccess: () => {
      setChildForm({ name: "", birthdate: "" });
      queryClient.invalidateQueries({ queryKey: ["children", familyQuery.data?.id] });
    },
  });

  const ensureTodayMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChildId) return;
      await ensureQuestInstancesForToday(supabase, selectedChildId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests", selectedChildId] });
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (questInstanceId: string) => {
      await completeQuestInstance(supabase, questInstanceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests", selectedChildId] });
      queryClient.invalidateQueries({ queryKey: ["xp", selectedChildId] });
    },
  });

  const currentChild = useMemo(() => {
    return childrenQuery.data?.find((c) => c.id === selectedChildId) ?? null;
  }, [childrenQuery.data, selectedChildId]);

  const levelInfo = useMemo(() => {
    const totalXp = xpQuery.data ?? 0;
    return computeLevel(totalXp);
  }, [xpQuery.data]);

  const todayPeriod = getPeriod("daily", new Date());

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-white px-6 py-12 text-gray-900">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Level-Up Life</h1>
          <p className="text-gray-600">Sign in to start managing your family quests and XP.</p>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            className="rounded border border-gray-300 px-3 py-2"
            type="email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            placeholder="you@example.com"
          />
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            className="rounded border border-gray-300 px-3 py-2"
            type="password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            placeholder="••••••••"
          />
          <div className="flex items-center gap-3">
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white"
              onClick={() => authMutation.mutate()}
              disabled={authMutation.isPending}
            >
              {authMutation.isPending ? "Working..." : isSigningUp ? "Sign up & Sign in" : "Sign in"}
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isSigningUp}
                onChange={(e) => setIsSigningUp(e.target.checked)}
              />
              New here? Create account
            </label>
          </div>
          {authMutation.error && (
            <p className="text-sm text-red-600">{authMutation.error.message}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-white px-6 py-10 text-gray-900">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Today&apos;s Quests</h1>
          <p className="text-gray-600">
            {todayPeriod.start.toDateString()} — Level {levelInfo.level} ({Math.round((levelInfo.progress || 0) * 100)}%)
          </p>
        </div>
        <button
          className="rounded border border-gray-300 px-4 py-2 text-sm"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </button>
      </header>

      <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="text-lg font-semibold">Children</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {childrenQuery.data?.map((child) => (
            <button
              key={child.id}
              className={`rounded px-3 py-2 text-sm ${selectedChildId === child.id ? "bg-blue-600 text-white" : "bg-white text-gray-800 border border-gray-300"}`}
              onClick={() => setSelectedChildId(child.id)}
            >
              {child.display_name}
            </button>
          ))}
          {childrenQuery.isFetching && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end md:gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Name</label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={childForm.name}
              onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
              placeholder="Alex"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Birthdate (YYYY-MM-DD)</label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={childForm.birthdate}
              onChange={(e) => setChildForm({ ...childForm, birthdate: e.target.value })}
              placeholder="2015-08-12"
            />
          </div>
          <button
            className="h-fit rounded bg-green-600 px-4 py-2 text-white"
            onClick={() => addChildMutation.mutate()}
            disabled={addChildMutation.isPending}
          >
            {addChildMutation.isPending ? "Adding..." : "Add Child"}
          </button>
        </div>
        {addChildMutation.error && <p className="text-sm text-red-600">{addChildMutation.error.message}</p>}
      </section>

      {currentChild ? (
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{currentChild.display_name}</h3>
              <p className="text-sm text-gray-600">
                Age {ageYears(currentChild.birthdate)} • XP {xpQuery.data ?? 0} • Level {levelInfo.level}
              </p>
            </div>
            <button
              className="rounded border border-blue-600 px-3 py-2 text-sm text-blue-700"
              onClick={() => ensureTodayMutation.mutate()}
              disabled={ensureTodayMutation.isPending}
            >
              {ensureTodayMutation.isPending ? "Preparing..." : "Generate today&apos;s quests"}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {questsQuery.data?.length === 0 && (
              <p className="text-sm text-gray-600">No quests yet. Generate today&apos;s quests.</p>
            )}
            {questsQuery.data?.map((quest) => (
              <div key={quest.id} className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Quest #{quest.id.slice(0, 6)}</span>
                  <span className="text-xs text-gray-600">Status: {quest.status}</span>
                </div>
                {quest.status !== "completed" ? (
                  <button
                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                    onClick={() => completeQuestMutation.mutate(quest.id)}
                    disabled={completeQuestMutation.isPending}
                  >
                    Complete
                  </button>
                ) : (
                  <span className="text-xs text-green-700">Done</span>
                )}
              </div>
            ))}
          </div>
          {(questsQuery.error || ensureTodayMutation.error || completeQuestMutation.error) && (
            <p className="mt-2 text-sm text-red-600">
              {questsQuery.error?.message || ensureTodayMutation.error?.message || completeQuestMutation.error?.message}
            </p>
          )}
        </section>
      ) : (
        <p className="text-sm text-gray-600">Add or select a child to see quests.</p>
      )}
    </main>
  );
}
