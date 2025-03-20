import { getSuggestions } from "./searchEngine.js";
import { logToFile } from "../utils/Logger.js";


export function initializeOmnibox() {
  chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    if (!text.trim()) return;
    const suggestions = getSuggestions(text);
    suggest(suggestions);
  });

  chrome.omnibox.onInputEntered.addListener((text) => {
    logToFile(0,`User input: ${text}`);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const tabId = tabs[0].id;
        chrome.tabs.update(tabId, { url: text });
      } else {
        chrome.tabs.create({ url: text });
      }
    });
  });
}