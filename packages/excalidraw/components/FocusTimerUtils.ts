/** Pure helpers for the workshop countdown timer (testable, no React). */

export const PRESET_MINUTES = [1, 5, 10, 15] as const;

export const MINUTES_TO_MS = 60 * 1000;

export const MAX_CUSTOM_MINUTES = 180;

export type TimerStatus = "idle" | "running" | "paused" | "expired";

export const minutesToMs = (minutes: number) => minutes * MINUTES_TO_MS;

/** Format milliseconds as MM:SS for display. */
export const formatRemainingMs = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

/** Derive remaining time from wall-clock endsAt to avoid drift in background tabs. */
export const getRemainingMs = (
  status: TimerStatus,
  endsAt: number | null,
  pausedRemainingMs: number | null,
  now: number,
) => {
  if (status === "running" && endsAt != null) {
    return Math.max(0, endsAt - now);
  }
  if (status === "paused" && pausedRemainingMs != null) {
    return pausedRemainingMs;
  }
  return 0;
};

/** Validate custom minutes input; returns null when invalid or empty. */
export const parseCustomMinutes = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (
    !Number.isFinite(parsed) ||
    parsed < 1 ||
    parsed > MAX_CUSTOM_MINUTES
  ) {
    return null;
  }
  return parsed;
};
