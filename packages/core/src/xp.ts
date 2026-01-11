// XP and leveling system

/**
 * Calculate XP required to reach the next level
 */
export function xpToNextLevel(currentLevel: number): number {
  return 100 + currentLevel * 25;
}

/**
 * Calculate total XP required to reach a specific level
 */
export function totalXpForLevel(targetLevel: number): number {
  if (targetLevel <= 0) return 0;
  
  let total = 0;
  for (let level = 0; level < targetLevel; level++) {
    total += xpToNextLevel(level);
  }
  return total;
}

/**
 * Calculate level from total XP
 */
export function computeLevel(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  if (totalXp < 0) totalXp = 0;
  
  let level = 0;
  let xpAccumulated = 0;
  
  while (xpAccumulated + xpToNextLevel(level) <= totalXp) {
    xpAccumulated += xpToNextLevel(level);
    level++;
  }
  
  const currentLevelXp = totalXp - xpAccumulated;
  const nextLevelXp = xpToNextLevel(level);
  const progress = nextLevelXp > 0 ? currentLevelXp / nextLevelXp : 0;
  
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progress,
  };
}

/**
 * Calculate XP reward based on difficulty
 */
export function calculateXpReward(difficulty: number, baseXp: number = 10): number {
  // difficulty 1-5
  const multiplier = 1 + (difficulty - 1) * 0.5;
  return Math.round(baseXp * multiplier);
}
