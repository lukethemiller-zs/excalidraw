import { UI } from "@excalidraw/excalidraw/tests/helpers/ui";
import {
  mockBoundingClientRect,
  render,
  restoreOriginalGetBoundingClientRect,
} from "@excalidraw/excalidraw/tests/test-utils";

import ExcalidrawApp from "../App";

describe("Top-left Adobe logo", () => {
  const { h } = window;
  const dimensions = { height: 800, width: 1200 };

  beforeAll(() => {
    mockBoundingClientRect(dimensions);
  });

  beforeEach(async () => {
    await render(<ExcalidrawApp />);
    h.app.refreshEditorInterface();
  });

  afterAll(() => {
    restoreOriginalGetBoundingClientRect();
  });

  it("links to adobe.com in a new tab after the welcome screen is dismissed", async () => {
    expect(
      document.querySelector(".excalidraw-adobe-logo-link"),
    ).toBeNull();

    UI.clickTool("rectangle");

    const logoLink = document.querySelector(
      ".excalidraw-adobe-logo-link",
    ) as HTMLAnchorElement | null;

    expect(logoLink).not.toBeNull();
    expect(logoLink?.href).toBe("https://www.adobe.com/");
    expect(logoLink?.target).toBe("_blank");
    expect(logoLink?.rel).toBe("noopener noreferrer");
    expect(logoLink?.getAttribute("aria-label")).toBe("Adobe");
  });
});
