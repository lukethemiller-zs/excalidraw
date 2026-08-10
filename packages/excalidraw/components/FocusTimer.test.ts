import { describe, expect, it } from "vitest";

import {
  formatRemainingMs,
  getRemainingMs,
  minutesToMs,
  parseCustomMinutes,
} from "./FocusTimerUtils";

describe("FocusTimerUtils", () => {
  describe("formatRemainingMs", () => {
    it("formats minutes and seconds with zero padding", () => {
      expect(formatRemainingMs(minutesToMs(5))).toBe("05:00");
      expect(formatRemainingMs(90_000)).toBe("01:30");
      expect(formatRemainingMs(1_000)).toBe("00:01");
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

  describe("parseCustomMinutes", () => {
    it("accepts valid minute values", () => {
      expect(parseCustomMinutes("15")).toBe(15);
      expect(parseCustomMinutes(" 1 ")).toBe(1);
    });

    it("rejects empty, non-numeric, and out-of-range values", () => {
      expect(parseCustomMinutes("")).toBeNull();
      expect(parseCustomMinutes("abc")).toBeNull();
      expect(parseCustomMinutes("0")).toBeNull();
      expect(parseCustomMinutes("181")).toBeNull();
    });
  });
});
