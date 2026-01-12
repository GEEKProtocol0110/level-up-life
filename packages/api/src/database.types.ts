export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      child_account_link: {
        Row: {
          activated_at: string
          child_id: string
          id: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          child_id: string
          id?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          child_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_account_link_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profile: {
        Row: {
          avatar_url: string | null
          birthdate: string
          created_at: string
          display_name: string
          family_id: string
          id: string
          mode_override: Database["public"]["Enums"]["mode_type"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birthdate: string
          created_at?: string
          display_name: string
          family_id: string
          id?: string
          mode_override?: Database["public"]["Enums"]["mode_type"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birthdate?: string
          created_at?: string
          display_name?: string
          family_id?: string
          id?: string
          mode_override?: Database["public"]["Enums"]["mode_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_profile_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family"
            referencedColumns: ["id"]
          },
        ]
      }
      family: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_member: {
        Row: {
          created_at: string
          family_id: string
          id: string
          role: Database["public"]["Enums"]["family_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          role: Database["public"]["Enums"]["family_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          role?: Database["public"]["Enums"]["family_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_member_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family"
            referencedColumns: ["id"]
          },
        ]
      }
      quest: {
        Row: {
          cadence: Database["public"]["Enums"]["quest_cadence"]
          created_at: string
          created_by_user_id: string | null
          description: string | null
          difficulty: number
          domain: Database["public"]["Enums"]["quest_domain"]
          family_id: string
          id: string
          is_system: boolean
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          cadence?: Database["public"]["Enums"]["quest_cadence"]
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          difficulty?: number
          domain?: Database["public"]["Enums"]["quest_domain"]
          family_id: string
          id?: string
          is_system?: boolean
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          cadence?: Database["public"]["Enums"]["quest_cadence"]
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          difficulty?: number
          domain?: Database["public"]["Enums"]["quest_domain"]
          family_id?: string
          id?: string
          is_system?: boolean
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_instance: {
        Row: {
          child_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          quest_id: string
          status: Database["public"]["Enums"]["quest_status"]
          updated_at: string
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          quest_id: string
          status?: Database["public"]["Enums"]["quest_status"]
          updated_at?: string
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          quest_id?: string
          status?: Database["public"]["Enums"]["quest_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_instance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_instance_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quest"
            referencedColumns: ["id"]
          },
        ]
      }
      reward: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string | null
          family_id: string
          icon: string | null
          id: string
          title: string
          updated_at: string
          xp_cost: number
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          family_id: string
          icon?: string | null
          id?: string
          title: string
          updated_at?: string
          xp_cost: number
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          family_id?: string
          icon?: string | null
          id?: string
          title?: string
          updated_at?: string
          xp_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "reward_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemption: {
        Row: {
          approved_at: string | null
          approved_by_user_id: string | null
          child_id: string
          id: string
          notes: string | null
          redeemed_at: string
          reward_id: string
          status: string
          xp_spent: number
        }
        Insert: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          child_id: string
          id?: string
          notes?: string | null
          redeemed_at?: string
          reward_id: string
          status?: string
          xp_spent: number
        }
        Update: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          child_id?: string
          id?: string
          notes?: string | null
          redeemed_at?: string
          reward_id?: string
          status?: string
          xp_spent?: number
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemption_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemption_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "reward"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_log: {
        Row: {
          amount: number
          child_id: string
          created_at: string
          domain: Database["public"]["Enums"]["quest_domain"]
          id: string
          quest_instance_id: string | null
          reason: string
        }
        Insert: {
          amount: number
          child_id: string
          created_at?: string
          domain?: Database["public"]["Enums"]["quest_domain"]
          id?: string
          quest_instance_id?: string | null
          reason: string
        }
        Update: {
          amount?: number
          child_id?: string
          created_at?: string
          domain?: Database["public"]["Enums"]["quest_domain"]
          id?: string
          quest_instance_id?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_log_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_log_quest_instance_id_fkey"
            columns: ["quest_instance_id"]
            isOneToOne: false
            referencedRelation: "quest_instance"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_child_total_xp: { Args: { p_child_id: string }; Returns: number }
    }
    Enums: {
      family_role: "parent" | "caregiver" | "child"
      mode_type: "child" | "youth" | "adult" | "legacy"
      quest_cadence: "daily" | "weekly" | "monthly" | "yearly"
      quest_domain:
        | "academics"
        | "behavior"
        | "athletics"
        | "health"
        | "recipes"
        | "money"
        | "general"
      quest_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
        | "skipped"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      family_role: ["parent", "caregiver", "child"],
      mode_type: ["child", "youth", "adult", "legacy"],
      quest_cadence: ["daily", "weekly", "monthly", "yearly"],
      quest_domain: [
        "academics",
        "behavior",
        "athletics",
        "health",
        "recipes",
        "money",
        "general",
      ],
      quest_status: [
        "pending",
        "in_progress",
        "completed",
        "failed",
        "skipped",
      ],
    },
  },
} as const

