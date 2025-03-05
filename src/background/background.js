import { initializeOmnibox } from "./omnibox";
import { initializeStorage } from "./storageManager";
import { createContextMenu, setupContextMenuListeners } from "./contextMenu";
import { loadSearchIndex, handleIndexPage} from "./searchEngine";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

  
  createContextMenu();
  initializeStorage();

});

await loadSearchIndex();
initializeOmnibox();
setupContextMenuListeners();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "indexPage") {
    handleIndexPage(request)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error(error);
        sendResponse({ success: false });
      });
    return true;
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
