// Quest cadence and period calculations

import type { QuestCadence, Period } from "./types";

/**
 * Get the period boundaries for a quest cadence at a given date
 */
export function getPeriod(cadence: QuestCadence, date: Date = new Date()): Period {
  const d = new Date(date);
  
  switch (cadence) {
    case "daily": {
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      return { start, end };
    }
    
    case "weekly": {
      // Week starts on Sunday (0)
      const dayOfWeek = d.getDay();
      const start = new Date(d);
      start.setDate(d.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      
      return { start, end };
    }
    
    case "monthly": {
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    
    case "yearly": {
      const start = new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    
    default:
      throw new Error(`Unknown cadence: ${cadence}`);
  }
}

/**
 * Check if a date is within a period
 */
export function isInPeriod(date: Date, period: Period): boolean {
  return date >= period.start && date <= period.end;
}

/**
 * Get the next period after the given period
 */
export function getNextPeriod(cadence: QuestCadence, currentPeriod: Period): Period {
  const nextDate = new Date(currentPeriod.end);
  nextDate.setDate(nextDate.getDate() + 1);
  return getPeriod(cadence, nextDate);
}
