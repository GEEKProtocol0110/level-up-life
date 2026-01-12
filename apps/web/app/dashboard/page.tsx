"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSupabase } from "@/hooks/useSupabase";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";

interface Child {
  id: string;
  display_name: string;
  birthdate: string;
  avatar_url?: string;
}

interface QuestInstance {
  id: string;
  status: string;
  quest: {
    title: string;
    domain: string;
    xp_reward: number;
  };
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Fetch children
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ["children", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("child_profile")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Child[];
    },
    enabled: !!user,
  });

  // Fetch XP totals for each child
  const { data: xpTotals = {} } = useQuery({
    queryKey: ["xp-totals", children.map((c) => c.id)],
    queryFn: async () => {
      const totals: Record<string, number> = {};
      
      for (const child of children) {
        const { data, error } = await supabase.rpc("get_child_total_xp", {
          p_child_id: child.id,
        });

        if (!error && data !== null) {
          totals[child.id] = data;
        }
      }

      return totals;
    },
    enabled: children.length > 0,
  });

  // Subscribe to realtime updates for quest instances
  const handleQuestUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["quests-today"] });
    queryClient.invalidateQueries({ queryKey: ["xp-totals"] });
  }, [queryClient]);

  useRealtimeSubscription({
    table: "quest_instance",
    event: "UPDATE",
    onUpdate: handleQuestUpdate,
  });

  // Subscribe to XP log updates
  useRealtimeSubscription({
    table: "xp_log",
    event: "INSERT",
    onUpdate: handleQuestUpdate,
  });

  // Fetch today's quests for all children
  const { data: questsToday = [], isLoading: questsLoading } = useQuery({
    queryKey: ["quests-today", children.map((c) => c.id)],
    queryFn: async () => {
      if (children.length === 0) return [];

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("quest_instance")
        .select(
          `
          id,
          status,
          child_id,
          quest:quest_id (
            title,
            domain,
            xp_reward
          )
        `
        )
        .gte("period_start", `${today}T00:00:00`)
        .lte("period_end", `${today}T23:59:59`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as unknown as (QuestInstance & { child_id: string })[];
    },
    enabled: children.length > 0,
  });

  if (loading || childrenLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const calculateLevel = (xp: number) => {
    // Simple level calculation: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case "academics":
        return "bg-blue-100 text-blue-800";
      case "behavior":
        return "bg-purple-100 text-purple-800";
      case "athletics":
        return "bg-orange-100 text-orange-800";
      case "health":
        return "bg-green-100 text-green-800";
      case "recipes":
        return "bg-pink-100 text-pink-800";
      case "money":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const completedToday = questsToday.filter((q) => q.status === "completed").length;
  const totalToday = questsToday.length;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your family's progress.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Children</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{children.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Today</dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {completedToday}/{totalToday}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total XP</dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {Object.values(xpTotals).reduce((sum, xp) => sum + xp, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Quests</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{totalToday}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Children List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Children Progress</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Track your children's levels and today's quests
          </p>
        </div>
        <div className="border-t border-gray-200">
          {children.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No children added yet</p>
              <a
                href="/dashboard/children"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add your first child
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {children.map((child) => {
                const xp = xpTotals[child.id] || 0;
                const level = calculateLevel(xp);
                const childQuests = questsToday.filter((q) => q.child_id === child.id);
                const childCompleted = childQuests.filter((q) => q.status === "completed").length;

                return (
                  <li key={child.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600">
                              {child.display_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {child.display_name}
                              </h4>
                              <div className="mt-1 flex items-center space-x-4">
                                <span className="text-sm text-gray-500">Level {level}</span>
                                <span className="text-sm text-gray-500">{xp} XP</span>
                                <span className="text-sm text-gray-500">
                                  {childCompleted}/{childQuests.length} quests today
                                </span>
                              </div>
                            </div>
                          </div>
                          {childQuests.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {childQuests.map((quest) => (
                                <span
                                  key={quest.id}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDomainColor(
                                    quest.quest.domain
                                  )}`}
                                >
                                  {quest.quest.title} -{" "}
                                  <span className={`ml-1 ${getStatusColor(quest.status)}`}>
                                    {quest.status}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <a
                          href={`/dashboard/children/${child.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View details →
                        </a>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
