import React, { useState, useRef } from 'react';
import "./InputBar.css";
import { FaTrash, FaBell, FaEdit } from 'react-icons/fa';

function InputBar({ onAddTask }) {
    const getCurrentDate = () => {
        return getFormattedDate(new Date());
    };
    const getCurrentTime = () => {
        return getFormattedTime(new Date());
    };
    const getFormattedTime = (date) => {
        const hours = date.getHours().toString().padStart(2, "0"); // Format: HH
        const minutes = date.getMinutes().toString().padStart(2, "0"); // Format: MM
        return `${hours}:${minutes}`; // Format: HH:MM
    };
    const getFormattedDate = (date) => {
        return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    };
    const getFutureDate = (daysAhead) => {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return getFormattedDate(date);
    };
    const getEndOfWeekDate = () => {
        const today = new Date();
        const daysToSunday = 7 - today.getDay(); // Days until Sunday
        const endOfWeek = new Date(today.setDate(today.getDate() + daysToSunday));
        return getFormattedDate(endOfWeek);
    };

    const [taskText, setTaskText] = useState('');
    const [dueDate, setDueDate] = useState(getCurrentDate);
    const [dueTime, setDueTime] = useState(getCurrentTime);
    const [description, setDescription] = useState('');
    const [isReminder, setIsReminder] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState("");

    const inputRef = useRef(null);

    const handleAdd = () => {
        onAddTask(taskText, dueDate, dueTime, description,isReminder);
        setTaskText('');
        setDueDate(getCurrentDate());
        setDueTime(getCurrentTime());
        setDescription('');
        setIsReminder(true);
    };

    const presets = [
        {
          label: "Today",
          value: `${getCurrentDate()} 23:59`, // End of today
        },
        {
          label: "Tomorrow",
          value: `${getFutureDate(1)} 23:59`, // End of tomorrow
        },
        {
          label: "This Week",
          value: `${getEndOfWeekDate()} 23:59`, // End of the week
        },
    ];

    const handlePresetChange = (value) => {
        setSelectedPreset(value);
        setDueDate(value.split(" ")[0]);
        setDueTime(value.split(" ")[1]);
        if (inputRef.current) {
          inputRef.current.focus();
        }
    };

    return (
        <div className='page-border'>
        <div className="input-bar task-container">
            <h2 className="task-heading">Add New To-Do List Task</h2>
            <input
                type="text"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Task title"
                className='task-input'
                ref={inputRef}
            />

            <div className="preset-dates">
                {/* <p className="preset-title">Preset Due Dates:</p> */}
                {presets.map((preset, index) => (
                <label key={index} className="preset-date-label">
                    <input
                    type="radio"
                    name="preset-due-date"
                    value={preset.value}
                    className="preset-date-input"
                    checked={selectedPreset === preset.value}
                    onChange={() => handlePresetChange(preset.value)}
                    />
                    <span className="preset-date-btn">{preset.label}</span>
                </label>
                ))}
            </div>

            {/* <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
            />
            <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
            /> */}
            {/* <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
            /> */}
            <div className="task-controls">
                {/* Reminder Checkbox */}
                <label className="bell-checkbox">
                    <input
                    type="checkbox"
                    id="reminder-checkbox"
                    checked={isReminder}
                    onChange={(e) => setIsReminder(e.target.checked)}
                    />
                    <img
                    src={
                        isReminder
                            ? `${process.env.PUBLIC_URL}/vector_arts/checked_bell.png`
                            : `${process.env.PUBLIC_URL}/vector_arts/bell.png`
                    }
                    alt="Reminder"
                />
                </label>

                {/* Add Task Button */}
                <button className="change-btn" onClick={handleAdd}>
                    <img src="/../../../vector_arts/add.svg" alt="Add Icon" className="btn-icon" />
                    Add Task
                </button>
            </div>
        </div>
        </div>
        
    );
}

export default InputBar;
