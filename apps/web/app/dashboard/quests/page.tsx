"use client";

import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Quest {
  id: string;
  title: string;
  description?: string;
  domain: string;
  cadence: string;
  difficulty: number;
  xp_reward: number;
  is_system: boolean;
  created_by_user_id?: string;
}

interface Family {
  id: string;
}

const domains = ["academics", "behavior", "athletics", "health", "recipes", "money", "general"];
const cadences = ["daily", "weekly", "monthly", "yearly"];
const difficulties = [1, 2, 3, 4, 5];

export default function QuestsPage() {
  const { user, loading } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "general",
    cadence: "daily",
    difficulty: 2,
    xp_reward: 10,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Fetch family
  const { data: family } = useQuery({
    queryKey: ["family", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family")
        .select("*")
        .eq("owner_user_id", user?.id || "")
        .single();
      if (error) throw error;
      return data as Family;
    },
    enabled: !!user,
  });

  // Fetch quests
  const { data: quests = [], isLoading } = useQuery({
    queryKey: ["quests", family?.id],
    queryFn: async () => {
      if (!family) return [];
      const { data, error } = await supabase
        .from("quest")
        .select("*")
        .eq("family_id", family.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Quest[];
    },
    enabled: !!family,
  });

  // Create quest mutation
  const createQuestMutation = useMutation({
    mutationFn: async () => {
      if (!family) throw new Error("No family found");

      const { error } = await supabase.from("quest").insert({
        family_id: family.id,
        title: formData.title,
        description: formData.description,
        domain: formData.domain,
        cadence: formData.cadence,
        difficulty: formData.difficulty,
        xp_reward: formData.xp_reward,
        created_by_user_id: user?.id || "",
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      setFormData({
        title: "",
        description: "",
        domain: "general",
        cadence: "daily",
        difficulty: 2,
        xp_reward: 10,
      });
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["quests", family?.id] });
    },
    onError: (error: any) => {
      alert("Error creating quest: " + error.message);
    },
  });

  // Delete quest mutation
  const deleteQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const { error } = await supabase.from("quest").delete().eq("id", questId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests", family?.id] });
    },
    onError: (error: any) => {
      alert("Error deleting quest: " + error.message);
    },
  });

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

  const getDifficultyStars = (difficulty: number) => {
    return "⭐".repeat(difficulty);
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quests</h1>
          <p className="mt-2 text-gray-600">Create and manage family quests</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          {isFormOpen ? "Cancel" : "+ Create Quest"}
        </button>
      </div>

      {/* Create Quest Form */}
      {isFormOpen && (
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Quest</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Quest title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Quest description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Domain</label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain.charAt(0).toUpperCase() + domain.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cadence</label>
                <select
                  value={formData.cadence}
                  onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {cadences.map((cadence) => (
                    <option key={cadence} value={cadence}>
                      {cadence.charAt(0).toUpperCase() + cadence.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {"⭐".repeat(diff)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">XP Reward</label>
                <input
                  type="number"
                  value={formData.xp_reward}
                  onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="500"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => createQuestMutation.mutate()}
              disabled={!formData.title || createQuestMutation.isPending}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createQuestMutation.isPending ? "Creating..." : "Create Quest"}
            </button>
          </div>
        </div>
      )}

      {/* Quests List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {quests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No quests created yet</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create your first quest
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {quests.map((quest) => (
              <li key={quest.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDomainColor(quest.domain)}`}>
                        {quest.domain}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{quest.title}</h3>
                      {quest.description && (
                        <p className="mt-1 text-sm text-gray-600">{quest.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>📅 {quest.cadence}</span>
                        <span>{getDifficultyStars(quest.difficulty)}</span>
                        <span>⚡ {quest.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${quest.title}"?`)) {
                          deleteQuestMutation.mutate(quest.id);
                        }
                      }}
                      disabled={deleteQuestMutation.isPending}
                      className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
