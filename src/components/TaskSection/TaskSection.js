import React, { useState, useEffect, useMemo } from "react";
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
  const {  tasks, deletedTasks ,completedTasks, addTask, deleteTask, updateTask, moveCompletedTasks, recoverDeletedTask, recoverCompletedTask} = useTodoList();
  const [showRecoverPage, setShowRecoverPage] = useState(false);
  const [sortField, setSortField] = useState('due');

  const sortedTasks = useMemo(() => {
    const tasksCopy = [...tasks];
  
    return tasksCopy.sort((a, b) => {
      try {
        if (sortField === 'completed') {
          return a.completed - b.completed;
        }
        if (sortField === 'due') {
          return new Date(a.due) - new Date(b.due);
        }
  
        if (sortField === 'created') {
          return new Date(a.id) - new Date(b.id);
        }
  
        if (sortField === 'text') {
          return a.text.localeCompare(b.text);
        }
        return 0; // fallback: no sort
      } catch (error) {
        console.error("Error sorting tasks:", error);
        return 0; // fallback: no sort
      }
    });
  }, [tasks, sortField]);

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
        onRecoverDeleted={recoverDeletedTask}
        onRecoverCompleted={recoverCompletedTask}
        onBack={() => setShowRecoverPage(false)}
      />
    );
  }

  return (
    <div data-testid="task-section" className="task-section">
      <InputBar onAddTask={addTask} />
      <TodoList
        tasks={sortedTasks}
        onDeleteTask={deleteTask}
        onUpdateTask={updateTask}
        onMoveCompletedTasks={moveCompletedTasks}
      />
      <div className="recover-button-container">
        <Button
          onClick={handleOpenRecoverPage}
          className="recover-button"
          data-tooltip="Recover Tasks"
          data-tooltip-position="top"
          data-testid="recover-button"
        >
          <MdRestore size={24} />
        </Button>
      </div>
    </div>
  );
}

export default TaskSection;