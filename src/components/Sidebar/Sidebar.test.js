import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Sidebar from "./Sidebar";
import { STORAGE_KEY } from "../../utils/WhitelistChecker";

//Mocks
jest.mock("../../utils/WhitelistChecker", () => ({
  getWhitelistRules: jest.fn().mockResolvedValue({
    allowedSites: [],  // Make sure these keys exist in the mock
    allowedURLs: [],
    allowedStringMatches: [],
    allowedRegex: []
  }),
}));

jest.mock("../../hooks/useIndexMatching/useIndexMatching", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    rules: {
      allowedSites: [],
      allowedURLs: [],
      allowedStringMatches: [],
      allowedRegex: [],
    },
    deletedRules: [],
    addRule: jest.fn(),
    removeRule: jest.fn(),
    recoverRule: jest.fn(),
    checkCurrentUrl: jest.fn(),
  })),
}));

global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        if (typeof callback === "function") {
            const mockStorageData = {
                theme: "system",
                themeColor: "#0069b9",
                whitelistRules: [] 
            };    
            if (keys === "whitelistRules") {
                callback({ whitelistRules: mockStorageData.whitelistRules });
            } else {
                callback(mockStorageData);
            }
        }
      }),
      set: jest.fn((data, callback) => {
        if (typeof callback === "function") callback();
      }),
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
  },
};

jest.mock("../WhitelistIndicator/WhitelistIndicator", () => () => (
  <div data-testid="mock-whitelist-indicator"></div>
));


describe("Sidebar Component", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false, // Force it to return 'light' mode
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });
  
  test("renders Sidebar with navigation links", async () => {
    render(<Sidebar />);

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Indexing")).toBeInTheDocument();
  });

  test("clicking 'Tasks' tab activates it", async () => {
    render(<Sidebar />);

    const tasksTab = screen.getByText("Tasks");
    fireEvent.click(tasksTab);

    await waitFor(() => {
      expect(tasksTab.closest("a")).toHaveClass("active");
    });
  });

  test("clicking 'Indexing' tab changes section", async () => {
    render(<Sidebar />);

    // Find and click the "Indexing" tab
    const indexingTab = screen.getByRole("button", { name: /indexing/i });
    fireEvent.click(indexingTab);

    // Wait for the input field in IndexingSection to appear
    await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter link here")).toBeInTheDocument();
    });
  });

  test("clicking 'Settings' icon switches to settings", async () => {
    render(<Sidebar />);

    const settingsButton = screen.getByTestId("settings-button");
    expect(settingsButton).toBeInTheDocument(); 
    fireEvent.click(settingsButton);

    // verify that the settings section is now visible
    expect(screen.getByTestId("settings-section")).toBeInTheDocument();
  });

  test("applies theme from Chrome storage", async () => {
    render(<Sidebar />);

    await waitFor(() => {
      expect(["dark", "light"]).toContain(
        document.documentElement.getAttribute("data-theme")
      );
    });
  });
});
