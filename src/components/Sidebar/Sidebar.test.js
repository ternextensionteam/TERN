import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Sidebar from "./Sidebar";
import "@testing-library/jest-dom";
import chrome from "../../__mocks__/chrome";


describe("Sidebar Component", () => {
  beforeAll(() => {
    global.matchMedia =
    global.matchMedia ||
    jest.fn(() => ({
      matches: false,
      addListener: jest.fn(), 
      removeListener: jest.fn(), 
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(), 
      dispatchEvent: jest.fn(), 
    }));
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    global.chrome = chrome;

  });

  test("renders Sidebar component with navigation tabs", () => {
    render(<Sidebar />);

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Indexing")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("clicking on navigation tabs changes active section", () => {
    render(<Sidebar />);

    const tasksTab = screen.getByText("Tasks");
    const indexingTab = screen.getByText("Indexing");
    const settingsTab = screen.getByRole("link", { name: /settings/i });

    // Initially, Tasks section should be active
    expect(tasksTab).toHaveClass("active");

    // Click on Indexing tab
    fireEvent.click(indexingTab);
    expect(indexingTab).toHaveClass("active");

    // Click on Settings tab
    fireEvent.click(settingsTab);
    expect(settingsTab).toHaveClass("active");
  });

  test("loads theme settings from chrome storage", async () => {
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ theme: "dark", themeColor: "#ff5733" });
    });

    await act(async () => {
      render(<Sidebar />);
    });

    expect(chrome.storage.local.get).toHaveBeenCalledWith(["theme", "themeColor"], expect.any(Function));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--primary-color")).toBe("#ff5733");
  });

  test("applies system theme when set to 'system'", async () => {
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ theme: "system", themeColor: "#123456" });
    });

    await act(async () => {
      render(<Sidebar />);
    });

    expect(document.documentElement.getAttribute("data-theme")).toMatch(/dark|light/);
    expect(document.documentElement.style.getPropertyValue("--primary-color")).toBe("#123456");
  });

  test("listens for storage changes and updates theme", async () => {
    render(<Sidebar />);

    act(() => {
      chrome.storage.onChanged.addListener.mock.calls[0][0]({ theme: { newValue: "light" } }, "local");
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
