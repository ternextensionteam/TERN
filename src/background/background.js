import MiniSearch from "minisearch";
import { encode } from "he";
import { STORAGE_KEY, defaultWhitelistRules } from "../utils/WhitelistChecker";


const indexDescriptor = {
  fields: ["title", "content"], // Fields to index
  storeFields: ["title"], // Fields to return in search results
  idField: "id", // Field for unique identifier
  searchOptions: {
    boost: { title: 2 }, // Give higher weight to title matches
    fuzzy: 0.2, // Allow slight spelling variations
  },
};


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

  chrome.storage.local.set({STORAGE_KEY: defaultWhitelistRules});

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


function getSuggestions (text) {
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
  return suggestions;
}

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (!text.trim()) return;
  const suggestions = getSuggestions(text);
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

    // Schedule notification
    if (task.dueDate && task.hasReminder) {
      const dueTime = new Date(task.dueDate).getTime();
      chrome.alarms.create(`task-${task.id}`, { when: dueTime });
      console.log(`Alarm set for task ${task.id} at ${task.dueDate}`);
    }
    sendResponse({ success: true });
  }

  if (request.action === "deleteTask") {
    const taskId = request.taskId;

    chrome.storage.local.get("tasks", (data) => {
      let tasks = Array.isArray(data.tasks) ? data.tasks : [];
      let updatedTasks = tasks.filter(task => String(task.id) !== String(taskId)); // Remove task

      chrome.storage.local.set({ tasks: updatedTasks }, () => {
        console.log("Task deleted:", taskId);

        // Clear associated alarm (only one alarm per task now)
        chrome.alarms.clear(`task-${taskId}`, (wasCleared) => {
          if (wasCleared) {
            console.log(`Cleared alarm for deleted task: task-${taskId}`);
          }
        });

        sendResponse({ success: true });
      });
    });

    return true; // Required for asynchronous sendResponse
  }

  if (request.action === "updateTask") {
    const { taskId, newDueDate, newHasReminder } = request;

    // Clear the old alarm
    chrome.alarms.clear(`task-${taskId}`, () => {
        console.log(`Previous alarm for task ${taskId} cleared.`);
    });

    // Set a new alarm if the task has a due date and reminders are enabled
    if (newDueDate && newHasReminder) {
        const dueTime = new Date(newDueDate).getTime();
        chrome.alarms.create(`task-${taskId}`, { when: dueTime });
        console.log(`New alarm set for task ${taskId} at ${newDueDate}`);
    }

    sendResponse({ success: true });
}

  if (request.action === "backup_imported") {
    chrome.storage.local.get("tasks", (data) => {
      let tasks = Array.isArray(data.tasks) ? data.tasks : [];
      chrome.alarms.clearAll();
      for (let task of tasks) {
        if (task.dueDate && task.hasReminder) {
          const dueTime = new Date(task.dueDate).getTime();
          chrome.alarms.create(`task-${task.id}`, { when: dueTime });
          console.log(`Alarm set for task ${task.id} at ${task.dueDate}`);
        }
      }

    });
  };

});

// Notify the user when a task is due
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm triggered:", alarm.name);

  chrome.storage.local.get("tasks", (data) => {
    let tasks = Array.isArray(data.tasks) ? data.tasks : [];
    let taskId = alarm.name.replace("task-", ""); // Extract task ID
    let task = tasks.find(t => String(t.id) === taskId);

    if (task.hasReminder) {
      let notificationOptions = {
        type: "basic",
        title: `Task Due: ${task.text}`,
        message: task.description || `Your task "${task.text}" is now due!`, // Show description or fallback to default message
        iconUrl: chrome.runtime.getURL("icons/logo48x48.png"),
        priority: 2,
        requireInteraction: true,
        buttons: [{ title: "Snooze (1 hour)" }] // Add snooze option
      };

      chrome.notifications.clear(alarm.name, () => {
        chrome.notifications.create(alarm.name, notificationOptions, (notificationId) => {
          console.log("Notification created:", notificationId);
        });
      });
    }
    
  });
});

// Handle snooze functionality
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  let snoozeTime = 60 * 60 * 1000; // 1 hour snooze
  let taskId;

  // Extract task ID from the notification ID
  taskId = notificationId.replace("task-", ""); // Updated to reflect task notifications

  chrome.storage.local.get("tasks", (data) => {
    let tasks = Array.isArray(data.tasks) ? data.tasks : [];
    let task = tasks.find(t => String(t.id) === taskId);

    if (task) {
      let newDueTime = Date.now() + snoozeTime; // Add 1 hour for snooze

      // Update task with the new due date
      task.dueDate = newDueTime;

      // Save the updated tasks to storage
      chrome.storage.local.set({ tasks }, () => {
        console.log("Task snoozed:", task.text, "New due time:", new Date(newDueTime).toLocaleString());
  
        // Create a new alarm for the snoozed task
        chrome.alarms.create(`task-${task.id}`, { when: newDueTime });
  
        // Clear the old notification
        chrome.notifications.clear(notificationId, () => {
          console.log("Old notification cleared:", notificationId);
        });
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