import React from "react";

import { Excalidraw } from "../index";

import { fireEvent, render, waitFor } from "./test-utils";

/** Extra buffer beyond 1-minute preset so interval tick catches expiry. */
const TICK_BUFFER = 300;

describe("FocusTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ensureTimerPopoverOpen = () => {
    if (!document.querySelector(".FocusTimer__panel")) {
      fireEvent.click(
        document.querySelector(".FocusTimer__button") as HTMLButtonElement,
      );
    }
  };

  const getControl = (label: string) =>
    Array.from(document.querySelectorAll(".FocusTimer__control")).find(
      (el) => el.textContent === label,
    ) as HTMLButtonElement;

  it("opens popover and starts a preset countdown", async () => {
    await render(<Excalidraw />);

    ensureTimerPopoverOpen();

    fireEvent.click(getControl("Start"));

    const trigger = document.querySelector(".FocusTimer__button");
    expect(trigger?.textContent).toMatch(/5:00/);
  });

  it("pauses and resumes without losing remaining time", async () => {
    await render(<Excalidraw />);

    ensureTimerPopoverOpen();
    fireEvent.click(getControl("Start"));

    vi.advanceTimersByTime(60_000);

    await waitFor(() => {
      expect(document.querySelector(".FocusTimer__button")?.textContent).toMatch(
        /4:00/,
      );
    });

    fireEvent.click(getControl("Pause"));

    const pausedDisplay = document.querySelector(".FocusTimer__display");
    expect(pausedDisplay?.textContent).toMatch(/4:00/);

    vi.advanceTimersByTime(120_000);

    expect(document.querySelector(".FocusTimer__display")?.textContent).toMatch(
      /4:00/,
    );

    fireEvent.click(getControl("Resume"));

    vi.advanceTimersByTime(60_000);

    await waitFor(() => {
      expect(document.querySelector(".FocusTimer__display")?.textContent).toMatch(
        /3:00/,
      );
    });
  });

  it("resets to idle", async () => {
    await render(<Excalidraw />);

    ensureTimerPopoverOpen();
    fireEvent.click(getControl("Start"));

    fireEvent.click(getControl("Reset"));

    const trigger = document.querySelector(".FocusTimer__button");
    expect(trigger?.textContent).not.toMatch(/\d:\d{2}/);
    expect(
      getControl("Start"),
    ).not.toBeNull();
  });

  it("starts a custom hour and minute duration", async () => {
    await render(<Excalidraw />);

    ensureTimerPopoverOpen();

    const hoursInput = document.querySelector(
      'input[placeholder="0"]',
    ) as HTMLInputElement;
    const minutesInput = document.querySelector(
      'input[placeholder="5"]',
    ) as HTMLInputElement;

    fireEvent.change(hoursInput, { target: { value: "1" } });
    fireEvent.change(minutesInput, { target: { value: "30" } });
    fireEvent.click(getControl("Start"));

    expect(document.querySelector(".FocusTimer__button")?.textContent).toMatch(
      /1:30:00/,
    );
  });

  it("pausing at zero triggers expiry toast", async () => {
    await render(<Excalidraw />);

    ensureTimerPopoverOpen();
    fireEvent.click(document.querySelector(".FocusTimer__preset")!);
    fireEvent.click(getControl("Start"));

    vi.advanceTimersByTime(60_000);

    fireEvent.click(getControl("Pause"));

    await waitFor(() => {
      expect(document.querySelector(".Toast__message")?.textContent).toBe(
        "Time's up!",
      );
    });

    expect(document.querySelector(".FocusTimer__button--expired")).not.toBeNull();
  });

  it("fires expiry toast when countdown reaches zero", async () => {
    await render(<Excalidraw />);

    ensureTimerPopoverOpen();

    fireEvent.click(document.querySelector(".FocusTimer__preset")!);
    fireEvent.click(getControl("Start"));

    vi.advanceTimersByTime(60_000 + TICK_BUFFER);

    await waitFor(() => {
      expect(document.querySelector(".Toast__message")?.textContent).toBe(
        "Time's up!",
      );
    });

    expect(document.querySelector(".FocusTimer__button--expired")).not.toBeNull();
  });
});
