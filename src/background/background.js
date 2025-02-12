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

function removeAnchorLink(url) {
  return url.split("#")[0];
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

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (!text.trim()) return;

  // Perform a MiniSearch query
  let results = miniSearch.search(text, { prefix: true, fuzzy: 0.2 });

  // Format results for omnibox suggestions
  let suggestions = results.map((result) => ({
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

  // Implementing Notifications
  if (request.action === "addTask") {
    chrome.storage.local.get("tasks", (data) => {
      let tasks = data.tasks || {};
      tasks[request.task.id] = request.task;
      chrome.storage.local.set({ tasks }, () => {
        chrome.alarms.create(request.task.id, { when: request.task.dueDate }); // Create alarm for task reminder
        sendResponse({ success: true });
      });
    });
    return true;
  }
});

// Notify the user when a task is due
chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.local.get("tasks", (data) => {
    let tasks = data.tasks || {};
    let task = tasks[alarm.name];
    if (task && !task.recentlyDeleted) {
      chrome.notifications.create(alarm.name, {
        type: "basic",
        iconUrl: chrome.runtime.getURL("/vector_arts/bell.png"),
        title: `Task Reminder: ${task.title}`,
        message: task.description,
      });
    }
  });
});