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
  console.log("Received message:", request);
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
    return;
  }

  // Implementing Notifications
  if (request.action === "addTask") {
    console.log("addTask was triggered!", request.task);

    chrome.storage.local.get("tasks", (data) => {
      let tasks = Array.isArray(data.tasks) ? data.tasks : []; // Ensure tasks is an array
      console.log("Existing Tasks Before Adding:", tasks);

      tasks.push(request.task); // Add new task to array

      chrome.storage.local.set({ tasks }, () => {
        console.log("Task stored successfully:", request.task);

        console.log("dueDate:", request.task.dueDate, "->", new Date(request.task.dueDate));
        console.log("Current time:", Date.now(), "->", new Date(Date.now()));
        console.log(typeof request.task.dueDate);
        // Set an alarm if a due date is present
        if (request.task.dueDate && typeof request.task.dueDate === "number" && request.task.dueDate > Date.now()) {
          console.log("Setting alarm for:", new Date(request.task.dueDate));
          chrome.alarms.create(String(request.task.id), { when: request.task.dueDate });
          console.log("Alarm successfully set for:", new Date(request.task.dueDate));
        } else {
          console.log("No alarm set (No due date selected).");
        }

        sendResponse({ success: true });
      });
    });

    return true; // Keep message port open for async storage update
  }

  if (request.action === "deleteTask") {
    let taskId = request.taskId;
    chrome.storage.local.get("tasks", (data) => {
      let tasks = Array.isArray(data.tasks) ? data.tasks : [];  // ensure tasks is a array
      let taskIndex = tasks.findIndex(task => task.id === taskId);
      console.log(tasks);
      if (taskIndex !== -1) {
        // Remove task from array
        tasks.splice(taskIndex, 1);

        // Save updated task list
        chrome.storage.local.set({ tasks }, () => {
          console.log("Task deleted from storage:", taskId);
          chrome.alarms.clear(String(taskId));
          sendResponse({ success: true });
        });
      }
      console.log(tasks);
    });
    return true;
  }
  
});

// Notify the user when a task is due
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm triggered:", alarm.name);

  chrome.storage.local.get("tasks", (data) => {
    let tasks = data.tasks || {};
    let task = tasks[alarm.name];

    if (task && !task.recentlyDeleted) {
      chrome.notifications.clear(alarm.name, () => {
        console.log("Notification cleared");  // Clearing notifications with that existing id so that it can display on screen
        chrome.notifications.create(alarm.name, {
          type: "basic",
          title: `Task Reminder: ${task.title}`,
          message: task.description,
          iconUrl: chrome.runtime.getURL("vector_arts/bell.png"),
          priority: 2,
          requireInteraction: true, // doesnt disapper unless closed
          buttons: [
            {title: "Snooze (1 hour)"}
          ]
        }, (notificationId) => {
          console.log("Notification created:", notificationId);
        });
      });
    }
  });
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  let snoozeTime = 60*60*1000; // 1 hour (milliseconds)
  chrome.storage.local.get("tasks",(data) => {
    let tasks = data.tasks || {};
    let task = tasks[notificationId];
    if (task) {
      console.log("Snoozing task:", task.title, "for 1 hour");
      let newDueTime = Date.now() + snoozeTime;  // set new due time
      task.dueDate = newDueTime;
      
      tasks[notificationId] = task;
      chrome.storage.local.set({ tasks });  // update task in storage

      chrome.alarms.create(notificationId, { when: newDueTime });
      chrome.notifications.clear(notificationId);
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
});

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
chrome.contextMenus.create({
  id: "addToHawk",
  title: "Add Task",
  contexts: ["selection"]
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

chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === "active") {
    chrome.storage.local.get("tasks", (data) => {
      let tasks = data.tasks || {};
      let now = Date.now();
      Object.values(tasks).forEach((task) => {
        if (task.dueDate && task.dueDate < now) {
          console.log("Task overdue:", task.text);
          // trigger notificaiton
          chrome.notifications.create(task.id.toString(), {
            type: "basic",
            title: `Task Overdue: ${task.text}`,
            message: task.description,
            iconUrl: chrome.runtime.getURL("vector_arts/bell.png"),
            priority: 2,
            requireInteraction: true, 
          });
        }
      });
    });
  }
});