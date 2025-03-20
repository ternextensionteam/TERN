import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsSection from "./SettingsSection";
import "../../__mocks__/chrome";


// Mock Chrome API
jest.mock("../../__mocks__/chrome");

describe("SettingsSection Component", () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query.includes("dark"), // Simulate dark mode when the query contains "dark"
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  beforeEach(() => {
    // Reset mock storage
    global.chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ theme: "system", themeColor: "#0069b9" });
    });

    global.chrome.storage.local.set.mockImplementation((data, callback) => {
      callback && callback();
    });

    global.chrome.runtime.sendMessage = jest.fn();
  });

  test("renders SettingsSection correctly", async () => {
    render(<SettingsSection />);
    
    expect(screen.getByText("Theme Mode")).not.toBeNull();
    expect(screen.getByText("Change Theme Color")).not.toBeNull();
    expect(screen.getByText("Backups")).not.toBeNull();
  });

  test("clicking theme buttons updates theme", async () => {
    render(<SettingsSection />);

    const lightButton = screen.getByText("Light Mode");
    fireEvent.click(lightButton);

    await waitFor(() =>
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({ theme: "light" }),
        expect.any(Function)
      )
    );
  });

  test("color picker updates theme color", async () => {
    render(<SettingsSection />);
    
    const colorPicker = screen.getByTestId("theme-color-picker");
    fireEvent.change(colorPicker, { target: { value: "#ff0000" } });

    await waitFor(() =>
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({ themeColor: "#ff0000" }),
        expect.any(Function)
      )
    );
  });

  test("clicking Export Backup triggers download", async () => {
    render(<SettingsSection />);
    
    const exportButton = screen.getByText("Export Backup");
    fireEvent.click(exportButton);

    await waitFor(() => expect(global.chrome.storage.local.get).toHaveBeenCalled());
  });

  test("importing a backup updates storage", async () => {
    render(<SettingsSection />);

    const fileInput = screen.getByTestId("file-input");

    // Create a mock backup file
    const file = new Blob([JSON.stringify({ theme: "dark", themeColor: "#123456" })], { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() =>
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({ theme: "dark", themeColor: "#123456" }),
        expect.any(Function)
      )
    );
  });
});
