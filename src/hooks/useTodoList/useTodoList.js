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

  // Add a new task
  const addTask = (taskText, reminderLabel = "No Reminder", reminderTime = null, description = "") => {
    if (taskText.trim() === "") return;

    let due = null;
    if (reminderTime) {
      const parsedDate = new Date(reminderTime);
      if (!isNaN(parsedDate.getTime())) {
        due = parsedDate.toISOString(); // Store as a valid ISO date
      } else {
        console.error("Invalid reminder time:", reminderTime);
      }
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      due: due,
      description: description,
      reminder: due !== null, // Reminder is active if `due` is set
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  // Toggle a task's reminder
  const toggleReminder = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, reminder: !task.reminder } : task
      )
    );
  };

  // Update a task's text or description
  const updateTask = (taskId, newText, newDescription) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, text: newText, description: newDescription }
          : task
      )
    );
  };

  // Save tasks to Chrome local storage
  const saveTasks = () => {
    try {
      const serializedTasks = tasks.map((task) => ({
        ...task,
        due: task.due ? task.due : null, // Store as ISO string
      }));
      chrome.storage.local.set({ tasks: serializedTasks });
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
            let parsedDue = task.due ? new Date(task.due) : null;
            if (parsedDue && isNaN(parsedDue.getTime())) {
              console.error("Invalid due date in loaded task:", task.due);
              parsedDue = null; // Reset invalid date
            }
            return { ...task, due: parsedDue };
          });
          setTasks(deserializedTasks);
        }
        setTasksLoaded(true);
      });
    } catch (error) {
      console.error("Error loading tasks from Chrome storage:", error);
    }
  };

  return { tasks, addTask, deleteTask, toggleReminder, saveTasks, loadTasks, updateTask };
}
