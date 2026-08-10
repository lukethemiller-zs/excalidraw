/** Covers Inspiration Panel open/close and dialog accessibility wiring. */
import React from "react";

import { Excalidraw } from "../index";
import {
  fireEvent,
  queryByText,
  render,
  waitFor,
} from "../tests/test-utils";

import {
  INSPIRATION_PANEL_ID,
  INSPIRATION_PANEL_TITLE_ID,
} from "./InspirationPanel";

describe("InspirationPanel", () => {
  it("exposes dialog a11y attributes when opened and closes on suggestion click", async () => {
    const { container } = await render(<Excalidraw />);

    const trigger = queryByText(container, "✨ Inspiration");
    expect(trigger).not.toBeNull();
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", INSPIRATION_PANEL_ID);
    expect(container.querySelector(`#${INSPIRATION_PANEL_ID}`)).toBeNull();

    fireEvent.click(trigger!);

    await waitFor(() => {
      const dialog = container.querySelector(`#${INSPIRATION_PANEL_ID}`);
      expect(dialog).not.toBeNull();
      expect(dialog).toHaveAttribute("role", "dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute(
        "aria-labelledby",
        INSPIRATION_PANEL_TITLE_ID,
      );
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(
        container.querySelector(`#${INSPIRATION_PANEL_TITLE_ID}`),
      ).toHaveTextContent("Get inspired");
    });

    const suggestion = queryByText(container, "Generate campaign ideas");
    expect(suggestion).not.toBeNull();
    fireEvent.click(suggestion!);

    await waitFor(() => {
      expect(container.querySelector(`#${INSPIRATION_PANEL_ID}`)).toBeNull();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });
});
