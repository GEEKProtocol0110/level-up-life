"use client";

import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Reward {
  id: string;
  title: string;
  description?: string;
  xp_cost: number;
  icon?: string;
}

interface Family {
  id: string;
}

export default function RewardsPage() {
  const { user, loading } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    xp_cost: 50,
    icon: "🎁",
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

  // Fetch rewards
  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["rewards", family?.id],
    queryFn: async () => {
      if (!family) return [];
      const { data, error } = await supabase
        .from("reward")
        .select("*")
        .eq("family_id", family.id)
        .order("created_at", { ascending: false } as any);
      if (error) throw error;
      return data as Reward[];
    },
    enabled: !!family,
  });

  // Create reward mutation
  const createRewardMutation = useMutation({
    mutationFn: async () => {
      if (!family) throw new Error("No family found");

      const { error } = await supabase.from("reward").insert({
        family_id: family.id,
        title: formData.title,
        description: formData.description,
        xp_cost: formData.xp_cost,
        icon: formData.icon,
        created_by_user_id: user?.id || "",
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      setFormData({
        title: "",
        description: "",
        xp_cost: 50,
        icon: "🎁",
      });
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["rewards", family?.id] });
    },
    onError: (error: any) => {
      alert("Error creating reward: " + error.message);
    },
  });

  // Delete reward mutation
  const deleteRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const { error } = await supabase.from("reward").delete().eq("id", rewardId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards", family?.id] });
    },
    onError: (error: any) => {
      alert("Error deleting reward: " + error.message);
    },
  });

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

  const iconEmojis = ["🎁", "🎮", "🍕", "🎬", "📱", "🚀", "⭐", "🏆", "🎨", "📚"];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rewards Shop</h1>
          <p className="mt-2 text-gray-600">Create rewards that children can redeem with XP</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          {isFormOpen ? "Cancel" : "+ Add Reward"}
        </button>
      </div>

      {/* Create Reward Form */}
      {isFormOpen && (
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Reward</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Extra screen time, Movie night"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="What does this reward include?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {iconEmojis.map((emoji) => (
                    <option key={emoji} value={emoji}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">XP Cost</label>
                <input
                  type="number"
                  value={formData.xp_cost}
                  onChange={(e) => setFormData({ ...formData, xp_cost: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="1000"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => createRewardMutation.mutate()}
              disabled={!formData.title || !formData.xp_cost || createRewardMutation.isPending}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createRewardMutation.isPending ? "Creating..." : "Create Reward"}
            </button>
          </div>
        </div>
      )}

      {/* Rewards Grid */}
      {rewards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No rewards created yet</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create your first reward
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-4xl mb-2">{reward.icon || "🎁"}</div>
                    <h3 className="text-lg font-medium text-gray-900">{reward.title}</h3>
                    {reward.description && (
                      <p className="mt-2 text-sm text-gray-600">{reward.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reward.xp_cost} <span className="text-sm font-normal">XP</span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${reward.title}"?`)) {
                          deleteRewardMutation.mutate(reward.id);
                        }
                      }}
                      disabled={deleteRewardMutation.isPending}
                      className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900">Tip</h3>
        <p className="mt-2 text-sm text-blue-700">
          Create rewards that motivate your children to complete quests. Popular rewards include screen time,
          snacks, outings, or special privileges. Children can view and request rewards from the mobile app!
        </p>
      </div>
    </div>
  );
}
