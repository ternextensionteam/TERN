import { checkWhitelist } from "../utils/WhitelistChecker.js";

console.log("Content script loaded.");
// Cached whitelist
let cachedWhitelist = {
  sites: [],
  urls: [],
  stringMatches: [],
  regex: []
};

// Debounce delay (in milliseconds)
const DEBOUNCE_DELAY = 1000;

// Debounce utility to limit frequent calls
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// MutationObserver variable
let observer = null;

// Utility to manage the observer
async function manageObserver() {
  const currentURL = window.location.href;
  const isWhitelisted = await checkWhitelist(currentURL, cachedWhitelist);

  if (isWhitelisted) {
    console.log("Page is whitelisted. Starting observer...");
    // If not already observing, set up the observer
    if (!observer) {
        console.log("Setting up observer...");
      observer = new MutationObserver(
        debounce(async () => {
          console.log("DOM mutated, re-indexing...");
          await sendPageData();
        }, DEBOUNCE_DELAY)
      );

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });

      // Send initial page data
      await sendPageData();
    }
  } else {
    console.log("Page is not whitelisted. Stopping observer...");
    // Disconnect observer if it exists
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
}

// Load whitelist from storage on script load
chrome.storage.local.get(
  ["allowedSites", "allowedURLs", "allowedStringMatches", "allowedRegex"],
  (result) => {
    cachedWhitelist.sites = result.allowedSites || [];
    cachedWhitelist.urls = result.allowedURLs || [];
    cachedWhitelist.stringMatches = result.allowedStringMatches || [];
    cachedWhitelist.regex = result.allowedRegex || [];

    // Check if the current page is whitelisted and manage the observer
    manageObserver();
  }
);

// Update cache and recheck observer when the whitelist changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local") {
    if (changes.allowedSites) cachedWhitelist.sites = changes.allowedSites.newValue || [];
    if (changes.allowedURLs) cachedWhitelist.urls = changes.allowedURLs.newValue || [];
    if (changes.allowedStringMatches) cachedWhitelist.stringMatches = changes.allowedStringMatches.newValue || [];
    if (changes.allowedRegex) cachedWhitelist.regex = changes.allowedRegex.newValue || [];

    // Recheck if the current page is whitelisted
    manageObserver();
  }
});

// Function to send page data
async function sendPageData() {
    console.log("Sending page data...");
  const currentURL = window.location.href;
  const currentTitle = document.title;

  const isWhitelisted = await checkWhitelist(currentURL, cachedWhitelist);

  if (isWhitelisted) {
    const pageContent = document.body.innerText;
    chrome.runtime.sendMessage({
      action: "indexPage",
      url: currentURL,
      title: currentTitle,
      content: pageContent
    });
  }
}
