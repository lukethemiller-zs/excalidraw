import { describe, expect, it } from "vitest";

import {
  formatRemainingMs,
  getRemainingMs,
  minutesToMs,
  parseCustomDuration,
} from "./FocusTimerUtils";

describe("FocusTimerUtils", () => {
  describe("formatRemainingMs", () => {
    it("formats minutes and seconds with zero padding", () => {
      expect(formatRemainingMs(minutesToMs(5))).toBe("05:00");
      expect(formatRemainingMs(90_000)).toBe("01:30");
      expect(formatRemainingMs(1_000)).toBe("00:01");
    });

    it("formats hours when duration is one hour or longer", () => {
      expect(formatRemainingMs(minutesToMs(60))).toBe("01:00:00");
      expect(formatRemainingMs(minutesToMs(90))).toBe("01:30:00");
      expect(formatRemainingMs(minutesToMs(125))).toBe("02:05:00");
    });

    it("never shows negative values", () => {
      expect(formatRemainingMs(-500)).toBe("00:00");
    });
  });

  describe("getRemainingMs", () => {
    const now = 1_000_000;

    it("derives remaining time from endsAt while running", () => {
      expect(getRemainingMs("running", now + 30_000, null, now)).toBe(30_000);
    });

    it("returns paused snapshot while paused", () => {
      expect(getRemainingMs("paused", null, 12_000, now)).toBe(12_000);
    });

    it("returns zero when expired or idle", () => {
      expect(getRemainingMs("expired", null, null, now)).toBe(0);
      expect(getRemainingMs("idle", null, null, now)).toBe(0);
    });
  });

  describe("parseCustomDuration", () => {
    it("accepts hours and minutes", () => {
      expect(parseCustomDuration("1", "30")).toBe(90);
      expect(parseCustomDuration("2", "0")).toBe(120);
      expect(parseCustomDuration("0", "15")).toBe(15);
    });

    it("accepts hours-only or minutes-only input", () => {
      expect(parseCustomDuration("1", "")).toBe(60);
      expect(parseCustomDuration("", "45")).toBe(45);
    });

    it("rejects empty, non-numeric, and out-of-range values", () => {
      expect(parseCustomDuration("", "")).toBeNull();
      expect(parseCustomDuration("abc", "15")).toBeNull();
      expect(parseCustomDuration("1", "abc")).toBeNull();
      expect(parseCustomDuration("0", "0")).toBeNull();
      expect(parseCustomDuration("24", "0")).toBeNull();
      expect(parseCustomDuration("1", "60")).toBeNull();
    });
  });
});
