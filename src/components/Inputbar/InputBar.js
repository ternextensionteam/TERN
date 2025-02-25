import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaBellSlash, FaCalendarAlt } from "react-icons/fa";
import "../tooltip";
import "../base.css";
import "./InputBar.css";
import { formatDueDate } from "../FormatTime";
import ReminderOverlay from "../ReminderOverlay";
import DueOverlay from "../DueOverlay";
import 'react-datetime-picker/dist/DateTimePicker.css';

function InputBar({ onAddTask }) {
  const [taskText, setTaskText] = useState("");
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [description, setDescription] = useState("");
  const [showReminderOverlay, setShowReminderOverlay] = useState(false);
  const [showDueOverlay, setShowDueOverlay] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
  const bellButtonRef = useRef(null);
  const calendarButtonRef = useRef(null);

 
  useEffect(() => {
    chrome.storage.local.get(['selectedText'], (result) => {
      if (result.selectedText) {
        setTaskText(result.selectedText);
        chrome.storage.local.remove('selectedText');
      }
    });

    const handleStorageChange = (changes, area) => {
      if (area === 'local' && changes.selectedText?.newValue) {
        setTaskText(changes.selectedText.newValue);
        chrome.storage.local.remove('selectedText');
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleAdd = () => {
    if (taskText.trim() !== "") {
      try {
        // Ensure reminder always has a valid default
        const reminder = selectedReminder
          ? {
              label: selectedReminder.label || "No Reminder",
              time: selectedReminder.time
                ? new Date(selectedReminder.time).toISOString() // Convert to ISO format
                : null,
            }
          : { label: "No Reminder", time: null }; // Default to "No Reminder" if nothing selected
  
        // Handle due date (optional)
        let dueDate = selectedDueDate || null;
        if (dueDate) {
          const parsedDueDate = new Date(dueDate);
          if (isNaN(parsedDueDate.getTime())) {
            dueDate = null;
          } else {
            dueDate = parsedDueDate.toISOString(); // Store in ISO format
          }
        }
  
        // Pass validated data to the parent function
        onAddTask(taskText, reminder, description, dueDate);
  
        // Clear input fields
        setTaskText("");
        setDescription("");
        setSelectedReminder(null); // Clear the reminder selection
        setSelectedDueDate(null); // Clear the due date selection
  
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };
  
  const handleReminderClick = (event) => {
    event.stopPropagation();

    if (showReminderOverlay) {
      setShowReminderOverlay(false);
    } else if (bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      setOverlayPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setShowReminderOverlay(true);
    }
  };

  const handleDueDateClick = (event) => {
    event.stopPropagation();

    if (showDueOverlay) {
      setShowDueOverlay(false);
    } else if (calendarButtonRef.current) {
      const rect = calendarButtonRef.current.getBoundingClientRect();
      setOverlayPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setShowDueOverlay(true);
    }
  };

  const handlePresetSelect = (preset) => {
    if (!preset || !preset.label) {
      return;
    }
    console.log("Selected Reminder:", preset);

    setSelectedReminder(preset); // Ensure we're storing the correct object
    setShowReminderOverlay(false);
  };

  const handleDueDateSelect = (date) => {
    const newDueDate = date === null ? "No Due Date" : new Date(date).toISOString();
    setSelectedDueDate(newDueDate);
    setShowDueOverlay(false);
  };
  
  const renderBellIconWithTime = () => {
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
            <FaBell className="bell-icon active" data-tooltip="Remind me" />
            {selectedReminder?.time && (
              <span className="reminder-time">
                {formatReminderTime(selectedReminder.time)} {}
              </span>
            )}
          </>
        )}
      </>
    );
  };

  const renderCalendarIconWithDate = () => {
    const isNoDueDate = selectedDueDate === "No Due Date"; // Check if "No Due Date" is explicitly set
  
    return (
      <div className="due-date-wrapper">
        {/* Always show the calendar icon */}
        <FaCalendarAlt className={`calendar-icon ${isNoDueDate ? "no-due-date-icon" : ""}`} />
  
        {/* Show text only if a due date is selected, including "No Due Date" */}
        {selectedDueDate && (
          <span className="due-date">{isNoDueDate ? "No Due Date" : formatDueDate(selectedDueDate)}</span>
        )}
      </div>
    );
  };
  
  const formatReminderTime = (time) => {
    const date = new Date(time);
    if (isNaN(date.getTime())) return "Invalid Time";
  
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
  
    // 🔹 Find the upcoming Monday
    const nextMonday = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    if (dayOfWeek === 0) {
      // Today is Sunday, set next Monday (tomorrow)
      nextMonday.setDate(now.getDate() + 1);
    } else {
      // Move to the next Monday
      nextMonday.setDate(now.getDate() + (8 - dayOfWeek));
    }
    nextMonday.setHours(0, 0, 0, 0);
  
    // 🔹 Find the Monday after that (for week after next)
    const followingMonday = new Date(nextMonday);
    followingMonday.setDate(nextMonday.getDate() + 7);
  
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isWithinNextWeek = date >= nextMonday && date < followingMonday;
    const isThisYear = date.getFullYear() === now.getFullYear();
  
    // 🔹 Remove "Tomorrow", show full date instead
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    }
  
    if (isWithinNextWeek) {
      return `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    }
  
    return `${date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: isThisYear ? undefined : "numeric",
    })}, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  };
  
  const formatDueDate = (date) => {
    const dueDate = new Date(date);
    if (isNaN(dueDate.getTime())) return "Invalid Date";
  
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
  
    const nextMonday = new Date(now);
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0) {
      nextMonday.setDate(now.getDate() + 1);
    } else {
      nextMonday.setDate(now.getDate() + (8 - dayOfWeek));
    }
    nextMonday.setHours(0, 0, 0, 0);

    const followingMonday = new Date(nextMonday);
    followingMonday.setDate(nextMonday.getDate() + 7);
  
    const isToday = dueDate.toDateString() === now.toDateString();
    const isTomorrow = dueDate.toDateString() === tomorrow.toDateString();
    const isWithinNextWeek = dueDate >= nextMonday && dueDate < followingMonday;
    const isThisYear = dueDate.getFullYear() === now.getFullYear();
  
    return dueDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: isThisYear ? undefined : "numeric",
    });
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

          {/* Reminder, Due Date & Submit Button */}
          <div className="task-controls">
  {/* If both Due Date & Reminder are selected, move Due Date to a new row */}
  {selectedDueDate && selectedReminder && (
    <div className="due-date-wrapper full-width" style={{ position: "relative" }}>
    </div>
  )}

  {/* Always Render the Row for Bell (Reminder) + Add Task Button + Calendar */}
  <div className="task-controls">
  {/* Always Render Due Date in the Top Row if Reminder is Selected */}
  {selectedReminder && (
    <div className="due-date-wrapper full-width" style={{ position: "relative" }}>
      <button
        ref={calendarButtonRef}
        className="due-date-display"
        type="button"
        onClick={handleDueDateClick}
      >
        {renderCalendarIconWithDate()}
      </button>
      {showDueOverlay && (
        <DueOverlay
          onSelectDate={handleDueDateSelect}
          targetPosition={overlayPosition}
          onClose={() => setShowDueOverlay(false)}
          calendarButtonRef={calendarButtonRef}
        />
      )}
    </div>
  )}

  {/* Main Row for Bell + Add Task Button */}
  <div className="task-controls-row">
    {/* Render Due Date (When Reminder is NOT Selected) */}
    {!selectedReminder && (
      <div className="due-date-wrapper" style={{ position: "relative" }}>
        <button
          ref={calendarButtonRef}
          className="due-date-display"
          type="button"
          onClick={handleDueDateClick}
        >
          {renderCalendarIconWithDate()}
        </button>
        {showDueOverlay && (
          <DueOverlay
            onSelectDate={handleDueDateSelect}
            targetPosition={overlayPosition}
            onClose={() => setShowDueOverlay(false)}
            calendarButtonRef={calendarButtonRef}
          />
        )}
      </div>
    )}

    {/* Render Reminder */}
    <div className="reminder-wrapper" style={{ position: "relative" }}>
      <button
        ref={bellButtonRef}
        className="reminder-display"
        type="button"
        onClick={handleReminderClick}
      >
        {renderBellIconWithTime()}
      </button>
      {showReminderOverlay && (
        <ReminderOverlay
          onSelectPreset={handlePresetSelect}
          targetPosition={overlayPosition}
          onClose={() => setShowReminderOverlay(false)}
          bellButtonRef={bellButtonRef}
        />
      )}
    </div>

    {/* Add Task Button */}
    <button className="change-btn" type="submit">
      Add Task
    </button>
  </div>
</div>


</div>

        </form>
      </div>
    </div>
  );
}

export default InputBar;