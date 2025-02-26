import MiniSearch from "minisearch";
import { encode } from "he";

const indexDescriptor = {
  fields: ["title", "content"], // Fields to index
  storeFields: ["title"], // Fields to return in search results
  idField: "id", // Field for unique identifier
  searchOptions: {
    boost: { title: 2 }, // Give higher weight to title matches
    fuzzy: 0.2, // Allow slight spelling variations
  },
};

const defaultRegexList = [
  "^https://[^/]+.amazon.com/.*$",
  "^https://atoz.amazon.work/.*$",
  "^https://quip-amazon.com/.*$",
  "^https://quip.com/.*$",
];

const SCORE_THRESHOLD = 0.5;

function removeAnchorLink(url) {
  return url.split("#")[0];
}

function getWordsSet(str) {
  return new Set(str.toLowerCase().match(/\b\w+\b/g)); // Extract words, ignoring case
}

function jaccardSimilarityTexts(text1, text2) {
  const setA = getWordsSet(text1);
  const setB = getWordsSet(text2);

  const intersection = new Set([...setA].filter(word => setB.has(word)));
  const union = new Set([...setA, ...setB]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

let miniSearch = new MiniSearch(indexDescriptor);

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

  chrome.storage.local.set({ allowedSites: [] }, () => {});

  chrome.storage.local.set({ allowedURLs: [] }, () => {});

  chrome.storage.local.set({ allowedStringMatches: [] }, () => {});

  chrome.storage.local.set({ allowedRegex: defaultRegexList }, () => {});

  chrome.storage.local.set({ allLastTitles: {} }, () => {});

  // chrome.storage.local.set({ pageIndex: JSON.stringify(miniSearch) }, () => {});

});


chrome.storage.local.get("pageIndex", (data) => {
  if (data.pageIndex) {
    miniSearch = MiniSearch.loadJSON(data.pageIndex,indexDescriptor);
  }
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

const JACCARD_THRESHOLD = 0.8;

function removeDuplicates(results){
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      if (jaccardSimilarityTexts(results[i].title, results[j].title) > JACCARD_THRESHOLD) {
        results.splice(j, 1);
        j--;
      }
    }
  }
}

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (!text.trim()) return;

  // Perform a MiniSearch query
  let results = miniSearch.search(text, { prefix: true, fuzzy: 0.2 });
  let filteredResults = results.filter((result) => result.score > SCORE_THRESHOLD).slice(0,10);
  removeDuplicates(filteredResults);
  // Format results for omnibox suggestions
  let suggestions = filteredResults.map((result) => ({
    content: result.id,
    description: encode(result.title),
  }));

  // If no matches, provide a fallback message
  if (suggestions.length === 0) {
    suggestions.push({
      content: text,
      description: `No indexed pages found for "${text}"`,
    });
  }

  suggest(suggestions);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "indexPage") {
    console.log("Indexing page:", request.url);

    // Create document object for MiniSearch
    let pageData = {
      id: removeAnchorLink(request.url),
      title: request.title,
      content: request.content,
    };

    if (miniSearch.has(pageData.id)) {
      miniSearch.replace(pageData)
    }
    else {
      miniSearch.add(pageData);
    }

    // Save updated index to storage
    chrome.storage.local.set({ pageIndex: JSON.stringify(miniSearch) });

    sendResponse({ success: true });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
});

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
chrome.contextMenus.create({
  id: "addToHawk",
  title: "Add Task",
  contexts: ["selection"],

});
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
if (info.menuItemId === "addToHawk") {
  // Store the selected text in chrome.storage
  chrome.storage.local.set({ selectedText: info.selectionText }, () => {
    // Open the side panel
    chrome.sidePanel.open({ windowId: tab.windowId });
  });
}
});