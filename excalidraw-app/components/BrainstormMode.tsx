import {
  CaptureUpdateAction,
  convertToExcalidrawElements,
  useExcalidrawAPI,
} from "@excalidraw/excalidraw";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getStickyPosition,
  isBrainstormToggle,
  isEditableTarget,
  STICKY_HEIGHT,
  STICKY_WIDTH,
} from "./brainstormModeHelpers";

const STICKY_PALETTE = ["#fff3bf", "#ffc9c9", "#a5d8ff", "#b2f2bb"];

/** Rapid sticky-note capture overlay toggled by Cmd/Ctrl+Shift+B. */
export const BrainstormMode = () => {
  // useExcalidrawAPI is the supported hook; useAdobeWhiteboardAPI never existed as an export.
  const excalidrawAPI = useExcalidrawAPI();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [dropIndex, setDropIndex] = useState(0);

  const close = useCallback(() => {
    setIsOpen(false);
    setText("");
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setText("");
        return false;
      }
      setColorIndex(0);
      setDropIndex(0);
      setText("");
      return true;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isBrainstormToggle(event) || isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      toggle();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const addSticky = useCallback(() => {
    const trimmedText = text.trim();
    if (!trimmedText || !excalidrawAPI) {
      return;
    }

    const appState = excalidrawAPI.getAppState();
    const { scrollX, scrollY, width, height, zoom } = appState;
    const { x, y } = getStickyPosition(
      scrollX,
      scrollY,
      width,
      height,
      zoom.value,
      dropIndex,
    );

    const backgroundColor =
      STICKY_PALETTE[colorIndex % STICKY_PALETTE.length];

    const newElements = convertToExcalidrawElements([
      {
        type: "rectangle",
        x,
        y,
        width: STICKY_WIDTH,
        height: STICKY_HEIGHT,
        backgroundColor,
        fillStyle: "solid",
        strokeWidth: 1,
        strokeColor: "#1e1e1e",
        roundness: null,
        label: {
          text: trimmedText,
          fontSize: 20,
          strokeColor: "#1e1e1e",
        },
      },
    ]);

    excalidrawAPI.updateScene({
      elements: [
        ...excalidrawAPI.getSceneElementsIncludingDeleted(),
        ...newElements,
      ],
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });

    setColorIndex((prev) => prev + 1);
    setDropIndex((prev) => prev + 1);
    setText("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [excalidrawAPI, colorIndex, dropIndex, text]);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSticky();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  if (!isOpen) {
    return null;
  }

  const nextColor = STICKY_PALETTE[colorIndex % STICKY_PALETTE.length];

  return (
    <>
      <style>{`
        .brainstorm-mode-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 4,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 8,
        background: "#e03131",
        border: "1px solid #c92a2a",
        boxShadow: "0 4px 12px rgba(224, 49, 49, 0.35)",
        minWidth: 320,
        maxWidth: "min(480px, calc(100vw - 32px))",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          backgroundColor: nextColor,
          border: "1px solid rgba(0, 0, 0, 0.1)",
          flexShrink: 0,
        }}
      />
      <input
        ref={inputRef}
        className="brainstorm-mode-input"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onInputKeyDown}
        placeholder="Type an idea..."
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          color: "#fff",
          fontSize: 14,
          minWidth: 0,
        }}
      />
      <span
        style={{
          fontSize: 11,
          color: "#fff",
          opacity: 0.85,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Enter to add · Esc to exit
      </span>
      <button
        type="button"
        aria-label="Close brainstorm mode"
        onClick={close}
        style={{
          border: "none",
          background: "transparent",
          color: "#fff",
          opacity: 0.85,
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          padding: "0 4px",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
    </>
  );
};
