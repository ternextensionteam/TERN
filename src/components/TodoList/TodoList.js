import React from "react";
import TodoItem from "../TodoItem/TodoItem";
import "./TodoList.css";

function TodoList({ tasks, onDeleteTask, onToggleReminder, onUpdateTask }) {
  return (
    <ul
      aria-label="To-Do List"
      data-testid="todo-list"
      className="list-group todo-list scrollable"
    >
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          onDelete={onDeleteTask}
          onToggleReminder={onToggleReminder}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </ul>
  );
}

export default TodoList;