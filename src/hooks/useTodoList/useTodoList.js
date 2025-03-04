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

    console.log("useTodoList - Adding task:", newTask);
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const deleteTask = (taskId) => {
    console.log("useTodoList - Deleting task:", taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const toggleReminder = (taskId) => {
    console.log("useTodoList - Toggling reminder for task:", taskId);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, hasReminder: !task.hasReminder }
          : task
      )
    );
  };

  const updateTask = (taskId, newText, newDescription, newHasReminder, newDueDate, newCompleted) => {
    console.log("useTodoList - Updating task:", { taskId, newText, newDescription, newHasReminder, newDueDate, newCompleted });
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
        console.log("useTodoList - Tasks saved to Chrome storage:", serializedTasks);
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
          console.log("useTodoList - Loaded all tasks:", deserializedTasks);
          console.log("useTodoList - Filtered active tasks on load:", activeTasks);
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