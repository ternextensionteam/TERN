import { logToFile } from "../utils/Logger";

// Task format
// id: dateTime.now() dateTime object (serialized to string in chrome local storage),
// text: String,
// description: String,
// hasReminder: Boolean,
// dueDate: dateTime object (serialized to string in chrome local storage),
// completed: Boolean

export function handleAddTaskNotification(task, sender, sendResponse) {
  let newTask = task;
  logToFile(0, "Service worker recieved new task:", newTask.text);

  chrome.storage.local.get("tasks", (data) => {
    let tasks = Array.isArray(data.tasks) ? data.tasks : [];
    tasks.push(newTask);
    chrome.storage.local.set({ tasks }, () => {
      logToFile(1,"Task stored successfully:", newTask);
    });
  });

  // Schedule notification
  if (newTask.dueDate && newTask.hasReminder) {
    const dueTime = new Date(newTask.dueDate).getTime();
    chrome.alarms.create(`task-${newTask.id}`, { when: dueTime });
    logToFile(1,`Alarm set for task ${newTask.id} at ${newTask.dueDate}`);
  }
  sendResponse({ success: true });
  return true; // Added return true for async messaging
}

export async function handleDeleteTaskNotification(request, sender, sendResponse) {
  try {
    const taskId = request.taskId;
    
    if (!taskId) {
      logToFile(2, "Delete task error: Missing taskId");
      sendResponse({ success: false, error: "Missing taskId" });
      return true;
    }

    let storage = await chrome.storage.local.get(["tasks", "deletedTasks"]);
    let tasks = Array.isArray(storage.tasks) ? storage.tasks : [];
    let deletedTasks = Array.isArray(storage.deletedTasks) ? storage.deletedTasks : [];
    
    // Find the task to be deleted
    const taskToDelete = tasks.find(task => String(task.id) === String(taskId));
    
    if (taskToDelete) {
      // Remove task from active tasks
      let updatedTasks = tasks.filter(task => String(task.id) !== String(taskId));
      
      // Add to deletedTasks array
      deletedTasks.push(taskToDelete);
      
      // Update both arrays in storage
      await chrome.storage.local.set({ 
        tasks: updatedTasks,
        deletedTasks: deletedTasks
      });
      
      logToFile(2, "Task moved to deleted tasks:", taskId);
      sendResponse({ success: true });
    } else {
      logToFile(2, "Delete task error: Task not found with ID:", taskId);
      sendResponse({ success: false, error: "Task not found" });
    }
  } catch (error) {
    console.error("Error in handleDeleteTaskNotification:", error);
    logToFile(2, "Delete task error:", error.message);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Required for async messaging
}

export async function handleBackupImported(request, sender, sendResponse) {
  logToFile(2,"Handling backup import...");
  try {
    const data = await chrome.storage.local.get("tasks");
    let tasks = Array.isArray(data.tasks) ? data.tasks : [];
    logToFile(1,"Clearing all alarms...");
    await chrome.alarms.clearAll();
    
    logToFile(1,"Setting new alarms from backup...");
    for (let task of tasks) {
      if (task.dueDate && task.hasReminder) {
        const dueTime = new Date(task.dueDate).getTime();
        chrome.alarms.create(`task-${task.id}`, { when: dueTime });
        logToFile(0,`Alarm set for task ${task.id} at ${task.dueDate}`);
      }
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error("Error handling backup import:", error);
    sendResponse({ success: false, error: error.message });
  }
  return true; // Added return true for async messaging
}

export async function handleUpdateTaskNotification(request, sender, sendResponse) {
  try {
    const updatedTask = request.task;
    const {id: taskId, text, description, hasReminder, dueDate, completed} = updatedTask;
    
    let JSONtasks = await chrome.storage.local.get("tasks");
    logToFile(2,"Updating task notification for task:", taskId);

    await chrome.storage.local.set({ tasks: JSONtasks.tasks.map((task) => {
      if (String(task.id) === String(taskId)) {
        task.text = text;
        task.description = description;
        task.hasReminder = hasReminder;
        task.dueDate = dueDate;
        task.completed = completed;
      }
      return task;
    }) });

    // Clear the old alarm
    await new Promise(resolve => {
      chrome.alarms.clear(`task-${taskId}`, () => {
        logToFile(1,`Previous alarm for task ${taskId} cleared.`);
        resolve();
      });
    });

    // Set a new alarm if the task has a due date and reminders are enabled
    if (dueDate && hasReminder) {
      const dueTime = new Date(dueDate).getTime();
      if (dueTime > Date.now()) {
        chrome.alarms.create(`task-${taskId}`, { when: dueTime });
        logToFile(1, `New alarm set for task ${taskId} at ${dueDate}`);
      } else {
        logToFile(1, `Task ${taskId} has a due date in the past, skipping alarm creation.`);
      }
    }

    sendResponse({ success: true });
  } catch (error) {
    console.error("Error updating task notification:", error);
    sendResponse({ success: false, error: error.message });
  }
  return true; // Added return true for async messaging
}

export async function addAlarmListeners() {
    // Notify the user when a task is due
    chrome.alarms.onAlarm.addListener(handleAlarmEvent);
    
    // Handle snooze functionality
    chrome.notifications.onButtonClicked.addListener(handleNotificationButtonClick);
}

async function handleAlarmEvent(alarm) {
    logToFile(2,"Alarm triggered:", alarm.name);
    
    const data = await chrome.storage.local.get("tasks");
    let tasks = Array.isArray(data.tasks) ? data.tasks : [];
    let taskId = alarm.name.replace("task-", ""); // Extract task ID
    let task = tasks.find((t) => String(t.id) === taskId);
    
    if (task && task.hasReminder) {
        let notificationOptions = {
            type: "basic",
            title: `Task Due: ${task.text}`,
            message: task.description || `Your task "${task.text}" is now due!`,
            iconUrl: chrome.runtime.getURL("icons/logo48x48.png"),
            priority: 2,
            requireInteraction: true,
            buttons: [{ title: "Snooze (1 hour)" }],
        };
        
        await chrome.notifications.clear(alarm.name);
        const notificationId = await chrome.notifications.create(alarm.name, notificationOptions);
        logToFile(0,"Notification created:", notificationId);
    }
}

async function handleNotificationButtonClick(notificationId, _buttonIndex) {
    const snoozeTime = 60 * 60 * 1000; // 1 hour snooze
    
    // Extract task ID from the notification ID
    const taskId = notificationId.replace("task-", "");
    
    const data = await chrome.storage.local.get("tasks");
    let tasks = Array.isArray(data.tasks) ? data.tasks : [];
    let task = tasks.find((t) => String(t.id) === taskId);
    
    if (task) {
        let newDueTime = Date.now() + snoozeTime; // Add 1 hour for snooze
        
        // Update task with the new due date
        task.dueDate = newDueTime;
        
        // Save the updated tasks to storage
        await chrome.storage.local.set({ tasks });
        logToFile(1,
            "Task snoozed:",
            task.text,
            "New due time:",
            new Date(newDueTime).toLocaleString()
        );
        
        // Create a new alarm for the snoozed task
        chrome.alarms.create(`task-${task.id}`, { when: newDueTime });
        
        // Clear the old notification
        await chrome.notifications.clear(notificationId);
        logToFile(0,"Old notification cleared:", notificationId);
    }
}
