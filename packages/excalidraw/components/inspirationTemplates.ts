/** Starter canvas layouts inserted when an Inspiration suggestion is chosen. */
import { convertToExcalidrawElements } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

export type InspirationSuggestionId =
  | "generate-campaign-ideas"
  | "create-moodboard"
  | "explore-brand-colours";

const CAMPAIGN_BRIEF_TEXT = `Campaign Brief

• Objective:
• Target audience:
• Key message:
• Channels:`;

const MOODBOARD_COLORS = ["#fff3bf", "#ffc9c9", "#a5d8ff", "#b2f2bb"];
const BRAND_COLORS = ["#EB1000", "#FF6B00", "#1473E6", "#268E6C", "#6E40C9"];

const MOODBOARD_CELL_SIZE = 120;
const MOODBOARD_GAP = 12;
const BRAND_SWATCH_SIZE = 80;
const BRAND_SWATCH_GAP = 10;

/** Returns centered starter elements for the chosen inspiration flow. */
export const getInspirationStarterElements = (
  suggestionId: InspirationSuggestionId,
): ExcalidrawElement[] => {
  switch (suggestionId) {
    case "generate-campaign-ideas":
      return convertToExcalidrawElements([
        {
          type: "text",
          x: 0,
          y: 0,
          text: CAMPAIGN_BRIEF_TEXT,
          fontSize: 20,
        },
      ]);

    case "create-moodboard": {
      const gridWidth = MOODBOARD_CELL_SIZE * 2 + MOODBOARD_GAP;
      const gridHeight = MOODBOARD_CELL_SIZE * 2 + MOODBOARD_GAP;
      const originX = -gridWidth / 2;
      const originY = -gridHeight / 2;

      return convertToExcalidrawElements(
        MOODBOARD_COLORS.map((backgroundColor, index) => {
          const col = index % 2;
          const row = Math.floor(index / 2);

          return {
            type: "rectangle",
            x: originX + col * (MOODBOARD_CELL_SIZE + MOODBOARD_GAP),
            y: originY + row * (MOODBOARD_CELL_SIZE + MOODBOARD_GAP),
            width: MOODBOARD_CELL_SIZE,
            height: MOODBOARD_CELL_SIZE,
            backgroundColor,
            fillStyle: "solid",
            strokeWidth: 1,
            strokeColor: "#ced4da",
            roundness: { type: 3 },
          };
        }),
      );
    }

    case "explore-brand-colours": {
      const rowWidth =
        BRAND_COLORS.length * BRAND_SWATCH_SIZE +
        (BRAND_COLORS.length - 1) * BRAND_SWATCH_GAP;
      const originX = -rowWidth / 2;
      const originY = -BRAND_SWATCH_SIZE / 2;

      return convertToExcalidrawElements(
        BRAND_COLORS.map((backgroundColor, index) => ({
          type: "rectangle",
          x: originX + index * (BRAND_SWATCH_SIZE + BRAND_SWATCH_GAP),
          y: originY,
          width: BRAND_SWATCH_SIZE,
          height: BRAND_SWATCH_SIZE,
          backgroundColor,
          fillStyle: "solid",
          strokeWidth: 1,
          strokeColor: "#1e1e1e",
          roundness: { type: 3 },
        })),
      );
    }
  }
};
