import React from "react";

import { CODES } from "@excalidraw/common";

import { actionToggleFocusMode } from "./actionToggleFocusMode";
import { Excalidraw } from "../index";
import { API } from "../tests/helpers/api";
import { Keyboard } from "../tests/helpers/ui";
import { render } from "../tests/test-utils";

const { h } = window;

describe("actionToggleFocusMode", () => {
  beforeEach(async () => {
    await render(<Excalidraw handleKeyboardGlobally />);
  });

  it("toggles focusModeEnabled via the action", () => {
    expect(h.state.focusModeEnabled).toBe(false);

    API.executeAction(actionToggleFocusMode);
    expect(h.state.focusModeEnabled).toBe(true);

    API.executeAction(actionToggleFocusMode);
    expect(h.state.focusModeEnabled).toBe(false);
  });

  it("toggles focusModeEnabled with Alt+F", () => {
    expect(h.state.focusModeEnabled).toBe(false);

    Keyboard.withModifierKeys({ alt: true }, () => {
      Keyboard.codePress(CODES.F);
    });
    expect(h.state.focusModeEnabled).toBe(true);

    Keyboard.withModifierKeys({ alt: true }, () => {
      Keyboard.codePress(CODES.F);
    });
    expect(h.state.focusModeEnabled).toBe(false);
  });

  it("reports checked state from appState", () => {
    expect(actionToggleFocusMode.checked!(h.state)).toBe(false);
    API.executeAction(actionToggleFocusMode);
    expect(actionToggleFocusMode.checked!(h.state)).toBe(true);
  });
});
