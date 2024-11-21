import React from 'react';

function TodoItem({ task, onDelete }) {
    return (
        <li className="todo-item">
            <div>
                <h4>{task.text}</h4>
                {task.description && <p>{task.description}</p>}
                {task.reminder && <p>will remind you at:</p>}
                {task.due && <p>Due: {task.due.toLocaleString()}</p>}
            </div>
            <button onClick={() => onDelete(task.id)}>Delete</button>
        </li>
    );
}

export default TodoItem;