import React from "react";
import { render, screen, act, waitFor, cleanup } from "@testing-library/react";
import WhitelistIndicator from "./WhitelistIndicator";
import { isUrlWhitelisted } from "../../utils/WhitelistChecker";
import chrome from "../../__mocks__/chrome";
import { STORAGE_KEY } from "../../utils/WhitelistChecker";


jest.mock("../../utils/WhitelistChecker", () => ({
  isUrlWhitelisted: jest.fn(),
}));

describe("WhitelistIndicator Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.chrome = chrome;
  });

  test("renders a gray indicator when the URL is not whitelisted", async () => {
    isUrlWhitelisted.mockResolvedValue(false);

    await act(async () => {
      render(<WhitelistIndicator />);
    });

    const indicator = screen.getByTestId("whitelist-indicator");
    expect(indicator).toHaveStyle("background-color: gray");
  });

  test("renders a green indicator when the URL is whitelisted", async () => {
    isUrlWhitelisted.mockResolvedValue(true);

    await act(async () => {
      render(<WhitelistIndicator />);
    });

    const indicator = screen.getByTestId("whitelist-indicator");
    expect(indicator).toHaveStyle("background-color: green");
  });

  test("updates when the active tab changes", async () => {
    isUrlWhitelisted.mockResolvedValueOnce(false); // First render: URL is NOT whitelisted
    isUrlWhitelisted.mockResolvedValueOnce(true); // After tab change: URL IS whitelisted
  
    await act(async () => {
      render(<WhitelistIndicator />);
    });
  
    let indicator = screen.getByTestId("whitelist-indicator");
    expect(indicator).toHaveStyle("background-color: gray");

    // Simulate a tab change event
    await act(async () => {
      const tabChangeHandler = global.chrome.tabs.onActivated.addListener.mock.calls[0][0];
      tabChangeHandler(); // Call the mocked event handler
    });
  
    // Wait for the component to update
    await waitFor(() => {
      indicator = screen.getByTestId("whitelist-indicator");
      expect(indicator).toHaveStyle("background-color: green");
    });
  });
  
  test("updates when whitelist storage changes", async () => {
    // initially NOT whitelisted
    isUrlWhitelisted.mockResolvedValueOnce(false);
  
    await act(async () => {
      render(<WhitelistIndicator />);
    });
  
    let indicator = screen.getByTestId("whitelist-indicator");
    expect(indicator).toHaveStyle("background-color: gray");
    expect(global.chrome.storage.onChanged.addListener).toHaveBeenCalledTimes(1);
  
    // simulate Whitelist Update (Now whitelisted)
    isUrlWhitelisted.mockResolvedValueOnce(true);
  
    await act(async () => {
        const storageChangeHandler = global.chrome.storage.onChanged.addListener.mock.calls[0][0];
        storageChangeHandler({ [STORAGE_KEY]: { newValue: ["https://example.com"] } }, "local");
    });

    // Force a re-render
    cleanup();
    render(<WhitelistIndicator />);
    // Wait for UI to update
    await waitFor(() => {
        indicator = screen.getByTestId("whitelist-indicator");
        console.log("Updated color in test:", indicator.style.backgroundColor);
        expect(indicator).toHaveStyle("background-color: green");
    });
});
  
});
