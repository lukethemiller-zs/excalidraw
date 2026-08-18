import { fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FocusTimer, formatRemainingTime } from "./FocusTimer";

const openTimerPanel = () => {
  fireEvent.click(screen.getByTestId("focus-timer-trigger"));
};

describe("formatRemainingTime", () => {
  it("formats minutes and seconds", () => {
    expect(formatRemainingTime(65000)).toBe("1:05");
    expect(formatRemainingTime(60000)).toBe("1:00");
    expect(formatRemainingTime(0)).toBe("0:00");
  });
});

describe("FocusTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("selecting a preset updates the readout", () => {
    render(<FocusTimer />);
    openTimerPanel();

    fireEvent.click(screen.getByTestId("focus-timer-preset-1"));
    expect(screen.getByTestId("focus-timer-readout")).toHaveTextContent("1:00");

    fireEvent.click(screen.getByTestId("focus-timer-preset-15"));
    expect(screen.getByTestId("focus-timer-readout")).toHaveTextContent(
      "15:00",
    );
  });

  it("starts the countdown when Start is clicked", () => {
    render(<FocusTimer />);
    openTimerPanel();

    fireEvent.click(screen.getByTestId("focus-timer-preset-1"));
    fireEvent.click(screen.getByTestId("focus-timer-start"));

    expect(screen.getByTestId("focus-timer-pause")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId("focus-timer-readout")).toHaveTextContent("0:55");
  });

  it("pauses and freezes the remaining time", () => {
    render(<FocusTimer />);
    openTimerPanel();

    fireEvent.click(screen.getByTestId("focus-timer-preset-1"));
    fireEvent.click(screen.getByTestId("focus-timer-start"));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    fireEvent.click(screen.getByTestId("focus-timer-pause"));
    expect(screen.getByTestId("focus-timer-readout")).toHaveTextContent("0:50");

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.getByTestId("focus-timer-readout")).toHaveTextContent("0:50");
  });

  it("resumes the countdown after pausing", () => {
    render(<FocusTimer />);
    openTimerPanel();

    fireEvent.click(screen.getByTestId("focus-timer-preset-1"));
    fireEvent.click(screen.getByTestId("focus-timer-start"));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    fireEvent.click(screen.getByTestId("focus-timer-pause"));
    fireEvent.click(screen.getByTestId("focus-timer-resume"));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId("focus-timer-readout")).toHaveTextContent("0:45");
  });

  it("returns to idle when Reset is clicked", () => {
    render(<FocusTimer />);
    openTimerPanel();

    fireEvent.click(screen.getByTestId("focus-timer-preset-5"));
    fireEvent.click(screen.getByTestId("focus-timer-start"));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    fireEvent.click(screen.getByTestId("focus-timer-reset"));

    expect(screen.getByTestId("focus-timer-start")).toBeInTheDocument();
    expect(screen.getByTestId("focus-timer-presets")).toBeInTheDocument();
    expect(screen.getByTestId("focus-timer-readout")).toHaveTextContent("5:00");
  });

  it("shows expiry state when time runs out", () => {
    render(<FocusTimer />);
    openTimerPanel();

    fireEvent.click(screen.getByTestId("focus-timer-preset-1"));
    fireEvent.click(screen.getByTestId("focus-timer-start"));

    act(() => {
      vi.advanceTimersByTime(61000);
    });

    expect(screen.getByTestId("focus-timer-expired")).toHaveTextContent(
      "Time's up!",
    );
    expect(screen.getByTestId("focus-timer-reset")).toBeInTheDocument();
  });
});
