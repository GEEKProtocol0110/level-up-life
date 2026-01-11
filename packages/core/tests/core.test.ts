// Simple test utilities for core package
// Run with: node --test tests/

import { ageYears, recommendedMode, effectiveMode } from "../src/age";
import { allowanceEarnEnabled, spendingPolicy, walletMode } from "../src/gates";
import { getPeriod, isInPeriod } from "../src/cadence";
import { xpToNextLevel, computeLevel, totalXpForLevel } from "../src/xp";
import { strict as assert } from "node:assert";
import { test, describe } from "node:test";

describe("Age calculations", () => {
  test("ageYears calculates correctly", () => {
    const birthdate = new Date("2020-01-15");
    const now = new Date("2026-01-15");
    assert.equal(ageYears(birthdate, now), 6);
  });

  test("recommendedMode returns correct modes", () => {
    assert.equal(recommendedMode(5), "child");
    assert.equal(recommendedMode(9), "child");
    assert.equal(recommendedMode(10), "youth");
    assert.equal(recommendedMode(15), "youth");
    assert.equal(recommendedMode(16), "adult");
    assert.equal(recommendedMode(25), "adult");
  });

  test("effectiveMode respects override", () => {
    assert.equal(effectiveMode(8), "child");
    assert.equal(effectiveMode(8, "youth"), "youth");
    assert.equal(effectiveMode(12, "adult"), "adult");
  });
});

describe("Feature gates", () => {
  test("allowanceEarnEnabled gates by age", () => {
    assert.equal(allowanceEarnEnabled(6), false);
    assert.equal(allowanceEarnEnabled(7), true);
    assert.equal(allowanceEarnEnabled(10), true);
  });

  test("spendingPolicy gates by age", () => {
    assert.equal(spendingPolicy(10), "request_only");
    assert.equal(spendingPolicy(15), "request_only");
    assert.equal(spendingPolicy(16), "autonomy_policy");
    assert.equal(spendingPolicy(17), "autonomy_policy");
    assert.equal(spendingPolicy(18), "autonomy_full");
  });

  test("walletMode gates by age", () => {
    assert.equal(walletMode(10), "sim");
    assert.equal(walletMode(12), "sim");
    assert.equal(walletMode(13), "view");
    assert.equal(walletMode(15), "view");
    assert.equal(walletMode(16), "real_policy");
    assert.equal(walletMode(17), "real_policy");
    assert.equal(walletMode(18), "real_full");
  });
});

describe("Quest cadence", () => {
  test("getPeriod returns correct daily period", () => {
    const date = new Date("2026-01-15T14:30:00");
    const period = getPeriod("daily", date);
    assert.equal(period.start.getDate(), 15);
    assert.equal(period.start.getHours(), 0);
    assert.equal(period.end.getDate(), 15);
    assert.equal(period.end.getHours(), 23);
  });

  test("getPeriod returns correct weekly period", () => {
    const date = new Date("2026-01-15T14:30:00"); // Thursday
    const period = getPeriod("weekly", date);
    // Week should start on Sunday (Jan 11)
    assert.equal(period.start.getDate(), 11);
    assert.equal(period.end.getDate(), 17);
  });

  test("isInPeriod checks correctly", () => {
    const period = {
      start: new Date("2026-01-15T00:00:00"),
      end: new Date("2026-01-15T23:59:59"),
    };
    assert.equal(isInPeriod(new Date("2026-01-15T12:00:00"), period), true);
    assert.equal(isInPeriod(new Date("2026-01-16T00:00:00"), period), false);
  });
});

describe("XP and leveling", () => {
  test("xpToNextLevel scales correctly", () => {
    assert.equal(xpToNextLevel(0), 100);
    assert.equal(xpToNextLevel(1), 125);
    assert.equal(xpToNextLevel(2), 150);
    assert.equal(xpToNextLevel(10), 350);
  });

  test("totalXpForLevel accumulates correctly", () => {
    assert.equal(totalXpForLevel(0), 0);
    assert.equal(totalXpForLevel(1), 100);
    assert.equal(totalXpForLevel(2), 225); // 100 + 125
    assert.equal(totalXpForLevel(3), 375); // 100 + 125 + 150
  });

  test("computeLevel calculates level from XP", () => {
    const result1 = computeLevel(0);
    assert.equal(result1.level, 0);
    assert.equal(result1.currentLevelXp, 0);
    assert.equal(result1.nextLevelXp, 100);

    const result2 = computeLevel(100);
    assert.equal(result2.level, 1);
    assert.equal(result2.currentLevelXp, 0);
    assert.equal(result2.nextLevelXp, 125);

    const result3 = computeLevel(150);
    assert.equal(result3.level, 1);
    assert.equal(result3.currentLevelXp, 50);
    assert.equal(result3.nextLevelXp, 125);
  });

  test("computeLevel handles large XP values", () => {
    const result = computeLevel(1000);
    assert.ok(result.level > 0);
    assert.ok(result.currentLevelXp >= 0);
    assert.ok(result.progress >= 0 && result.progress <= 1);
  });
});
