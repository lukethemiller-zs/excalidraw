import React from "react";

import { Excalidraw } from "../index";

import { fireEvent, render } from "./test-utils";

const { h } = window;

const getToolInput = (tool: string) =>
  document.querySelector(
    `[data-testid="toolbar-${tool}"]`,
  ) as HTMLInputElement;

describe("toolbar shape selection via mouse click", () => {
  beforeEach(async () => {
    await render(<Excalidraw handleKeyboardGlobally={true} />);
  });

  it("selects rectangle on click and updates checked state", () => {
    expect(h.state.activeTool.type).toBe("selection");
    expect(getToolInput("selection").checked).toBe(true);
    expect(getToolInput("rectangle").checked).toBe(false);

    fireEvent.click(getToolInput("rectangle").closest("label")!);

    expect(h.state.activeTool.type).toBe("rectangle");
    expect(getToolInput("rectangle").checked).toBe(true);
    expect(getToolInput("selection").checked).toBe(false);
  });

  it("selects diamond on pointer down/up (realistic click)", () => {
    const label = getToolInput("diamond").closest("label")!;

    fireEvent.pointerDown(label, { pointerType: "mouse" });
    fireEvent.pointerUp(label, { pointerType: "mouse" });
    fireEvent.click(label);

    expect(h.state.activeTool.type).toBe("diamond");
    expect(getToolInput("diamond").checked).toBe(true);
  });
});
