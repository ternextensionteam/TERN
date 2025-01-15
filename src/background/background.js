chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
  });

chrome.omnibox.onInputEntered.addListener((text) => {
  console.log(`User input: ${text}`);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      const tabId = tabs[0].id;
      chrome.tabs.update(tabId, { url: text });
    } else {
      chrome.tabs.create({ url: text });
    }
  });
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  suggest([
    {
      content: "you have entered: " + text,
      description: `Navigate to ${text}`,
    },
  ]);
});

const defaultRegexList = [
  '^https://[^/]+\.amazon\.com/.*$',
  '^https://atoz\.amazon\.work/.*$',
  '^https://quip-amazon\.com/.*$',
  '^https://quip\.com/.*$',
];

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ allowedSites: [] }, () => {
    });

    chrome.storage.local.set({ allowedURLs: [] }, () => {
    });

    chrome.storage.local.set({ allowedStringMatches: [] }, () => {
    });

    chrome.storage.local.set({ allowedRegex: defaultRegexList }, () => {
    });

    chrome.storage.local.set({ allLastTitles: {} }, () => {
    });
  }
});