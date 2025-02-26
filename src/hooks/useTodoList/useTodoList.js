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

  // Add a new task with separate reminder & due date
  const addTask = (
    taskText,
    reminder = { label: "No Reminder", time: null },
    description = "",
    dueDate = null
  ) => {
    if (taskText.trim() === "") return;

    // Validate reminder time
    let reminderTime = null;
    if (reminder?.time) {
      const parsedReminder = new Date(reminder.time);
      if (!isNaN(parsedReminder.getTime())) {
        reminderTime = parsedReminder.getTime(); // Store as tiemstamp
        console.log("Reminder time: ", reminderTime);
      } else {
        console.error("Invalid reminder time:", reminder.time);
      }
    }

    // Validate due date
    let due = null;
    if (dueDate) {
      const parsedDueDate = new Date(dueDate);
      if (!isNaN(parsedDueDate.getTime())) {
        due = parsedDueDate.getTime(); // Store as timestamp
      } else {
        console.error("Invalid due date:", dueDate);
      }
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      description: description,
      reminder: {
        label: reminder.label || "No Reminder",
        time: reminder.time ? new Date(reminder.time).getTime() : null, // Store validated reminder time
      },
      dueDate: dueDate ? new Date(dueDate).getTime() : null, // Store validated due date
    };
    
    setTasks((prevTasks) => [...prevTasks, newTask]);
    
    //add task and notify background script to create alarms
    chrome.storage.local.get("tasks", (data) => {
      let tasks = Array.isArray(data.tasks) ? data.tasks : [];
      tasks.push(newTask);
      chrome.storage.local.set({ tasks }, () => {
        console.log("Task stored successfully:", newTask);
      });
      chrome.runtime.sendMessage({ action: "addTask", task: newTask }, (response) => {
        console.log("Task added:", response);
      });
    });

  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    //notify background script
    chrome.runtime.sendMessage({ action: "deleteTask", taskId }, (response) => {
      console.log("Task deleted:", response);
    });
  };

  // Toggle a task's reminder
  const toggleReminder = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              reminder: {
                ...task.reminder,
                time: task.reminder.time ? null : new Date().toISOString(), // Toggle reminder time
              },
            }
          : task
      )
    );
  };

  // Update a task's text, description, reminder, or due date
  const updateTask = (taskId, newText, newDescription, newReminder, newDueDate) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              text: newText || task.text, // Fallback to existing text
              description: newDescription || task.description, // Fallback to existing description
              reminder: newReminder || task.reminder, // Fallback to existing reminder
              dueDate: newDueDate || task.dueDate, // Fallback to existing due date
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
        reminder: {
          label: task.reminder.label,
          time: task.reminder.time ? task.reminder.time : null,
        },
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
            let parsedReminder = task.reminder?.time ? new Date(task.reminder.time) : null;
            let parsedDue = task.dueDate ? new Date(task.dueDate) : null;

            // Validate reminder time
            if (parsedReminder && isNaN(parsedReminder.getTime())) {
              console.error("Invalid reminder time in loaded task:", task.reminder.time);
              parsedReminder = null;
            }

            // Validate due date
            if (parsedDue && isNaN(parsedDue.getTime())) {
              console.error("Invalid due date in loaded task:", task.dueDate);
              parsedDue = null;
            }

            return {
              ...task,
              reminder: {
                label: task.reminder.label,
                time: task.reminder.time ? Number(task.reminder.time) : null,
              },
              dueDate: task.dueDate ? Number(task.dueDate) : null,
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