import React from 'react';

function TodoItem({ task, onDelete }) {
    return (
        <li className="todo-item">
            <span>{task.text}</span>
            <button onClick={() => onDelete(task.id)}>Delete</button>
        </li>
    );
}

export default TodoItem;