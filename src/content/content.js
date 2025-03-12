import { isUrlWhitelisted, STORAGE_KEY } from "../utils/WhitelistChecker.js";

console.log("Content script loaded.");

// Debounce delay (in milliseconds)
const DEBOUNCE_DELAY = 10000;

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
  const isWhitelisted = await isUrlWhitelisted(currentURL);

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
        characterData: true,
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

manageObserver();

// Update recheck observer when the whitelist changes
if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes[STORAGE_KEY]) {
      // Recheck if the current page is whitelisted
      manageObserver();
    }
  });
}

// Function to send page data
async function sendPageData() {
  console.log("Sending page data...");
  const currentURL = window.location.href;
  const currentTitle = document.title;

  const isWhitelisted = await isUrlWhitelisted(currentURL);

  if (isWhitelisted) {
    const pageContent = document.body.innerText;
    chrome.runtime.sendMessage({
      action: "indexPage",
      url: currentURL,
      title: currentTitle,
      content: pageContent,
    });
  }
}
