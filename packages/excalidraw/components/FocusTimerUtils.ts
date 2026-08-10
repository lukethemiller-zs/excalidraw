/** Pure helpers for the workshop countdown timer (testable, no React). */

export const PRESET_MINUTES = [1, 5, 10, 15] as const;

export const MINUTES_TO_MS = 60 * 1000;

export const MAX_CUSTOM_HOURS = 23;
export const MAX_CUSTOM_MINUTES_FIELD = 59;

export type TimerStatus = "idle" | "running" | "paused" | "expired";

export const minutesToMs = (minutes: number) => minutes * MINUTES_TO_MS;

/** Format milliseconds as MM:SS, or HH:MM:SS when an hour or more remains. */
export const formatRemainingMs = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

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

const parseDurationField = (
  value: string,
  max: number,
): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) {
    return null;
  }
  return parsed;
};

/** Validate custom hours/minutes inputs; returns total minutes or null when invalid/empty. */
export const parseCustomDuration = (
  hoursValue: string,
  minutesValue: string,
): number | null => {
  const hasHours = hoursValue.trim().length > 0;
  const hasMinutes = minutesValue.trim().length > 0;

  if (!hasHours && !hasMinutes) {
    return null;
  }

  const hours = hasHours
    ? parseDurationField(hoursValue, MAX_CUSTOM_HOURS)
    : 0;
  const minutes = hasMinutes
    ? parseDurationField(minutesValue, MAX_CUSTOM_MINUTES_FIELD)
    : 0;

  if (hours == null || minutes == null) {
    return null;
  }

  const totalMinutes = hours * 60 + minutes;
  if (totalMinutes < 1) {
    return null;
  }

  return totalMinutes;
};
