/** Local workshop countdown timer for facilitators; lives in app chrome only. */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

const PRESETS_MINUTES = [1, 5, 10, 15] as const;
const DEFAULT_PRESET_MINUTES = 5;
const TICK_MS = 250;
const ADOBE_RED = "#EB1000";
const ADOBE_RED_DARK = "#C90E00";
const ADOBE_RED_HOVER = "#D30F00";

type TimerStatus = "idle" | "running" | "paused" | "expired";

const minutesToMs = (minutes: number) => minutes * 60 * 1000;

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const parseCustomMinutes = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 999) {
    return null;
  }
  return parsed;
};

/** Optional short beep when the countdown reaches zero. */
const playExpiryBeep = () => {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.value = 0.15;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
    window.setTimeout(() => {
      void ctx.close();
    }, 500);
  } catch {
    // Audio may be blocked or unavailable; expiry UI still signals completion.
  }
};

const buttonBaseStyle: CSSProperties = {
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  padding: "6px 10px",
};

/** Top-right workshop timer with presets, custom duration, and drift-free ticking. */
export const FocusTimer = () => {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedPresetMinutes, setSelectedPresetMinutes] = useState<number>(
    DEFAULT_PRESET_MINUTES,
  );
  const [customMinutes, setCustomMinutes] = useState("");
  const [durationMs, setDurationMs] = useState(
    minutesToMs(DEFAULT_PRESET_MINUTES),
  );
  const [remainingMs, setRemainingMs] = useState(
    minutesToMs(DEFAULT_PRESET_MINUTES),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const endTimestampRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearTickInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resolveDurationMs = useCallback(() => {
    const custom = parseCustomMinutes(customMinutes);
    if (custom !== null) {
      return minutesToMs(custom);
    }
    return minutesToMs(selectedPresetMinutes);
  }, [customMinutes, selectedPresetMinutes]);

  const handleExpiry = useCallback(() => {
    clearTickInterval();
    endTimestampRef.current = null;
    setRemainingMs(0);
    setStatus("expired");
    playExpiryBeep();
  }, [clearTickInterval]);

  // Drift-free tick: recompute remaining from endTimestamp rather than decrementing.
  useEffect(() => {
    if (status !== "running" || endTimestampRef.current === null) {
      clearTickInterval();
      return;
    }

    const tick = () => {
      const end = endTimestampRef.current;
      if (end === null) {
        return;
      }
      const nextRemaining = end - Date.now();
      if (nextRemaining <= 0) {
        handleExpiry();
        return;
      }
      setRemainingMs(nextRemaining);
    };

    tick();
    intervalRef.current = window.setInterval(tick, TICK_MS);

    return clearTickInterval;
  }, [status, clearTickInterval, handleExpiry]);

  useEffect(() => {
    return clearTickInterval;
  }, [clearTickInterval]);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPanelOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [isPanelOpen]);

  const selectPreset = (minutes: number) => {
    if (status === "running") {
      return;
    }
    setSelectedPresetMinutes(minutes);
    setCustomMinutes("");
    const nextDuration = minutesToMs(minutes);
    setDurationMs(nextDuration);
    setRemainingMs(nextDuration);
    if (status === "expired") {
      setStatus("idle");
    }
  };

  const onCustomChange = (value: string) => {
    if (status === "running") {
      return;
    }
    setCustomMinutes(value);
    const parsed = parseCustomMinutes(value);
    if (parsed !== null) {
      const nextDuration = minutesToMs(parsed);
      setDurationMs(nextDuration);
      setRemainingMs(nextDuration);
      if (status === "expired") {
        setStatus("idle");
      }
    }
  };

  const start = () => {
    const nextDuration = resolveDurationMs();
    setDurationMs(nextDuration);
    setRemainingMs(nextDuration);
    endTimestampRef.current = Date.now() + nextDuration;
    setStatus("running");
  };

  const pause = () => {
    if (endTimestampRef.current !== null) {
      setRemainingMs(Math.max(0, endTimestampRef.current - Date.now()));
    }
    endTimestampRef.current = null;
    clearTickInterval();
    setStatus("paused");
  };

  const resume = () => {
    endTimestampRef.current = Date.now() + remainingMs;
    setStatus("running");
  };

  const reset = () => {
    clearTickInterval();
    endTimestampRef.current = null;
    const nextDuration = resolveDurationMs();
    setDurationMs(nextDuration);
    setRemainingMs(nextDuration);
    setStatus("idle");
  };

  const togglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  const triggerLabel =
    status === "running" || status === "paused" || status === "expired"
      ? `⏱ ${formatTime(remainingMs)}`
      : "⏱ Timer";

  const canEditDuration = status === "idle" || status === "paused" || status === "expired";
  const displayTimeClass =
    status === "expired" ? "focus-timer__time focus-timer__time--expired" : "focus-timer__time";

  return (
    <>
      <style>{`
        @keyframes focus-timer-flash {
          0%, 100% { opacity: 1; color: ${ADOBE_RED}; }
          50% { opacity: 0.35; color: ${ADOBE_RED_DARK}; }
        }
        .focus-timer__time--expired {
          animation: focus-timer-flash 0.8s ease-in-out infinite;
        }
      `}</style>
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: "var(--zIndex-ui-top, 100)",
          fontFamily: "var(--ui-font, system-ui, sans-serif)",
        }}
      >
        <button
          type="button"
          aria-expanded={isPanelOpen}
          aria-haspopup="dialog"
          aria-label="Focus timer for workshops"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={togglePanel}
          style={{
            ...buttonBaseStyle,
            background: ADOBE_RED,
            color: "#fff",
            boxShadow: "0 2px 8px rgba(235, 16, 0, 0.35)",
            minWidth: 88,
          }}
        >
          {triggerLabel}
        </button>

        {isPanelOpen && (
          <div
            role="dialog"
            aria-label="Workshop timer"
            onPointerDown={(event) => event.stopPropagation()}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 260,
              padding: 12,
              borderRadius: 8,
              background: "#fff",
              border: "1px solid #e9ecef",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              {PRESETS_MINUTES.map((minutes) => {
                const isSelected =
                  !customMinutes && selectedPresetMinutes === minutes;
                return (
                  <button
                    key={minutes}
                    type="button"
                    disabled={!canEditDuration}
                    onClick={() => selectPreset(minutes)}
                    style={{
                      ...buttonBaseStyle,
                      background: isSelected ? ADOBE_RED : "#f1f3f5",
                      color: isSelected ? "#fff" : "#343a40",
                      opacity: canEditDuration ? 1 : 0.6,
                      cursor: canEditDuration ? "pointer" : "not-allowed",
                      flex: "1 1 44px",
                      minWidth: 44,
                    }}
                  >
                    {minutes}m
                  </button>
                );
              })}
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                fontSize: 12,
                color: "#495057",
              }}
            >
              Custom (min)
              <input
                type="number"
                min={1}
                max={999}
                value={customMinutes}
                disabled={!canEditDuration}
                onChange={(event) => onCustomChange(event.target.value)}
                placeholder={`${selectedPresetMinutes}`}
                style={{
                  flex: 1,
                  border: "1px solid #ced4da",
                  borderRadius: 6,
                  padding: "6px 8px",
                  fontSize: 13,
                }}
              />
            </label>

            <div
              className={displayTimeClass}
              style={{
                fontSize: 36,
                fontWeight: 700,
                textAlign: "center",
                marginBottom: 4,
                fontVariantNumeric: "tabular-nums",
                color: ADOBE_RED,
              }}
            >
              {formatTime(remainingMs)}
            </div>

            {status === "expired" && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: ADOBE_RED,
                  marginBottom: 10,
                }}
              >
                Time&apos;s up!
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {(status === "idle" || status === "expired") && (
                <button
                  type="button"
                  onClick={start}
                  style={{
                    ...buttonBaseStyle,
                    background: ADOBE_RED,
                    color: "#fff",
                  }}
                >
                  Start
                </button>
              )}
              {status === "running" && (
                <button
                  type="button"
                  onClick={pause}
                  style={{
                    ...buttonBaseStyle,
                    background: ADOBE_RED_HOVER,
                    color: "#fff",
                  }}
                >
                  Pause
                </button>
              )}
              {status === "paused" && (
                <button
                  type="button"
                  onClick={resume}
                  style={{
                    ...buttonBaseStyle,
                    background: ADOBE_RED,
                    color: "#fff",
                  }}
                >
                  Resume
                </button>
              )}
              {status !== "idle" && (
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    ...buttonBaseStyle,
                    background: "#f1f3f5",
                    color: "#343a40",
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
