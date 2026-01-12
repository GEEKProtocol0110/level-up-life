"use client";

import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Child {
  id: string;
  display_name: string;
  birthdate: string;
  mode_override?: string;
  avatar_url?: string;
}

interface QuestInstance {
  id: string;
  status: string;
  period_start: string;
  period_end: string;
  completed_at?: string;
  notes?: string;
  quest_id: string;
  quest: {
    id: string;
    title: string;
    domain: string;
    xp_reward: number;
    difficulty: number;
  };
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  pending: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
  skipped: "bg-slate-100 text-slate-800",
};

export default function ChildDetailPage() {
  const { user, loading } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const childId = params.id as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Fetch child
  const { data: child, isLoading: childLoading } = useQuery({
    queryKey: ["child", childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profile")
        .select("*")
        .eq("id", childId)
        .single();
      if (error) throw error;
      return data as Child;
    },
    enabled: !!childId && !!user,
  });

  // Fetch XP total
  const { data: xpTotal = 0 } = useQuery({
    queryKey: ["xp-total", childId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_child_total_xp", {
        p_child_id: childId,
      });
      if (error) throw error;
      return data || 0;
    },
    enabled: !!childId,
  });

  // Fetch quest instances
  const { data: questInstances = [], refetch } = useQuery({
    queryKey: ["quest-instances", childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quest_instance")
        .select(
          `
          id,
          status,
          period_start,
          period_end,
          completed_at,
          notes,
          quest_id,
          quest:quest_id (
            id,
            title,
            domain,
            xp_reward,
            difficulty
          )
        `
        )
        .eq("child_id", childId)
        .order("period_start", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as QuestInstance[];
    },
    enabled: !!childId,
  });

  // Complete quest mutation
  const completeQuestMutation = useMutation({
    mutationFn: async (questInstanceId: string) => {
      const { error } = await supabase
        .from("quest_instance")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", questInstanceId);

      if (error) throw error;

      // Add XP log
      const qi = questInstances.find((q) => q.id === questInstanceId);
      if (qi) {
        await supabase.from("xp_log").insert({
          child_id: childId,
          domain: qi.quest.domain,
          amount: qi.quest.xp_reward,
          reason: `Completed quest: ${qi.quest.title}`,
          quest_instance_id: questInstanceId,
        } as any);
      }
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["xp-total", childId] });
    },
    onError: (error: any) => {
      alert("Error completing quest: " + error.message);
    },
  });

  // Update quest status mutation
  const updateQuestStatusMutation = useMutation({
    mutationFn: async ({ questInstanceId, newStatus }: { questInstanceId: string; newStatus: string }) => {
      const { error } = await supabase
        .from("quest_instance")
        .update({
          status: newStatus as any,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", questInstanceId);

      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      alert("Error updating quest: " + error.message);
    },
  });

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateLevel = (xp: number) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  if (loading || childLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !child) {
    return null;
  }

  const level = calculateLevel(xpTotal);

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {child.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{child.display_name}</h1>
                <p className="text-blue-100">Age {calculateAge(child.birthdate)}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/children")}
            className="text-blue-100 hover:text-white text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">⭐</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Level</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{level}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total XP</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{xpTotal}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📋</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Quests</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{questInstances.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quests */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Quests</h3>
        </div>
        <div className="border-t border-gray-200">
          {questInstances.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No quests yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {questInstances.map((qi) => (
                <li key={qi.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {qi.quest.title}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[qi.status] || "bg-gray-100"
                          }`}
                        >
                          {qi.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>📅 {new Date(qi.period_start).toLocaleDateString()}</span>
                        <span>💎 {qi.quest.domain}</span>
                        <span>⚡ {qi.quest.xp_reward} XP</span>
                      </div>
                      {qi.notes && (
                        <p className="mt-2 text-sm text-gray-600 italic">Note: {qi.notes}</p>
                      )}
                    </div>
                    <div className="ml-4 flex space-x-2">
                      {qi.status !== "completed" && (
                        <button
                          onClick={() => completeQuestMutation.mutate(qi.id)}
                          disabled={completeQuestMutation.isPending}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          ✓ Complete
                        </button>
                      )}
                      <select
                        value={qi.status}
                        onChange={(e) => updateQuestStatusMutation.mutate({ questInstanceId: qi.id, newStatus: e.target.value })}
                        disabled={updateQuestStatusMutation.isPending}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="skipped">Skipped</option>
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
