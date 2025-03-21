import React, { useState, useEffect } from "react";
import { logToMessage } from "../../utils/Logger";

// Task format
// id: dateTime.now() dateTime object (serialized to string in chrome local storage),
// text: String,
// description: String,
// hasReminder: Boolean,
// dueDate: dateTime object (serialized to string in chrome local storage),
// completed: Boolean

export function useTodoList() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);

  useEffect(() => {
    loadTasks();

    // Listen for storage updates (overdue tasks or snooxe)
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.tasks) {
        // Compare by serialization to check if content actually changed
        const currentTasksJSON = JSON.stringify(tasks);
        const newTasksJSON = JSON.stringify(changes.tasks.newValue || []);
        
        if (currentTasksJSON !== newTasksJSON) {
          logToMessage(0, "Tasks updated in storage, syncing tasks");
          setTasks(changes.tasks.newValue || []);
        }
      }
      if (changes.deletedTasks) {
        logToMessage(0, "deleted tasks updated in storage, syncing tasks");
        setDeletedTasks(changes.deletedTasks.newValue || []);
      }
      if (changes.completedTasks) {
        logToMessage(0, "completed tasks updated in storage, syncing tasks");
        setCompletedTasks(changes.completedTasks.newValue || []);
      }
    });

  }, []);

  const addTask = (taskText, hasReminder = false, description = "", dueDate = null, completed = false, taskId = null) => {
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
    if (!taskId) {
      taskId = Date.now();
    }
    const newTask = {
      id: taskId,
      text: taskText,
      description: description,
      hasReminder,
      dueDate: validatedDueDate,
      completed: false
    };
    
    logToMessage(2,"useTodoList - Adding task:", newTask.text);
    setTasks((prevTasks) => [...prevTasks, newTask]);
    //add task and notify background script to create alarms
    logToMessage(0,"useTodoList - Notifying background script of new task:", newTask.text);
    chrome.runtime.sendMessage({ action: "addTask", task: newTask }, (response) => {
    });
  };


  const moveCompletedTasks = () => {
    setCompletedTasks((prev) => [...prev, ...tasks.filter((task) => task.completed)]);
    setTasks((prev) => prev.filter((task) => !task.completed));

    logToMessage(1,"useTodoList - Moving all completed tasks to completed tasks list:");
    chrome.runtime.sendMessage({ action: "moveCompletedTasks" }, (response) => {
    });
  };

  // Delete a task
  const deleteTask = (taskId) => {
    logToMessage(2,"useTodoList - Deleting task with id:", taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    //notify background script
    logToMessage(0,"useTodoList - Notifying background script of deleted task:", taskId);
    chrome.runtime.sendMessage({ action: "deleteTask", taskId }, (response) => {
    });
  };

  const updateTask = (taskId, newText, newDescription, newHasReminder, newDueDate, newCompleted) => {
    logToMessage(2,"useTodoList - Updating task:", { taskId, newText, newDescription, newHasReminder, newDueDate, newCompleted });
    
    // Create a copy of the updated task to send to background
    const updatedTask = {
      id: taskId,
      text: newText,
      description: newDescription,
      hasReminder: newHasReminder,
      dueDate : newDueDate,
      completed: newCompleted
    };

    // Update the task in the state
    setTasks((prevTasks) => prevTasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, text: newText, description: newDescription, hasReminder: newHasReminder, dueDate: newDueDate, completed: newCompleted };
      }
      return task;
    }));

    logToMessage(0,"useTodoList - Notifying background script of updated task:", updatedTask.text);
    // Notify background script of the update
    chrome.runtime.sendMessage({ action: "updateTask", task: updatedTask }, (response) => {
    });

    
  };


  const parseTasks = (JSONtasks) => {
    
    const deserializedTasks = JSONtasks.map((task) => {
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
    return deserializedTasks
  }


  const loadTasks = () => {
    logToMessage(0,"useTodoList - Loading tasks from Chrome storage");
    try {
      chrome.storage.local.get(["tasks", "deletedTasks", "completedTasks"], (result) => {
        if (result.tasks) {
          setTasks(parseTasks(result.tasks));
        }
        if (result.deletedTasks) {
          setDeletedTasks(parseTasks(result.deletedTasks));
        }
        if (result.completedTasks) {
          setCompletedTasks(parseTasks(result.completedTasks));
        }
      });
    } catch (error) {
      console.error("useTodoList - Error loading tasks from Chrome storage:", error);
    }
  };

  const recoverDeletedTask = (taskId) => {
    const taskToRecover = deletedTasks.find((task) => task.id === taskId);
    if (taskToRecover) {
      logToMessage(2,"useTodoList - Recovering deleted task:", taskToRecover.text);
      addTask(taskToRecover.text, taskToRecover.hasReminder, taskToRecover.description, taskToRecover.dueDate, false, taskId);
      setDeletedTasks((prev) => prev.filter((task) => task.id !== taskId));
      logToMessage(0,"useTodoList - Notifying background script of recovered deleted task:", taskToRecover.text);
      chrome.runtime.sendMessage({ action: "recoverDeletedTask", taskId }, (response) => {
      });
    }
  };

  const recoverCompletedTask = (taskId) => {
    const taskToRecover = completedTasks.find((task) => task.id === taskId);
    if (taskToRecover) {
      logToMessage(2,"useTodoList - Recovering completed task:", taskToRecover.text);
      addTask(taskToRecover.text, taskToRecover.hasReminder, taskToRecover.description, taskToRecover.dueDate, false, taskId);
      setCompletedTasks((prev) => prev.filter((task) => task.id !== taskId));
      logToMessage(0,"useTodoList - Notifying background script of recovered completed task:", taskToRecover.text);
      chrome.runtime.sendMessage({ action: "recoverCompletedTask", taskId }, (response) => {
      });
    }
  }

  return { tasks, deletedTasks ,completedTasks, addTask, deleteTask, updateTask, moveCompletedTasks, recoverDeletedTask, recoverCompletedTask}; // Added setTasks to return value
}