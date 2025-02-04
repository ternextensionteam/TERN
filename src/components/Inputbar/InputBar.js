import React, { useState } from "react";
import { FaBell, FaBellSlash } from "react-icons/fa";
import "../tooltip";
import "../base.css";
import "./InputBar.css";
import ReminderOverlay from "../ReminderOverlay";

function InputBar({ onAddTask }) {
  const [taskText, setTaskText] = useState("");
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [description, setDescription] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  const handleAdd = () => {
    if (taskText.trim() !== "") {
      try {
        const reminderLabel = selectedReminder?.label || "No Reminder";
        let reminderTime = selectedReminder?.time || null;

        if (reminderTime) {
          const parsedDate = new Date(reminderTime);
          if (isNaN(parsedDate.getTime())) {
            reminderTime = null;
          } else {
            reminderTime = parsedDate.toISOString(); // Store in ISO format
          }
        }

        onAddTask(taskText, reminderLabel, reminderTime, description);
        setTaskText("");
        setDescription("");
        setSelectedReminder(null);
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const handleReminderClick = (event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setOverlayPosition({
      top: rect.bottom + window.scrollY, // Position below the button
      left: rect.left + window.scrollX, // Align with the button
    });
    setShowOverlay(!showOverlay);
  };

  const handlePresetSelect = (preset) => {
    if (preset.label === "No Reminder") {
      setSelectedReminder({ label: "No Reminder", time: null }); // Explicitly set No Reminder
    } else {
      setSelectedReminder({
        label: preset.label,
        time: preset.time,
      });
    }
    setShowOverlay(false);
  };

  const renderBellIconWithTime = () => {
    const formatReminderTime = (time) => {
      const date = new Date(time);
      if (isNaN(date.getTime())) return "Invalid Time";

      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return `Today ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`;
      }

      return date.toLocaleString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    return (
      <>
        {selectedReminder?.label === "No Reminder" ? (
          <>
            <FaBellSlash
              className="bell-icon no-reminder"
              data-tooltip="Remind me"
              data-tooltip-position="bottom"
            />
            <span className="reminder-time">No Reminder</span>
          </>
        ) : (
          <>
            <FaBell
              className="bell-icon active"
              data-tooltip="Remind me" // Tooltip always shows "Remind me"
            />
            {selectedReminder?.time && (
              <span className="reminder-time">
                {formatReminderTime(selectedReminder.time)}
              </span>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <div className="page-border">
      <div className="input-bar task-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          {/* Task Input */}
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Add a Task"
            className="task-input"
          />

          {/* Description Input */}
          <textarea
            className="task-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            rows={1}
          />

          {/* Reminder & Submit Button */}
          <div className="task-controls">
            <div className="reminder-wrapper" style={{ position: "relative" }}>
              <button
                className="reminder-display"
                type="button"
                onClick={handleReminderClick}
              >
                {renderBellIconWithTime()}
              </button>
              {showOverlay && (
                <ReminderOverlay
                  onSelectPreset={handlePresetSelect}
                  targetPosition={overlayPosition}
                  onClose={() => setShowOverlay(false)}
                />
              )}
            </div>

            <button className="change-btn" type="submit">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputBar;
