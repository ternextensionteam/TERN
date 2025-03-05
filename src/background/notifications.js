export function handleAddTaskNotification(request, sender, sendResponse) {
  let task = request.task;
  console.log("Received new task:", task);
  // Schedule notification
  if (task.dueDate && task.hasReminder) {
    const dueTime = new Date(task.dueDate).getTime();
    chrome.alarms.create(`task-${task.id}`, { when: dueTime });
    console.log(`Alarm set for task ${task.id} at ${task.dueDate}`);
  }
  sendResponse({ success: true });
  return true; // Added return true for async messaging
}

export async function handleDeleteTaskNotification(request, sender, sendResponse) {
  const taskId = request.taskId;

  let JSONtasks = await chrome.storage.local.get("tasks");
  let tasks = Array.isArray(JSONtasks.tasks) ? JSONtasks.tasks : [];
  let updatedTasks = tasks.filter((task) => String(task.id) !== String(taskId)); // Remove task

  await chrome.storage.local.set({ tasks: updatedTasks });
  console.log("Task deleted:", taskId);

  // Clear associated alarm (only one alarm per task now)
  chrome.alarms.clear(`task-${taskId}`, (wasCleared) => {
    if (wasCleared) {
      console.log(`Cleared alarm for deleted task: task-${taskId}`);
    }
  });

  sendResponse({ success: true });
  return true; // Added return true for async messaging
}

export async function handleBackupImported(request, sender, sendResponse) {
  try {
    const data = await chrome.storage.local.get("tasks");
    let tasks = Array.isArray(data.tasks) ? data.tasks : [];
    await chrome.alarms.clearAll();
    
    for (let task of tasks) {
      if (task.dueDate && task.hasReminder) {
        const dueTime = new Date(task.dueDate).getTime();
        chrome.alarms.create(`task-${task.id}`, { when: dueTime });
        console.log(`Alarm set for task ${task.id} at ${task.dueDate}`);
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
    const { taskId, newDueDate, newHasReminder } = request;

    // Clear the old alarm
    await new Promise(resolve => {
      chrome.alarms.clear(`task-${taskId}`, () => {
        console.log(`Previous alarm for task ${taskId} cleared.`);
        resolve();
      });
    });

    // Set a new alarm if the task has a due date and reminders are enabled
    if (newDueDate && newHasReminder) {
      const dueTime = new Date(newDueDate).getTime();
      chrome.alarms.create(`task-${taskId}`, { when: dueTime });
      console.log(`New alarm set for task ${taskId} at ${newDueDate}`);
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
    console.log("Alarm triggered:", alarm.name);
    
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
        console.log("Notification created:", notificationId);
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
        console.log(
            "Task snoozed:",
            task.text,
            "New due time:",
            new Date(newDueTime).toLocaleString()
        );
        
        // Create a new alarm for the snoozed task
        chrome.alarms.create(`task-${task.id}`, { when: newDueTime });
        
        // Clear the old notification
        await chrome.notifications.clear(notificationId);
        console.log("Old notification cleared:", notificationId);
    }
}
