import { describe, expect, it } from "vitest";

import {
  clampCustomMinutes,
  createInitialTimerState,
  focusTimerReducer,
  formatRemaining,
  minutesToSeconds,
  pauseTimer,
  resetTimer,
  resumeTimer,
  setDuration,
  startTimer,
  tickTimer,
} from "./focusTimerUtils";

describe("focusTimerUtils", () => {
  describe("formatRemaining", () => {
    it("formats seconds as MM:SS", () => {
      expect(formatRemaining(0)).toBe("00:00");
      expect(formatRemaining(65)).toBe("01:05");
      expect(formatRemaining(600)).toBe("10:00");
      expect(formatRemaining(3599)).toBe("59:59");
    });

    it("clamps negative values to zero", () => {
      expect(formatRemaining(-10)).toBe("00:00");
    });
  });

  describe("clampCustomMinutes", () => {
    it("clamps to minimum of 1", () => {
      expect(clampCustomMinutes(0)).toBe(1);
      expect(clampCustomMinutes(-5)).toBe(1);
      expect(clampCustomMinutes(Number.NaN)).toBe(1);
    });

    it("clamps to maximum of 120", () => {
      expect(clampCustomMinutes(999)).toBe(120);
    });

    it("floors fractional minutes", () => {
      expect(clampCustomMinutes(7.9)).toBe(7);
    });
  });

  describe("minutesToSeconds", () => {
    it("converts minutes to seconds", () => {
      expect(minutesToSeconds(5)).toBe(300);
    });
  });

  describe("state transitions", () => {
    it("creates initial state from default duration", () => {
      expect(createInitialTimerState(minutesToSeconds(10))).toEqual({
        durationSeconds: 600,
        remainingSeconds: 600,
        status: "idle",
      });
    });

    it("sets duration and resets to idle", () => {
      const running = startTimer(createInitialTimerState(60));
      const paused = pauseTimer(running);

      expect(setDuration(120)).toEqual({
        durationSeconds: 120,
        remainingSeconds: 120,
        status: "idle",
      });
      expect(paused.status).toBe("paused");
    });

    it("starts, pauses, resumes, and resets", () => {
      let state = createInitialTimerState(10);

      state = startTimer(state);
      expect(state.status).toBe("running");

      state = pauseTimer(state);
      expect(state.status).toBe("paused");
      expect(state.remainingSeconds).toBe(10);

      state = resumeTimer(state);
      expect(state.status).toBe("running");

      state = resetTimer({ ...state, remainingSeconds: 4 });
      expect(state).toEqual({
        durationSeconds: 10,
        remainingSeconds: 10,
        status: "idle",
      });
    });

    it("ticks down while running and expires at zero", () => {
      let state = startTimer(createInitialTimerState(2));

      state = tickTimer(state);
      expect(state.remainingSeconds).toBe(1);
      expect(state.status).toBe("running");

      state = tickTimer(state);
      expect(state.remainingSeconds).toBe(0);
      expect(state.status).toBe("expired");
    });

    it("ignores ticks when paused or idle", () => {
      const idle = tickTimer(createInitialTimerState(30));
      expect(idle.remainingSeconds).toBe(30);

      const paused = tickTimer(pauseTimer(startTimer(createInitialTimerState(30))));
      expect(paused.remainingSeconds).toBe(30);
      expect(paused.status).toBe("paused");
    });

    it("restarts from full duration after expiry", () => {
      const expired = {
        durationSeconds: 60,
        remainingSeconds: 0,
        status: "expired" as const,
      };

      const restarted = startTimer(expired);
      expect(restarted).toEqual({
        durationSeconds: 60,
        remainingSeconds: 60,
        status: "running",
      });
    });
  });

  describe("focusTimerReducer", () => {
    it("handles reducer actions", () => {
      let state = createInitialTimerState(minutesToSeconds(5));

      state = focusTimerReducer(state, {
        type: "SET_DURATION",
        durationSeconds: 90,
      });
      expect(state.durationSeconds).toBe(90);

      state = focusTimerReducer(state, { type: "START" });
      state = focusTimerReducer(state, { type: "TICK" });
      expect(state.remainingSeconds).toBe(89);

      state = focusTimerReducer(state, { type: "PAUSE" });
      state = focusTimerReducer(state, { type: "RESUME" });
      state = focusTimerReducer(state, { type: "RESET" });

      expect(state).toEqual({
        durationSeconds: 90,
        remainingSeconds: 90,
        status: "idle",
      });
    });
  });
});
