/**
 * Unit coverage for BrainstormMode shortcut and sticky placement helpers.
 */
import { describe, expect, it } from "vitest";

import {
  CASCADE_STEP,
  CASCADE_WRAP,
  getStickyPosition,
  isBrainstormToggle,
  isEditableTarget,
  STICKY_HEIGHT,
  STICKY_WIDTH,
} from "../components/brainstormModeHelpers";

describe("brainstormModeHelpers", () => {
  describe("isBrainstormToggle", () => {
    it("matches Cmd/Ctrl+Shift+B", () => {
      expect(
        isBrainstormToggle({
          code: "KeyB",
          shiftKey: true,
          metaKey: true,
          ctrlKey: false,
        }),
      ).toBe(true);
      expect(
        isBrainstormToggle({
          code: "KeyB",
          shiftKey: true,
          metaKey: false,
          ctrlKey: true,
        }),
      ).toBe(true);
    });

    it("rejects incomplete shortcut chords", () => {
      expect(
        isBrainstormToggle({
          code: "KeyB",
          shiftKey: false,
          metaKey: true,
          ctrlKey: false,
        }),
      ).toBe(false);
      expect(
        isBrainstormToggle({
          code: "KeyA",
          shiftKey: true,
          metaKey: true,
          ctrlKey: false,
        }),
      ).toBe(false);
    });
  });

  describe("isEditableTarget", () => {
    it("returns false for non-elements", () => {
      expect(isEditableTarget(null)).toBe(false);
      expect(isEditableTarget(document)).toBe(false);
    });

    it("detects typical editable targets", () => {
      const input = document.createElement("input");
      const textarea = document.createElement("textarea");
      const select = document.createElement("select");
      const editable = document.createElement("div");
      editable.contentEditable = "true";
      const plain = document.createElement("div");

      expect(isEditableTarget(input)).toBe(true);
      expect(isEditableTarget(textarea)).toBe(true);
      expect(isEditableTarget(select)).toBe(true);
      expect(isEditableTarget(editable)).toBe(true);
      expect(isEditableTarget(plain)).toBe(false);
    });
  });

  describe("getStickyPosition", () => {
    it("centers the first sticky in the viewport", () => {
      const position = getStickyPosition(0, 0, 1000, 800, 1, 0);
      expect(position).toEqual({
        x: 1000 / 2 - STICKY_WIDTH / 2,
        y: 800 / 2 - STICKY_HEIGHT / 2,
      });
    });

    it("cascades within a row then wraps to the next row", () => {
      const first = getStickyPosition(10, 20, 1000, 800, 1, 0);
      const nextInRow = getStickyPosition(10, 20, 1000, 800, 1, 1);
      const wrapped = getStickyPosition(10, 20, 1000, 800, 1, CASCADE_WRAP);

      expect(nextInRow).toEqual({
        x: first.x + CASCADE_STEP,
        y: first.y,
      });
      expect(wrapped).toEqual({
        x: first.x,
        y: first.y + CASCADE_STEP,
      });
    });
  });
});
