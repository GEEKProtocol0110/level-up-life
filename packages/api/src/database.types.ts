// Database type definitions (generated from Supabase)
// Run: npx supabase gen types typescript --local > packages/api/src/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      family: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_member: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: "parent" | "caregiver" | "child"
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role: "parent" | "caregiver" | "child"
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: "parent" | "caregiver" | "child"
          created_at?: string
        }
        Relationships: []
      }
      child_profile: {
        Row: {
          id: string
          family_id: string
          display_name: string
          birthdate: string
          mode_override: "child" | "youth" | "adult" | "legacy" | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          display_name: string
          birthdate: string
          mode_override?: "child" | "youth" | "adult" | "legacy" | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          display_name?: string
          birthdate?: string
          mode_override?: "child" | "youth" | "adult" | "legacy" | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      child_account_link: {
        Row: {
          id: string
          child_id: string
          user_id: string
          activated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          user_id: string
          activated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          user_id?: string
          activated_at?: string
        }
        Relationships: []
      }
      quest: {
        Row: {
          id: string
          family_id: string
          domain: "academics" | "behavior" | "athletics" | "health" | "recipes" | "money" | "general"
          title: string
          description: string | null
          cadence: "daily" | "weekly" | "monthly" | "yearly"
          difficulty: number
          xp_reward: number
          is_system: boolean
          created_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          domain?: "academics" | "behavior" | "athletics" | "health" | "recipes" | "money" | "general"
          title: string
          description?: string | null
          cadence?: "daily" | "weekly" | "monthly" | "yearly"
          difficulty?: number
          xp_reward?: number
          is_system?: boolean
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          domain?: "academics" | "behavior" | "athletics" | "health" | "recipes" | "money" | "general"
          title?: string
          description?: string | null
          cadence?: "daily" | "weekly" | "monthly" | "yearly"
          difficulty?: number
          xp_reward?: number
          is_system?: boolean
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quest_instance: {
        Row: {
          id: string
          child_id: string
          quest_id: string
          period_start: string
          period_end: string
          status: "pending" | "in_progress" | "completed" | "failed" | "skipped"
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          quest_id: string
          period_start: string
          period_end: string
          status?: "pending" | "in_progress" | "completed" | "failed" | "skipped"
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          quest_id?: string
          period_start?: string
          period_end?: string
          status?: "pending" | "in_progress" | "completed" | "failed" | "skipped"
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      xp_log: {
        Row: {
          id: string
          child_id: string
          domain: "academics" | "behavior" | "athletics" | "health" | "recipes" | "money" | "general"
          amount: number
          reason: string
          quest_instance_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          domain?: "academics" | "behavior" | "athletics" | "health" | "recipes" | "money" | "general"
          amount: number
          reason: string
          quest_instance_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          domain?: "academics" | "behavior" | "athletics" | "health" | "recipes" | "money" | "general"
          amount?: number
          reason?: string
          quest_instance_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Functions: {
      get_child_total_xp: {
        Args: { p_child_id: string }
        Returns: number
      }
    }
    Enums: {}
    CompositeTypes: {}
    Views: {}
  }
}
