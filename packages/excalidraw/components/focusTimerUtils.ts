/** Pure helpers for the workshop Focus Timer state machine and display formatting. */

export const TIMER_PRESETS = [1, 5, 10, 15] as const;

export const MAX_CUSTOM_MINUTES = 120;

export const DEFAULT_PRESET_MINUTES = 5;

export type FocusTimerStatus = "idle" | "running" | "paused" | "expired";

export type FocusTimerState = {
  durationSeconds: number;
  remainingSeconds: number;
  status: FocusTimerStatus;
};

export type FocusTimerAction =
  | { type: "SET_DURATION"; durationSeconds: number }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "TICK" };

export const minutesToSeconds = (minutes: number) => minutes * 60;

export const formatRemaining = (seconds: number): string => {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const clampCustomMinutes = (value: number): number => {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }
  return Math.min(Math.floor(value), MAX_CUSTOM_MINUTES);
};

export const tickRemaining = (remainingSeconds: number): number =>
  Math.max(0, remainingSeconds - 1);

export const isExpired = (remainingSeconds: number): boolean =>
  remainingSeconds <= 0;

export const createInitialTimerState = (
  durationSeconds: number = minutesToSeconds(DEFAULT_PRESET_MINUTES),
): FocusTimerState => ({
  durationSeconds,
  remainingSeconds: durationSeconds,
  status: "idle",
});

export const setDuration = (durationSeconds: number): FocusTimerState => ({
  durationSeconds,
  remainingSeconds: durationSeconds,
  status: "idle",
});

export const startTimer = (state: FocusTimerState): FocusTimerState => {
  if (state.status === "running") {
    return state;
  }

  const remainingSeconds =
    state.status === "expired" ? state.durationSeconds : state.remainingSeconds;

  return {
    ...state,
    remainingSeconds,
    status: "running",
  };
};

export const pauseTimer = (state: FocusTimerState): FocusTimerState => {
  if (state.status !== "running") {
    return state;
  }

  return {
    ...state,
    status: "paused",
  };
};

export const resumeTimer = (state: FocusTimerState): FocusTimerState => {
  if (state.status !== "paused") {
    return state;
  }

  return {
    ...state,
    status: "running",
  };
};

export const resetTimer = (state: FocusTimerState): FocusTimerState => ({
  durationSeconds: state.durationSeconds,
  remainingSeconds: state.durationSeconds,
  status: "idle",
});

export const tickTimer = (state: FocusTimerState): FocusTimerState => {
  if (state.status !== "running") {
    return state;
  }

  const remainingSeconds = tickRemaining(state.remainingSeconds);

  if (isExpired(remainingSeconds)) {
    return {
      ...state,
      remainingSeconds: 0,
      status: "expired",
    };
  }

  return {
    ...state,
    remainingSeconds,
  };
};

export const focusTimerReducer = (
  state: FocusTimerState,
  action: FocusTimerAction,
): FocusTimerState => {
  switch (action.type) {
    case "SET_DURATION":
      return setDuration(action.durationSeconds);
    case "START":
      return startTimer(state);
    case "PAUSE":
      return pauseTimer(state);
    case "RESUME":
      return resumeTimer(state);
    case "RESET":
      return resetTimer(state);
    case "TICK":
      return tickTimer(state);
    default:
      return state;
  }
};

export const canEditDuration = (status: FocusTimerStatus): boolean =>
  status === "idle" || status === "paused" || status === "expired";
