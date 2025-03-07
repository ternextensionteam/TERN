import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { MdRestore } from "react-icons/md";
import { useTodoList } from "../../hooks/useTodoList/useTodoList";
import TodoList from "../TodoList/TodoList";
import InputBar from "../Inputbar/InputBar";
import RecoverDeletedTasks from "../RecoverDeletedTasks/RecoverDeletedTasks";
import "../tooltip";
import "../base.css";
import "../RecoverDeletedTasks/RecoverDeletedTasks.css";
import "./TaskSection.css";

function TaskSection() {
  const { tasks, addTask, deleteTask, toggleReminder, updateTask } = useTodoList();

  const [deletedTasks, setDeletedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showRecoverPage, setShowRecoverPage] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(["deletedTasks", "completedTasks"], (result) => {
      setDeletedTasks(result.deletedTasks || []);
      const loadedCompletedTasks = (result.completedTasks || []).map((task) => ({
        ...task,
        hidden: false,
      }));
      setCompletedTasks(loadedCompletedTasks);
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ deletedTasks }, () => {
      console.log("TaskSection - Deleted tasks saved:", deletedTasks);
    });
  }, [deletedTasks]);

  useEffect(() => {
    const tasksToSave = completedTasks.map(({ hidden, ...task }) => task);
    chrome.storage.local.set({ completedTasks: tasksToSave }, () => {
      console.log("TaskSection - Completed tasks saved:", tasksToSave);
    });
  }, [completedTasks]);

  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (taskToDelete) {
      deleteTask(taskId);
      setDeletedTasks((prev) => [taskToDelete, ...prev]);
    }
  };

  const handleUpdateTask = (taskId, text, description, hasReminder, dueDate, completed) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (taskToUpdate) {
      updateTask(taskId, text, description, hasReminder, dueDate, completed);
      if (completed && !taskToUpdate.completed) {
        const hiddenTaskCopy = {
          ...taskToUpdate,
          completed: true,
          hidden: true,
        };
        setCompletedTasks((prev) => [hiddenTaskCopy, ...prev]);
      }
    }
  };

  const handleRecoverDeleted = (index) => {
    const taskToRecover = deletedTasks[index];
    if (taskToRecover) {
      addTask(taskToRecover.text, taskToRecover.hasReminder, taskToRecover.description, taskToRecover.dueDate);
      setDeletedTasks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleRecoverCompleted = (index) => {
    const taskToRemove = completedTasks[index];
    if (taskToRemove) {
      addTask(taskToRemove.text, taskToRemove.hasReminder, taskToRemove.description, taskToRemove.dueDate);
      setCompletedTasks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    const handleUnload = () => {
      const completedTaskIds = new Set(completedTasks.map((task) => task.id));
      if (completedTaskIds.size > 0) {
        const updatedCompletedTasks = completedTasks.map((task) => ({
          ...task,
          hidden: false,
        }));
        setCompletedTasks(updatedCompletedTasks);
        chrome.storage.local.set({ completedTasks: updatedCompletedTasks.map(({ hidden, ...task }) => task) }, () => {
          console.log("TaskSection - Completed tasks unhidden and saved on closure:", updatedCompletedTasks);
        });

        const activeTasks = tasks.filter((task) => !completedTaskIds.has(task.id));
        chrome.storage.local.set({ tasks: activeTasks }, () => {
          console.log("TaskSection - Active tasks updated on closure:", activeTasks);
        });
      }
    };

    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, [tasks, completedTasks]);

  const sortedTasks = [...tasks].sort((a, b) => {
    const aDueDate = a.dueDate ? new Date(a.dueDate) : null;
    const bDueDate = b.dueDate ? new Date(b.dueDate) : null;
    const isAOverdue = aDueDate && !isNaN(aDueDate.getTime()) && aDueDate < new Date();
    const isBOverdue = bDueDate && !isNaN(bDueDate.getTime()) && bDueDate < new Date();

    if (isAOverdue && !isBOverdue) return -1;
    if (!isAOverdue && isBOverdue) return 1;
    if (isAOverdue && isBOverdue) return 0;
    return 0;
  });

  const handleOpenRecoverPage = (e) => {
    e.target.blur();
    document.dispatchEvent(new Event("click"));
    setTimeout(() => setShowRecoverPage(true), 50);
  };

  if (showRecoverPage) {
    return (
      <RecoverDeletedTasks
        deletedTasks={deletedTasks}
        completedTasks={completedTasks}
        onRecoverDeleted={handleRecoverDeleted}
        onRecoverCompleted={handleRecoverCompleted}
        onBack={() => setShowRecoverPage(false)}
      />
    );
  }

  return (
    <div data-testid="task-section" className="task-section">
      <InputBar onAddTask={addTask} />
      <TodoList
        tasks={sortedTasks}
        onDeleteTask={handleDeleteTask}
        onToggleReminder={toggleReminder}
        onUpdateTask={handleUpdateTask}
      />
      <div className="recover-button-container">
        <Button
          onClick={handleOpenRecoverPage}
          className="recover-button"
          data-tooltip="Recover Tasks"
          data-tooltip-position="top"
        >
          <MdRestore size={24} />
        </Button>
      </div>
    </div>
  );
}

export default TaskSection;