import { useState, useEffect } from "react";

export function useTodoList() {
  const [tasks, setTasks] = useState([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  // Save tasks to Chrome storage whenever they are updated
  useEffect(() => {
    if (tasksLoaded) {
      saveTasks();
    }
  }, [tasks, tasksLoaded]);

  // Load tasks when the component mounts
  useEffect(() => {
    loadTasks();
  }, []);

  // Add a new task with boolean reminder and due date with time
  const addTask = (
    taskText,
    hasReminder = false, // Changed to boolean
    description = "",
    dueDate = null
  ) => {
    if (taskText.trim() === "") return;

    // Validate due date (now includes time)
    let validatedDueDate = null;
    if (dueDate) {
      const parsedDueDate = new Date(dueDate);
      if (!isNaN(parsedDueDate.getTime())) {
        validatedDueDate = parsedDueDate.toISOString(); // Store as ISO string with time
      } else {
        console.error("Invalid due date:", dueDate);
      }
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      description: description,
      hasReminder, // Simple boolean instead of object
      dueDate: validatedDueDate, // Now includes time
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  // Toggle a task's reminder (now just toggles the boolean)
  const toggleReminder = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, hasReminder: !task.hasReminder }
          : task
      )
    );
  };

  // Update a task's text, description, reminder boolean, or due date
  const updateTask = (taskId, newText, newDescription, newHasReminder, newDueDate) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              text: newText || task.text,
              description: newDescription || task.description,
              hasReminder: newHasReminder !== undefined ? newHasReminder : task.hasReminder,
              dueDate: newDueDate || task.dueDate,
            }
          : task
      )
    );
  };

  // Save tasks to Chrome local storage
  const saveTasks = () => {
    try {
      const serializedTasks = tasks.map((task) => ({
        ...task,
        hasReminder: task.hasReminder,
        dueDate: task.dueDate ? task.dueDate : null,
      }));
      chrome.storage.local.set({ tasks: serializedTasks }, () => {
        console.log("Tasks saved to Chrome storage:", serializedTasks);
      });
    } catch (error) {
      console.error("Error saving tasks to Chrome storage:", error);
    }
  };

  // Load tasks from Chrome storage
  const loadTasks = () => {
    try {
      chrome.storage.local.get(["tasks"], (result) => {
        if (result.tasks) {
          const deserializedTasks = result.tasks.map((task) => {
            let parsedDue = task.dueDate ? new Date(task.dueDate) : null;

            // Validate due date (now includes time)
            if (parsedDue && isNaN(parsedDue.getTime())) {
              console.error("Invalid due date in loaded task:", task.dueDate);
              parsedDue = null;
            }

            return {
              ...task,
              hasReminder: task.hasReminder || false, // Default to false if undefined
              dueDate: parsedDue ? parsedDue.toISOString() : null,
            };
          });
          setTasks(deserializedTasks);
        }
        setTasksLoaded(true);
      });
    } catch (error) {
      console.error("Error loading tasks from Chrome storage:", error);
    }
  };

  return { tasks, addTask, deleteTask, toggleReminder, updateTask, saveTasks, loadTasks };
}