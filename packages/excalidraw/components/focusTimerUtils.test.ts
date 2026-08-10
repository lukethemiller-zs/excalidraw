import { describe, expect, it } from "vitest";

import {
  clampFocusTimerMinutes,
  createInitialFocusTimerState,
  expireFocusTimer,
  formatFocusTimerRemaining,
  getFocusTimerRemainingMs,
  pauseFocusTimer,
  resetFocusTimer,
  resumeFocusTimer,
  startFocusTimer,
} from "./focusTimerUtils";

describe("focusTimerUtils", () => {
  it("formats remaining time as MM:SS", () => {
    expect(formatFocusTimerRemaining(65_000)).toBe("01:05");
    expect(formatFocusTimerRemaining(0)).toBe("00:00");
  });

  it("starts, pauses, and resumes using wall-clock timestamps", () => {
    const now = 1_000_000;
    const running = startFocusTimer(
      { ...createInitialFocusTimerState(), durationMinutes: 1 },
      now,
    );

    expect(running.status).toBe("running");
    expect(getFocusTimerRemainingMs(running, now + 15_000)).toBe(45_000);

    const paused = pauseFocusTimer(running, now + 20_000);
    expect(paused.status).toBe("paused");
    expect(paused.pausedRemainingMs).toBe(40_000);

    const resumed = resumeFocusTimer(paused, now + 30_000);
    expect(resumed.status).toBe("running");
    expect(getFocusTimerRemainingMs(resumed, now + 45_000)).toBe(25_000);
  });

  it("expires and resets back to idle", () => {
    const now = 2_000_000;
    const running = startFocusTimer(
      { ...createInitialFocusTimerState(), durationMinutes: 5 },
      now,
    );
    const expired = expireFocusTimer(running);

    expect(expired.status).toBe("expired");
    expect(getFocusTimerRemainingMs(expired)).toBe(0);

    const reset = resetFocusTimer(10);
    expect(reset.status).toBe("idle");
    expect(reset.durationMinutes).toBe(10);
  });

  it("clamps custom durations", () => {
    expect(clampFocusTimerMinutes(0)).toBe(1);
    expect(clampFocusTimerMinutes(999)).toBe(120);
  });
});
