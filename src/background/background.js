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
  let filteredResults = results.filter((result) => result.score > SCORE_THRESHOLD);
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
    let task = request.task;
    
    console.log("Received new task:", task);

    // Schedule reminder notification
    if (task.reminder.time) {
      chrome.alarms.create(`reminder-${task.id}`, { when: task.reminder.time });
      console.log("Reminder alarm set for task:", task.id, "at", task.reminder.time);
    }

    // Schedule due date notification
    if (task.dueDate) {
      chrome.alarms.create(`due-${task.id}`, { when: task.dueDate });
      console.log("Due date alarm set for task:", task.id, "at", task.dueDate);
    }

    sendResponse({ success: true });
  }

  if (request.action === "deleteTask") {
    let taskId = request.taskId;

    chrome.storage.local.get("tasks", (data) => {
      let tasks = Array.isArray(data.tasks) ? data.tasks : [];  // ensure tasks is a array
      let updatedTasks = tasks.filter(task => String(task.id) !== String(taskId)); // Remove task
      // Save updated task list
      chrome.storage.local.set({ tasks: updatedTasks }, () => {
        console.log("Task deleted:", taskId);

        // Clear associated alarms
        chrome.alarms.clear(`reminder-${taskId}`);
        chrome.alarms.clear(`due-${taskId}`);

        console.log(`Cleared alarms for deleted task: reminder-${taskId}, due-${taskId}`);
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
});

// Notify the user when a task is due
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm triggered:", alarm.name);

  chrome.storage.local.get("tasks", (data) => {
    let tasks = Array.isArray(data.tasks) ? data.tasks : [];
    let taskId;
    let type;

    if (alarm.name.startsWith("reminder-")) {
      taskId = alarm.name.replace("reminder-", "");
      type = "Reminder";
    } else if (alarm.name.startsWith("due-")) {
      taskId = alarm.name.replace("due-", "");
      type = "Due";
    }

    let task = tasks.find(t => String(t.id) === taskId);

    if (type === "Due") {
      // Mark the task as overdue
      task.isOverdue = true;

      // Save the updated tasks to storage
      chrome.storage.local.set({ tasks }, () => {
        console.log("Task marked as overdue:", task.text);
      });
    }

    let notificationTitle = type === "Reminder" 
      ? `Reminder: ${task.text}` 
      : `Task Due: ${task.text}`;

    let notificationMessage = type === "Reminder" 
      ? `Your task "${task.text}" is due soon.` 
      : `Your task "${task.text}" is now due!`;

    let notificationOptions = {
      type: "basic",
      title: notificationTitle,
      message: notificationMessage,
      iconUrl: chrome.runtime.getURL("vector_arts/bell.png"),
      priority: 2,
      requireInteraction: true,
    };

    // Add snooze button ONLY for due notifications
    if (type === "Due") {
      notificationOptions.buttons = [{ title: "Snooze (1 hour)" }];
    }

    chrome.notifications.clear(alarm.name, () => {
      chrome.notifications.create(alarm.name, notificationOptions, (notificationId) => {
        console.log("Notification created:", notificationId);
      });
    });
    
  });
});

// Handle snooze functionality
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  let snoozeTime = 60 * 60 * 1000; // 1 hour snooze
  let taskId;
  let type;

  // Identify whether it was a reminder or due notification
  if (notificationId.startsWith("reminder-")) {
    taskId = notificationId.replace("reminder-", "");
    type = "Reminder";
  } else if (notificationId.startsWith("due-")) {
    taskId = notificationId.replace("due-", "");
    type = "Due";
  }

  chrome.storage.local.get("tasks", (data) => {
    let tasks = Array.isArray(data.tasks) ? data.tasks : [];
    let task = tasks.find(t => String(t.id) === taskId);

    if (task) {
      let newSnoozeTime = Date.now() + snoozeTime;
      tasks[taskIndex] = { 
        ...task, 
        dueDate: newDueTime, 
        isOverdue: false 
      };

      chrome.storage.local.set({ tasks }, () => {
        console.log("Task snoozed:", task.text, "New due time:", new Date(newDueTime).toLocaleString());
  
        // Create a new alarm for the snoozed task
        chrome.alarms.create(`due-${task.id}`, { when: newDueTime });
  
        // Clear the old notification
        chrome.notifications.clear(notificationId);
      });
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

// chrome.idle.onStateChanged.addListener((newState) => {
//   if (newState === "active") {
//     chrome.storage.local.get("tasks", (data) => {
//       let tasks = data.tasks || {};
//       let now = Date.now();
//       Object.values(tasks).forEach((task) => {
//         if (task.dueDate && task.dueDate < now) {
//           console.log("Task overdue:", task.text);
//           // trigger notificaiton
//           chrome.notifications.create(task.id.toString(), {
//             type: "basic",
//             title: `Task Overdue: ${task.text}`,
//             message: task.description,
//             iconUrl: chrome.runtime.getURL("vector_arts/bell.png"),
//             priority: 2,
//             requireInteraction: true, 
//           });
//         }
//       });
//     });
//   }
// });

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.storage.local.get("tasks", (data) => {
//     let tasks = data.tasks || {};
//     let now = Date.now();
//     Object.values(tasks).forEach((task) => {
//       if (task.dueDate && task.dueDate < now) {
//         console.log("Task overdue:", task.text);
//         // trigger notificaiton
//         chrome.notifications.create(task.id.toString(), {
//           type: "basic",
//           title: `Task Overdue: ${task.text}`,
//           message: task.description,
//           iconUrl: chrome.runtime.getURL("vector_arts/bell.png"),
//           priority: 2,
//           requireInteraction: true, 
//         });
//       }
//     });
//   });
// });