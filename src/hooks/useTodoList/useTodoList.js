import React, { useState, useEffect } from "react";

export function useTodoList() {
  const [tasks, setTasks] = useState([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  useEffect(() => {
    if (tasksLoaded) {
      saveTasks();
    }
  }, [tasks, tasksLoaded]);

  useEffect(() => {
    loadTasks();

    // Listen for storage updates (overdue tasks or snooxe)
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.tasks) {
        logToMessage(1,"Tasks updated in storage:", changes.tasks.newValue);
        setTasks(changes.tasks.newValue || []);
      }
    });
  }, []);

  const addTask = (taskText, hasReminder = false, description = "", dueDate = null, completed = false) => {
    if (taskText.trim() === "") return;

    let validatedDueDate = null;
    if (dueDate) {
      const parsedDueDate = new Date(dueDate);
      if (!isNaN(parsedDueDate.getTime())) {
        validatedDueDate = parsedDueDate.toISOString();
      } else {
        console.error("Invalid due date:", dueDate);
      }
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      description: description,
      hasReminder,
      dueDate: validatedDueDate,
      completed,
    };
    
    logToMessage(2,"useTodoList - Adding task:", newTask);
    setTasks((prevTasks) => [...prevTasks, newTask]);
    //add task and notify background script to create alarms
    chrome.storage.local.get("tasks", (data) => {
      let tasks = Array.isArray(data.tasks) ? data.tasks : [];
      tasks.push(newTask);
      chrome.storage.local.set({ tasks }, () => {
        logToMessage(1,"Task stored successfully:", newTask);
      });
      chrome.runtime.sendMessage({ action: "addTask", task: newTask }, (response) => {
        logToMessage(0,"send task add message to background script:", response);
      });
    });

  };

  // Delete a task
  const deleteTask = (taskId) => {
    logToMessage(2,"useTodoList - Deleting task:", taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    //notify background script
    chrome.runtime.sendMessage({ action: "deleteTask", taskId }, (response) => {
      logToMessage(0,"Notified background script of deleted task:", response);
    });
  };

  const toggleReminder = (taskId) => {
    logToMessage(0,"useTodoList - Toggling reminder for task:", taskId);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, hasReminder: !task.hasReminder }
          : task
      )
    );
  };

  const updateTask = (taskId, newText, newDescription, newHasReminder, newDueDate, newCompleted) => {
    logToMessage(2,"useTodoList - Updating task:", { taskId, newText, newDescription, newHasReminder, newDueDate, newCompleted });
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              text: newText !== undefined ? newText : task.text,
              description: newDescription !== undefined ? newDescription : task.description,
              hasReminder: newHasReminder !== undefined ? newHasReminder : task.hasReminder,
              dueDate: newDueDate !== undefined ? newDueDate : task.dueDate,
              completed: newCompleted !== undefined ? newCompleted : task.completed ?? false,
            }
          : task
      )
    );
    // Notify background script to update alarm
    chrome.runtime.sendMessage({ 
      action: "updateTask", 
      taskId, 
      newDueDate, 
      newHasReminder 
    }, (response) => {
      logToMessage(0,"Task update sent to background:", response);
    });
  };

  const saveTasks = () => {
    try {
      const serializedTasks = tasks.map((task) => ({
        ...task,
        hasReminder: task.hasReminder,
        dueDate: task.dueDate ? task.dueDate : null,
        completed: task.completed ?? false,
      }));
      chrome.storage.local.set({ tasks: serializedTasks }, () => {
        logToMessage(1,"useTodoList - Tasks saved to Chrome storage:", serializedTasks);
      });
    } catch (error) {
      console.error("useTodoList - Error saving tasks to Chrome storage:", error);
    }
  };

  const loadTasks = () => {
    try {
      chrome.storage.local.get(["tasks"], (result) => {
        if (result.tasks) {
          const deserializedTasks = result.tasks.map((task) => {
            let parsedDue = task.dueDate ? new Date(task.dueDate) : null;
            if (parsedDue && isNaN(parsedDue.getTime())) {
              console.error("Invalid due date in loaded task:", task.dueDate);
              parsedDue = null;
            }
            return {
              ...task,
              hasReminder: task.hasReminder ?? false,
              dueDate: parsedDue ? parsedDue.toISOString() : null,
              completed: task.completed ?? false, 
            };
          });
          const activeTasks = deserializedTasks.filter((task) => !task.completed); 
          logToMessage(1,"useTodoList - Loaded all tasks:", deserializedTasks);
          logToMessage(0,"useTodoList - Filtered active tasks on load:", activeTasks);
          setTasks(activeTasks);
        }
        setTasksLoaded(true);
      });
    } catch (error) {
      console.error("useTodoList - Error loading tasks from Chrome storage:", error);
    }
  };

  return { tasks, addTask, deleteTask, toggleReminder, updateTask, saveTasks, loadTasks, setTasks }; // Added setTasks to return value
}