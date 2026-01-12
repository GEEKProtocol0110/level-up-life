"use client";

import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Child {
  id: string;
  display_name: string;
  birthdate: string;
  mode_override?: string;
  avatar_url?: string;
}

export default function ChildrenPage() {
  const { user, loading } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", birthdate: "" });

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
      return data;
    },
    enabled: !!user,
  });

  // Fetch children
  const { data: children = [], isLoading } = useQuery({
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

  // Create child mutation
  const createChildMutation = useMutation({
    mutationFn: async () => {
      if (!family) throw new Error("No family found");

      const { error } = await supabase.from("child_profile").insert({
        family_id: family.id,
        display_name: formData.name,
        birthdate: formData.birthdate,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setFormData({ name: "", birthdate: "" });
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["children", family?.id] });
    },
    onError: (error: any) => {
      alert("Error creating child: " + error.message);
    },
  });

  // Delete child mutation
  const deleteChildMutation = useMutation({
    mutationFn: async (childId: string) => {
      const { error } = await supabase
        .from("child_profile")
        .delete()
        .eq("id", childId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", family?.id] });
    },
    onError: (error: any) => {
      alert("Error deleting child: " + error.message);
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
          <h1 className="text-3xl font-bold text-gray-900">Children</h1>
          <p className="mt-2 text-gray-600">Manage your children's profiles and settings</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          {isFormOpen ? "Cancel" : "+ Add Child"}
        </button>
      </div>

      {/* Add Child Form */}
      {isFormOpen && (
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Child</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Child's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Birthdate</label>
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => createChildMutation.mutate()}
              disabled={
                !formData.name ||
                !formData.birthdate ||
                createChildMutation.isPending
              }
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createChildMutation.isPending ? "Creating..." : "Add Child"}
            </button>
          </div>
        </div>
      )}

      {/* Children List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {children.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No children added yet</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add your first child
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {children.map((child) => (
              <li key={child.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">
                          {child.display_name.charAt(0).toUpperCase()}
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
                            <span className="text-sm text-gray-500">
                              Age: {calculateAge(child.birthdate)}
                            </span>
                            <span className="text-sm text-gray-500">
                              Born: {new Date(child.birthdate).toLocaleDateString()}
                            </span>
                            {child.mode_override && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {child.mode_override}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-3">
                    <a
                      href={`/dashboard/children/${child.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View
                    </a>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete ${child.display_name}?`
                          )
                        ) {
                          deleteChildMutation.mutate(child.id);
                        }
                      }}
                      disabled={deleteChildMutation.isPending}
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
