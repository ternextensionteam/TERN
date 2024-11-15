import React from 'react';
import TodoItem from './TodoItem';

function TodoList({ tasks, onDeleteTask }) {
    return (
        <ul className="todo-list">
            {tasks.map(task => (
                <TodoItem key={task.id} task={task} onDelete={onDeleteTask} />
            ))}
        </ul>
    );
}

export default TodoList;