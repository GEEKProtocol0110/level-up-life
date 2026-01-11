// Feature gates based on age

import type { SpendingPolicy, WalletMode } from "./types";

/**
 * Determine if allowance earning is enabled for this age
 */
export function allowanceEarnEnabled(age: number): boolean {
  // Can start earning at 7, but parent can enable earlier if desired
  return age >= 7;
}

/**
 * Get spending policy for this age
 */
export function spendingPolicy(age: number): SpendingPolicy {
  if (age < 16) return "request_only";
  if (age < 18) return "autonomy_policy";
  return "autonomy_full";
}

/**
 * Get wallet mode for this age
 */
export function walletMode(age: number): WalletMode {
  if (age < 13) return "sim";
  if (age < 16) return "view";
  if (age < 18) return "real_policy";
  return "real_full";
}

/**
 * Check if user can manage child profiles
 */
export function canManageChildren(age: number): boolean {
  return age >= 18;
}

/**
 * Check if user requires parent approval for mode override
 */
export function requiresParentApprovalForModeOverride(age: number): boolean {
  return age < 18;
}
