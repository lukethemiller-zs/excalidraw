import { act, fireEvent, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Excalidraw } from "../..";
import { t } from "../../i18n";
import { render } from "../../tests/test-utils";

import {
  formatRemainingMs,
  minutesToMs,
  useFocusTimer,
} from "./useFocusTimer";

describe("formatRemainingMs", () => {
  it("formats minutes and seconds", () => {
    expect(formatRemainingMs(minutesToMs(1))).toBe("1:00");
    expect(formatRemainingMs(65000)).toBe("1:05");
    expect(formatRemainingMs(500)).toBe("0:01");
  });
});

describe("useFocusTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down while running", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useFocusTimer(onExpire));

    act(() => {
      result.current.setDuration(minutesToMs(1));
    });
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.status).toBe("running");
    expect(result.current.remainingMs).toBeLessThan(minutesToMs(1));
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("pauses and resumes", () => {
    const { result } = renderHook(() => useFocusTimer());

    act(() => {
      result.current.setDuration(minutesToMs(1));
    });
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const remainingAfterPause = result.current.remainingMs;

    act(() => {
      result.current.pause();
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.status).toBe("paused");
    expect(result.current.remainingMs).toBe(remainingAfterPause);

    act(() => {
      result.current.resume();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.status).toBe("running");
    expect(result.current.remainingMs).toBeLessThan(remainingAfterPause);
  });

  it("resets to the selected duration", () => {
    const { result } = renderHook(() => useFocusTimer());

    act(() => {
      result.current.setDuration(minutesToMs(5));
    });
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.remainingMs).toBe(minutesToMs(5));
  });

  it("fires onExpire when time runs out", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useFocusTimer(onExpire));

    act(() => {
      result.current.setDuration(2000);
    });
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(result.current.status).toBe("expired");
    expect(result.current.remainingMs).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});

describe("FocusTimer UI", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  it("opens the panel and runs start/pause/resume/reset flow", async () => {
    vi.useFakeTimers();

    fireEvent.click(document.querySelector('[data-testid="focus-timer-button"]')!);

    expect(document.querySelector('[data-testid="focus-timer-panel"]')).toBeTruthy();

    fireEvent.click(document.querySelector('[data-testid="focus-timer-preset-1"]')!);
    expect(
      document.querySelector('[data-testid="focus-timer-display"]')?.textContent,
    ).toBe("1:00");

    fireEvent.click(document.querySelector('[data-testid="focus-timer-start"]')!);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(
      document.querySelector('[data-testid="focus-timer-display"]')?.textContent,
    ).not.toBe("1:00");

    fireEvent.click(document.querySelector('[data-testid="focus-timer-pause"]')!);
    const pausedDisplay = document.querySelector(
      '[data-testid="focus-timer-display"]',
    )?.textContent;

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(
      document.querySelector('[data-testid="focus-timer-display"]')?.textContent,
    ).toBe(pausedDisplay);

    fireEvent.click(document.querySelector('[data-testid="focus-timer-resume"]')!);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      document.querySelector('[data-testid="focus-timer-display"]')?.textContent,
    ).not.toBe(pausedDisplay);

    fireEvent.click(document.querySelector('[data-testid="focus-timer-reset"]')!);
    expect(
      document.querySelector('[data-testid="focus-timer-display"]')?.textContent,
    ).toBe("1:00");

    vi.useRealTimers();
  });

  it("shows expiry indication and toast", async () => {
    vi.useFakeTimers();

    fireEvent.click(document.querySelector('[data-testid="focus-timer-button"]')!);
    fireEvent.click(document.querySelector('[data-testid="focus-timer-preset-1"]')!);
    fireEvent.click(document.querySelector('[data-testid="focus-timer-start"]')!);

    act(() => {
      vi.advanceTimersByTime(minutesToMs(1) + 500);
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="focus-timer-expired"]')?.textContent,
      ).toBe(t("focusTimer.expired"));
    });

    expect(document.querySelector(".Toast__message")?.textContent).toBe(
      t("focusTimer.expired"),
    );

    vi.useRealTimers();
  });
});
