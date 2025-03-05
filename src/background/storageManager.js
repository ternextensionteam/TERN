const DEFAULT_REGEX_LIST = [
    "^https://[^/]+.amazon.com/.*$",
    "^https://atoz.amazon.work/.*$",
    "^https://quip-amazon.com/.*$",
    "^https://quip.com/.*$",
  ];

/**
 * Initialize storage with default values
 */
export function initializeStorage() {
  chrome.storage.local.set({ allowedSites: [] });
  chrome.storage.local.set({ allowedURLs: [] });
  chrome.storage.local.set({ allowedStringMatches: [] });
  chrome.storage.local.set({ allowedRegex: DEFAULT_REGEX_LIST });
  chrome.storage.local.set({ allLastTitles: {} });
}