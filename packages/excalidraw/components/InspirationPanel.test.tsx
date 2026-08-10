/** Verifies Inspiration suggestions insert starter canvas content. */
import React from "react";
import { fireEvent, queryByText } from "@testing-library/react";

import { Excalidraw } from "../index";
import { render, waitFor } from "../tests/test-utils";

const { h } = window;

describe("InspirationPanel", () => {
  const openInspirationPanel = async (container: HTMLElement) => {
    const trigger = queryByText(container, "✨ Inspiration");
    expect(trigger).not.toBeNull();
    fireEvent.click(trigger!);
    return trigger!;
  };

  it("inserts a campaign brief when Generate campaign ideas is chosen", async () => {
    const { container } = await render(<Excalidraw />);
    expect(h.elements).toHaveLength(0);

    await openInspirationPanel(container);

    const suggestion = queryByText(container, "Generate campaign ideas");
    expect(suggestion).not.toBeNull();
    fireEvent.click(suggestion!);

    await waitFor(() => {
      expect(h.elements).toHaveLength(1);
      expect(h.elements[0].type).toBe("text");
      expect((h.elements[0] as { text: string }).text).toContain(
        "Campaign Brief",
      );
    });
  });

  it("inserts a moodboard grid when Create a moodboard is chosen", async () => {
    const { container } = await render(<Excalidraw />);

    await openInspirationPanel(container);

    const suggestion = queryByText(container, "Create a moodboard");
    expect(suggestion).not.toBeNull();
    fireEvent.click(suggestion!);

    await waitFor(() => {
      expect(h.elements).toHaveLength(4);
      expect(h.elements.every((element) => element.type === "rectangle")).toBe(
        true,
      );
    });
  });

  it("inserts brand colour swatches when Explore brand colours is chosen", async () => {
    const { container } = await render(<Excalidraw />);

    await openInspirationPanel(container);

    const suggestion = queryByText(container, "Explore brand colours");
    expect(suggestion).not.toBeNull();
    fireEvent.click(suggestion!);

    await waitFor(() => {
      expect(h.elements).toHaveLength(5);
      expect(h.elements.every((element) => element.type === "rectangle")).toBe(
        true,
      );
      expect(
        h.elements.map(
          (element) => (element as { backgroundColor: string }).backgroundColor,
        ),
      ).toEqual(["#EB1000", "#FF6B00", "#1473E6", "#268E6C", "#6E40C9"]);
    });
  });

  it("closes the popover after a suggestion is chosen", async () => {
    const { container } = await render(<Excalidraw />);
    const trigger = await openInspirationPanel(container);

    const suggestion = queryByText(container, "Generate campaign ideas");
    fireEvent.click(suggestion!);

    await waitFor(() => {
      expect(queryByText(container, "Get inspired")).toBeNull();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });
});
