import React from 'react';
import { FaTrash, FaBell, FaEdit } from 'react-icons/fa';

function TodoItem({ task, onDelete, onToggleReminder, onEdit }) {
    return (
        <li className="todo-item list-group-item d-flex align-items-center justify-content-between shadow-sm rounded mb-2 p-3"
        data-key={task.id}>
            <div className="task-info d-flex flex-column">
                <h5 className="task-text mb-1 d-flex align-items-center">
                    {task.text}
                    {task.reminder && (
                        <FaBell className="text-warning ms-2" title="Reminder Set" />
                    )}
                </h5>
                {task.description && <p className="text-muted small mb-1">{task.description}</p>}
                {task.due && task.due instanceof Date && (
                    <small className="text-muted">
                        Due: {task.due.toLocaleString()}
                    </small>
                )}
            </div>

            <div className="task-actions d-flex align-items-center gap-2">
                {/* Reminder Icon */}
                <button
                    className="btn btn-outline-secondary btn-sm"
                    title="Toggle Reminder"
                    onClick={() => onToggleReminder(task.id)}
                >
                    <FaBell className={task.reminder ? "text-warning" : ""} />
                </button>

                {/* Edit Icon */}
                <button
                    className="btn btn-outline-secondary btn-sm"
                    title="Edit Task"
                    onClick={() => onEdit(task.id)}
                >
                    <FaEdit />
                </button>

                {/* Delete Icon */}
                <button
                    className="btn btn-outline-danger btn-sm"
                    title="Delete Task"
                    onClick={() => onDelete(task.id)}
                >
                    <FaTrash />
                </button>
            </div>
        </li>
    );
}

export default TodoItem;
