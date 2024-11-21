import React, { useState } from 'react';

function InputBar({ onAddTask }) {
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    };

    const getCurrentTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0'); // Format: HH
        const minutes = now.getMinutes().toString().padStart(2, '0'); // Format: MM
        return `${hours}:${minutes}`; // Format: HH:MM
    };

    const [taskText, setTaskText] = useState('');
    const [dueDate, setDueDate] = useState(getCurrentDate);
    const [dueTime, setDueTime] = useState(getCurrentTime);
    const [description, setDescription] = useState('');
    const [isReminder, setIsReminder] = useState(true);



    const handleAdd = () => {
        onAddTask(taskText, dueDate, dueTime, description,isReminder);
        setTaskText('');
        setDueDate(getCurrentDate());
        setDueTime(getCurrentTime());
        setDescription('');
        setIsReminder(true);
    };

    return (
        <div className="input-bar">
            <input
                type="text"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Task title"
            />
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
            />
            <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
            />
            <label htmlFor="reminder">Remind you?:</label>
            <input
                type="checkbox"
                id='reminder'
                checked={isReminder}
                onChange={(e) => setIsReminder(e.target.checked)}
            />
            <button onClick={handleAdd}>Add Task</button>
        </div>
    );
}

export default InputBar;
