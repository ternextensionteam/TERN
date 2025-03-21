import { isUrlWhitelisted, STORAGE_KEY } from "../utils/WhitelistChecker.js";
import { logToMessage } from "../utils/Logger.js";


logToMessage(0,`[Content Script] Loaded on page: ${window.location.href}`);

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
    logToMessage(0,`[Content Script] Page is whitelisted: ${currentURL}`);
    // If not already observing, set up the observer
    if (!observer) {
      logToMessage(0,`[Content Script] Setting up observer for: ${currentURL}`);
      observer = new MutationObserver(
        debounce(async () => {
          logToMessage(0,`[Content Script] DOM mutated, re-indexing: ${currentURL}`);
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
    logToMessage(0,`[Content Script] Page is not whitelisted: ${currentURL}`);
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
  const currentURL = window.location.href;
  const currentTitle = document.title;
  
  logToMessage(0,`[Content Script] Sending page data from: ${currentURL}`);
  
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
