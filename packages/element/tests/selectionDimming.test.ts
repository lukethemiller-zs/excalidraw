import { shouldReduceAlphaForSelection } from "../src/selectionDimming";

const baseState = {
  openDialog: null as { name: string } | null,
  focusModeEnabled: false,
  selectedElementIds: {} as Record<string, boolean>,
  hoveredElementIds: {} as Record<string, boolean>,
};

describe("shouldReduceAlphaForSelection", () => {
  it("does not dim when focus mode is off and no link selector is open", () => {
    expect(
      shouldReduceAlphaForSelection("a", {
        ...baseState,
        selectedElementIds: { b: true },
      }),
    ).toBe(false);
  });

  it("does not dim in focus mode when nothing is selected", () => {
    expect(
      shouldReduceAlphaForSelection("a", {
        ...baseState,
        focusModeEnabled: true,
      }),
    ).toBe(false);
  });

  it("dims non-selected elements when focus mode has a selection", () => {
    expect(
      shouldReduceAlphaForSelection("a", {
        ...baseState,
        focusModeEnabled: true,
        selectedElementIds: { b: true },
      }),
    ).toBe(true);
  });

  it("does not dim the selected element in focus mode", () => {
    expect(
      shouldReduceAlphaForSelection("b", {
        ...baseState,
        focusModeEnabled: true,
        selectedElementIds: { b: true },
      }),
    ).toBe(false);
  });

  it("does not dim hovered non-selected elements in focus mode", () => {
    expect(
      shouldReduceAlphaForSelection("a", {
        ...baseState,
        focusModeEnabled: true,
        selectedElementIds: { b: true },
        hoveredElementIds: { a: true },
      }),
    ).toBe(false);
  });

  it("dims non-selected elements while the element-link selector is open", () => {
    expect(
      shouldReduceAlphaForSelection("a", {
        ...baseState,
        openDialog: { name: "elementLinkSelector" },
        selectedElementIds: { b: true },
      }),
    ).toBe(true);
  });
});
