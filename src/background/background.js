import { initializeOmnibox } from "./omnibox";
import { initializeStorage } from "./storageManager";
import { createContextMenu, setupContextMenuListeners } from "./contextMenu";
import { loadSearchIndex, handleIndexPage } from "./searchEngine";
import { handleAddTaskNotification, handleDeleteTaskNotification, 
         handleUpdateTaskNotification, handleBackupImported, addAlarmListeners } from "./notifications";
import { logToFile } from "../utils/Logger";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

  createContextMenu();
  initializeStorage();
});




chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "indexPage") {
    try {
      handleIndexPage(request);
      sendResponse({ success: true });
    } catch (error) {
      console.error(error);
      sendResponse({ success: false });
    }
    return true;
  }

  // Implementing Notifications
  if (request.action === "addTask") {
    handleAddTaskNotification(request.task, sender, sendResponse);
    return true;
  }

  if (request.action === "deleteTask") {
    handleDeleteTaskNotification(request, sender, sendResponse);
    return true;
  }

  if (request.action === "updateTask") {
    handleUpdateTaskNotification(request, sender, sendResponse);
    return true; // Required for asynchronous sendResponse
  }

  if (request.action === "backup_imported") {
    handleBackupImported(request, sender, sendResponse);

    return true; // Required for asynchronous sendResponse
  }

  if (request.action === "recoverDeletedTask") {
    chrome.storage.local.get(["tasks", "deletedTasks"], (result) => {
      if (!result.deletedTasks) {
        sendResponse({ success: false });
        return;
      }
      const { tasks, deletedTasks } = result;
      const taskToRecover = deletedTasks.find((task) => task.id === request.taskId);
      if (taskToRecover) {
        chrome.storage.local.set({ deletedTasks: deletedTasks.filter((task) => task.id !== request.taskId) }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false });
      }
    });
    return true;
  }

  if (request.action === "recoverCompletedTask") {
    chrome.storage.local.get(["tasks", "completedTasks"], (result) => {
      if (!result.completedTasks) {
        sendResponse({ success: false });
        return;
      }
      const { tasks, completedTasks } = result;
      const taskToRecover = completedTasks.find((task) => task.id === request.taskId);
      taskToRecover.completed = false;
      if (taskToRecover) {
        chrome.storage.local.set({ completedTasks: completedTasks.filter((task) => task.id !== request.taskId) }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false });
      }
    });
    return true
  }

  if (request.action === 'moveCompletedTasks') {
    chrome.storage.local.get(["tasks", "completedTasks"], (result) => {
      if (!result.tasks) {
        sendResponse({ success: true });
        return;
      }
      const { tasks, completedTasks = [] } = result;
      const toMove = tasks.filter((task) => task.completed);
      if (toMove.length === 0) {
        sendResponse({ success: true });
        return;
      }
      const updatedCompletedTasks = [...(completedTasks || []), ...toMove];
      const updatedTasks = tasks.filter((task) => !task.completed);
      chrome.storage.local.set({ 
        tasks: updatedTasks, 
        completedTasks: updatedCompletedTasks 
      }, () => {
        logToFile(0, "Moved completed tasks to completedTasks:", toMove);
        sendResponse({ success: true });
      });
    });
    // Important for async messaging in background
    return true;
  }

  if (request.action === "log") {
    logToFile(request.level, request.content);
  }
});

addAlarmListeners();
// Wrap async operations in an IIFE
(async function() {
  try {
    await loadSearchIndex();
  } catch (error) {
    console.error("Error loading search index:", error);
  }
  
  initializeOmnibox();
  setupContextMenuListeners();
  // Log that the background script has loaded
  logToFile(1, "Background script loaded");
})();