// Core types for Level-Up Life

export type Mode = "child" | "youth" | "adult" | "legacy";

export type QuestCadence = "daily" | "weekly" | "monthly" | "yearly";

export type QuestStatus = "pending" | "in_progress" | "completed" | "failed" | "skipped";

export type Domain = "academics" | "behavior" | "athletics" | "health" | "recipes" | "money" | "general";

export type SpendingPolicy = "request_only" | "autonomy_policy" | "autonomy_full";

export type WalletMode = "sim" | "view" | "real_policy" | "real_full";

export interface ChildProfile {
  id: string;
  familyId: string;
  displayName: string;
  birthdate: string; // ISO date string
  modeOverride?: Mode;
  createdAt: string;
}

export interface QuestTemplate {
  id: string;
  domain: Domain;
  title: string;
  description?: string;
  cadence: QuestCadence;
  difficulty: number; // 1-5
  xpReward: number;
  isSystem: boolean;
  createdByUserId?: string;
  createdAt: string;
}

export interface QuestInstance {
  id: string;
  childId: string;
  questId: string;
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
  status: QuestStatus;
  completedAt?: string;
  notes?: string;
}

export interface XPLog {
  id: string;
  childId: string;
  domain: Domain;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  unlockedAt?: string;
}

export interface Period {
  start: Date;
  end: Date;
}
