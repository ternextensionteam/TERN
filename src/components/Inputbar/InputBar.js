import React, { useState, useRef } from "react";
import "../tooltip";
import "../base.css";
import "./InputBar.css";
import { FaBell, FaBellSlash } from "react-icons/fa";

function InputBar({ onAddTask }) {
  // Helper functions for date and time formatting
  const getCurrentDate = () => getFormattedDate(new Date());
  const getCurrentTime = () => getFormattedTime(new Date());

  // Formats time to HH:MM format
  const getFormattedTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Formats date to YYYY-MM-DD format
  const getFormattedDate = (date) => date.toISOString().split("T")[0];

  // Returns a future date by adding days to the current date
  const getFutureDate = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return getFormattedDate(date);
  };

  // Determines the last date of the current week (Sunday)
  const getEndOfWeekDate = () => {
    const today = new Date();
    const daysToSunday = 7 - today.getDay();
    const endOfWeek = new Date(today.setDate(today.getDate() + daysToSunday));
    return getFormattedDate(endOfWeek);
  };

  // State variables for managing task input and settings
  const [taskText, setTaskText] = useState("");
  const [dueDate, setDueDate] = useState(getCurrentDate);
  const [dueTime, setDueTime] = useState(getCurrentTime);
  const [description, setDescription] = useState("");
  const [isReminder, setIsReminder] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("Later Today");

  // Refs for input fields
  const inputRef = useRef(null);
  const descriptionRef = useRef(null);

  // Handles adding a new task
  const handleAdd = () => {
    if (taskText.trim() !== "") {
      onAddTask(taskText, dueDate, dueTime, description, isReminder);
      setTaskText("");
      setDescription("");
      setIsReminder(true);
      if (descriptionRef.current) {
        descriptionRef.current.style.height = "auto"; // Reset textarea height
      }
    }
  };

  // Preset date options for quick selection
  const presets = [
    { label: "Later Today", value: `${getFutureDate(0)} 17:00` },
    { label: "Tomorrow", value: `${getFutureDate(1)} 17:00` },
    { label: "This Week", value: `${getEndOfWeekDate()} 17:00` },
  ];

  // Focuses the text input when clicking the add button
  const focusTextInput = (event) => {
    if (event.detail !== 0 && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 0);
    }
  };

  // Handles preset date selection and updates the due date/time
  const handlePresetChange = (value) => {
    setDueDate(value.split(" ")[0]);
    setDueTime(value.split(" ")[1]);
  };

  return (
    <div className="page-border">
      <div className="input-bar task-container p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          {/* Task Title Input */}
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Add a Task"
            className="task-input"
            ref={inputRef}
          />
          
          {/* Task Description Input */}
          <textarea
            className="task-textarea"
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />

          <div className="task-controls">
            {/* Reminder Toggle */}
            <label className="bell-checkbox" data-tooltip="Remind Me" data-tooltip-position="bottom">
              <input
                type="checkbox"
                id="reminder-checkbox"
                checked={isReminder}
                onChange={(e) => setIsReminder(e.target.checked)}
                style={{ display: "none" }}
              />
              {isReminder ? (
                <FaBell className="input-reminder-icon" style={{ width: "27px", height: "27px" }} />
              ) : (
                <FaBellSlash className="input-reminder-off" style={{ width: "32px", height: "32px" }} />
              )}
            </label>

            {/* Submit Button */}
            <button className="change-btn" type="submit" onClick={focusTextInput}>
              <img src="/vector_arts/add.svg" alt="Add Icon" className="btn-icon" />
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputBar;