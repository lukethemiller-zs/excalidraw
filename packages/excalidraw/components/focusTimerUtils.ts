/** Pure helpers for the workshop focus timer state machine. */

export type FocusTimerStatus = "idle" | "running" | "paused" | "expired";

export const FOCUS_TIMER_PRESETS_MINUTES = [1, 5, 10, 15] as const;

export const DEFAULT_FOCUS_TIMER_MINUTES = 5;

export const MIN_FOCUS_TIMER_MINUTES = 1;

export const MAX_FOCUS_TIMER_MINUTES = 120;

export type FocusTimerState = {
  status: FocusTimerStatus;
  /** Wall-clock expiry timestamp while running. */
  endsAt: number | null;
  /** Remaining milliseconds while paused. */
  pausedRemainingMs: number | null;
  /** Selected duration in minutes before start or after reset. */
  durationMinutes: number;
};

export const createInitialFocusTimerState = (): FocusTimerState => ({
  status: "idle",
  endsAt: null,
  pausedRemainingMs: null,
  durationMinutes: DEFAULT_FOCUS_TIMER_MINUTES,
});

/** Format milliseconds as MM:SS for the countdown display. */
export const formatFocusTimerRemaining = (remainingMs: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
};

export const clampFocusTimerMinutes = (minutes: number): number =>
  Math.min(
    MAX_FOCUS_TIMER_MINUTES,
    Math.max(MIN_FOCUS_TIMER_MINUTES, Math.floor(minutes)),
  );

export const getFocusTimerRemainingMs = (
  state: FocusTimerState,
  now: number = Date.now(),
): number => {
  if (state.status === "running" && state.endsAt != null) {
    return Math.max(0, state.endsAt - now);
  }
  if (state.status === "paused" && state.pausedRemainingMs != null) {
    return state.pausedRemainingMs;
  }
  if (state.status === "expired") {
    return 0;
  }
  return state.durationMinutes * 60_000;
};

export const startFocusTimer = (
  state: FocusTimerState,
  now: number = Date.now(),
): FocusTimerState => {
  const durationMinutes = clampFocusTimerMinutes(state.durationMinutes);
  return {
    status: "running",
    endsAt: now + durationMinutes * 60_000,
    pausedRemainingMs: null,
    durationMinutes,
  };
};

export const pauseFocusTimer = (
  state: FocusTimerState,
  now: number = Date.now(),
): FocusTimerState => {
  if (state.status !== "running" || state.endsAt == null) {
    return state;
  }
  return {
    ...state,
    status: "paused",
    endsAt: null,
    pausedRemainingMs: Math.max(0, state.endsAt - now),
  };
};

export const resumeFocusTimer = (
  state: FocusTimerState,
  now: number = Date.now(),
): FocusTimerState => {
  if (state.status !== "paused" || state.pausedRemainingMs == null) {
    return state;
  }
  return {
    ...state,
    status: "running",
    endsAt: now + state.pausedRemainingMs,
    pausedRemainingMs: null,
  };
};

export const resetFocusTimer = (
  durationMinutes: number = DEFAULT_FOCUS_TIMER_MINUTES,
): FocusTimerState => ({
  status: "idle",
  endsAt: null,
  pausedRemainingMs: null,
  durationMinutes: clampFocusTimerMinutes(durationMinutes),
});

export const expireFocusTimer = (state: FocusTimerState): FocusTimerState => ({
  ...state,
  status: "expired",
  endsAt: null,
  pausedRemainingMs: 0,
});

export const isFocusTimerActive = (state: FocusTimerState): boolean =>
  state.status === "running" ||
  state.status === "paused" ||
  state.status === "expired";
