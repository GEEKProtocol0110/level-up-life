// Age and Mode calculations

import type { Mode } from "./types";

/**
 * Calculate age in years from birthdate
 */
export function ageYears(birthdate: string | Date, now: Date = new Date()): number {
  const birth = typeof birthdate === "string" ? new Date(birthdate) : birthdate;
  const ageMs = now.getTime() - birth.getTime();
  const ageDate = new Date(ageMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * Get recommended mode based on age
 */
export function recommendedMode(age: number): Mode {
  if (age < 10) return "child";
  if (age < 16) return "youth";
  return "adult";
}

/**
 * Get effective mode considering override and age constraints
 */
export function effectiveMode(age: number, override?: Mode): Mode {
  const recommended = recommendedMode(age);
  
  // No override, use recommended
  if (!override) return recommended;
  
  // Override is same as recommended, use it
  if (override === recommended) return override;
  
  // For sensitive overrides (child wanting adult mode), 
  // this function just returns what's requested
  // The actual approval logic happens in the app layer
  return override;
}
