// Zod schemas for validation

import { z } from "zod";

export const FamilySchema = z.object({
  id: z.string().uuid(),
  owner_user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateFamilySchema = z.object({
  name: z.string().min(1).max(100),
});

export const ChildProfileSchema = z.object({
  id: z.string().uuid(),
  family_id: z.string().uuid(),
  display_name: z.string().min(1).max(100),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mode_override: z.enum(["child", "youth", "adult", "legacy"]).nullable(),
  avatar_url: z.string().url().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateChildProfileSchema = z.object({
  family_id: z.string().uuid(),
  display_name: z.string().min(1).max(100),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mode_override: z.enum(["child", "youth", "adult", "legacy"]).optional(),
});

export const QuestSchema = z.object({
  id: z.string().uuid(),
  family_id: z.string().uuid(),
  domain: z.enum(["academics", "behavior", "athletics", "health", "recipes", "money", "general"]),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable(),
  cadence: z.enum(["daily", "weekly", "monthly", "yearly"]),
  difficulty: z.number().int().min(1).max(5),
  xp_reward: z.number().int().min(0),
  is_system: z.boolean(),
  created_by_user_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateQuestSchema = z.object({
  family_id: z.string().uuid(),
  domain: z.enum(["academics", "behavior", "athletics", "health", "recipes", "money", "general"]).default("general"),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  cadence: z.enum(["daily", "weekly", "monthly", "yearly"]).default("daily"),
  difficulty: z.number().int().min(1).max(5).default(1),
  xp_reward: z.number().int().min(0).default(10),
  created_by_user_id: z.string().uuid().optional(),
  is_system: z.boolean().optional(),
});

export const QuestInstanceSchema = z.object({
  id: z.string().uuid(),
  child_id: z.string().uuid(),
  quest_id: z.string().uuid(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  status: z.enum(["pending", "in_progress", "completed", "failed", "skipped"]),
  completed_at: z.string().datetime().nullable(),
  notes: z.string().max(500).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CompleteQuestSchema = z.object({
  quest_instance_id: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const XPLogSchema = z.object({
  id: z.string().uuid(),
  child_id: z.string().uuid(),
  domain: z.enum(["academics", "behavior", "athletics", "health", "recipes", "money", "general"]),
  amount: z.number().int(),
  reason: z.string().min(1).max(200),
  quest_instance_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
});

export type Family = z.infer<typeof FamilySchema>;
export type CreateFamily = z.infer<typeof CreateFamilySchema>;
export type ChildProfile = z.infer<typeof ChildProfileSchema>;
export type CreateChildProfile = z.infer<typeof CreateChildProfileSchema>;
export type Quest = z.infer<typeof QuestSchema>;
export type CreateQuest = z.infer<typeof CreateQuestSchema>;
export type QuestInstance = z.infer<typeof QuestInstanceSchema>;
export type CompleteQuest = z.infer<typeof CompleteQuestSchema>;
export type XPLog = z.infer<typeof XPLogSchema>;
