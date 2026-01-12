"use client";

import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface XpLog {
  id: string;
  child_id: string;
  amount: number;
  domain: string;
  reason: string;
  created_at: string;
  quest_instance_id?: string;
}

interface Child {
  id: string;
  display_name: string;
}

export default function XpHistoryPage() {
  const { user, loading } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

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
        .eq("owner_user_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch children
  const { data: children = [] } = useQuery({
    queryKey: ["children", family?.id],
    queryFn: async () => {
      if (!family) return [];
      const { data, error } = await supabase
        .from("child_profile")
        .select("*")
        .eq("family_id", family.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Child[];
    },
    enabled: !!family,
  });

  // Fetch XP logs
  const { data: xpLogs = [] } = useQuery({
    queryKey: ["xp-logs", selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) return [];
      const { data, error } = await supabase
        .from("xp_log")
        .select("*")
        .eq("child_id", selectedChildId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as XpLog[];
    },
    enabled: !!selectedChildId,
  });

  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalXp = xpLogs.reduce((sum, log) => sum + log.amount, 0);

  if (loading) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">XP History</h1>
        <p className="mt-2 text-gray-600">Track XP earned by each child</p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Child</h2>
          <div className="flex flex-wrap gap-3">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedChildId === child.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {child.display_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {selectedChildId && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total XP Earned</dt>
                <dd className="text-3xl font-semibold text-gray-900">{totalXp}</dd>
              </dl>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Entries</dt>
                <dd className="text-3xl font-semibold text-gray-900">{xpLogs.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* XP Logs Table */}
      {selectedChildId && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction Log</h3>
          </div>
          <div className="border-t border-gray-200 overflow-x-auto">
            {xpLogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No XP transactions yet</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      XP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {xpLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDomainColor(
                            log.domain
                          )}`}
                        >
                          {log.domain}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-lg font-semibold text-green-600">+{log.amount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
