/**
 * Spotlight dimming for Focus Mode and the element-link selector.
 * Keeps the non-obvious "when to fade unselected shapes" rule testable
 * and shared by canvas rendering.
 */

type SelectionDimmingAppState = {
  openDialog?: { name: string } | null;
  focusModeEnabled?: boolean;
  selectedElementIds: Readonly<{ [id: string]: boolean }>;
  hoveredElementIds: Readonly<{ [id: string]: boolean }>;
};

/**
 * True when this element should render at reduced alpha so the current
 * selection (or link-selector target) stands out.
 */
export const shouldReduceAlphaForSelection = (
  elementId: string,
  appState: SelectionDimmingAppState,
): boolean => {
  const spotlightActive =
    appState.openDialog?.name === "elementLinkSelector" ||
    (!!appState.focusModeEnabled &&
      Object.keys(appState.selectedElementIds).length > 0);

  return (
    spotlightActive &&
    !appState.selectedElementIds[elementId] &&
    !appState.hoveredElementIds[elementId]
  );
};
