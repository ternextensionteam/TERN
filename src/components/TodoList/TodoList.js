import React, {useEffect} from "react";
import TodoItem from "../TodoItem/TodoItem";
import "./TodoList.css";

function TodoList({ tasks, onDeleteTask, onUpdateTask, onMoveCompletedTasks }) {
    useEffect(() => {
      const handleUnload = () => {
        onMoveCompletedTasks();
      };
      onMoveCompletedTasks();
      window.addEventListener("unload", handleUnload);
      return () => {
        onMoveCompletedTasks();
        window.removeEventListener("unload", handleUnload);
      };
    }, []);
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
          onUpdateTask={onUpdateTask}
        />
      ))}
    </ul>
  );
}

export default TodoList;