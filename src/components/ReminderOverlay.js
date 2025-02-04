import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FaRegClock, FaBellSlash, FaRegCalendarAlt } from "react-icons/fa";
import "./ReminderOverlay.css";

function ReminderOverlay({ onSelectPreset, targetPosition, onClose }) {
  const overlayRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(null);

  // Handle closing the overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Adjust position to ensure it stays within the viewport
  useEffect(() => {
    if (!targetPosition) return;

    const { innerWidth, innerHeight } = window;
    let newTop = targetPosition.top;
    let newLeft = targetPosition.left;
    const padding = 20; // Minimum distance from the edge

    // Temporarily create an invisible overlay to measure its dimensions
    const tempOverlay = document.createElement("div");
    tempOverlay.style.position = "absolute";
    tempOverlay.style.visibility = "hidden";
    tempOverlay.style.zIndex = "-9999";
    tempOverlay.className = "overlay-popup"; // Use the same styles
    document.body.appendChild(tempOverlay);

    // Get overlay dimensions after being added to the DOM
    const overlayRect = tempOverlay.getBoundingClientRect();
    document.body.removeChild(tempOverlay);

    // Prevent overlay from being too close to the bottom edge
    if (newTop + overlayRect.height > innerHeight - padding) {
      newTop = innerHeight - overlayRect.height - padding;
    }

    // Prevent overlay from being too close to the right edge
    if (newLeft + overlayRect.width > innerWidth - padding) {
      newLeft = innerWidth - overlayRect.width - padding;
    }

    // Prevent overlay from being too close to the left edge
    if (newLeft < padding) {
      newLeft = padding;
    }

    // Prevent overlay from being too close to the top edge
    if (newTop < padding) {
      newTop = padding;
    }

    setAdjustedPosition({ top: newTop, left: newLeft });
  }, [targetPosition]);

  // Format dates for display
  const formatDateTime = (date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}T${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:00.000Z`;
  };

  const getParsedDate = (presetLabel) => {
    const now = new Date();
    switch (presetLabel) {
      case "Later today":
        now.setHours(17, 0, 0, 0); // 5:00 PM today
        return formatDateTime(now);
      case "Tomorrow":
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9:00 AM tomorrow
        return formatDateTime(tomorrow);
      case "Next week":
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + (7 - now.getDay())); // Next Monday
        nextWeek.setHours(9, 0, 0, 0); // 9:00 AM next Monday
        return formatDateTime(nextWeek);
      default:
        return null;
    }
  };

  const formatDisplayTime = (isoDate) => {
    const date = new Date(isoDate);
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

  const presets = [
    { label: "Later today", time: getParsedDate("Later today"), icon: <FaRegClock />, display: formatDisplayTime(getParsedDate("Later today")) },
    { label: "Tomorrow", time: getParsedDate("Tomorrow"), icon: <FaRegClock />, display: formatDisplayTime(getParsedDate("Tomorrow")) },
    { label: "Next week", time: getParsedDate("Next week"), icon: <FaRegClock />, display: formatDisplayTime(getParsedDate("Next week")) },
    { label: "Pick a date & time", time: "", icon: <FaRegCalendarAlt />, display: "Custom" },
    { label: "No Reminder", time: null, icon: <FaBellSlash />, display: "No Reminder" },
  ];

  // Prevent rendering until adjustedPosition is set
  if (!adjustedPosition) return null;

  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className="overlay-popup"
      style={{ top: `${adjustedPosition.top}px`, left: `${adjustedPosition.left}px` }}
    >
      <div className="overlay-options">
        {presets.map((preset) => (
          <div
            key={preset.label}
            className="preset-option"
            onClick={() => onSelectPreset({ label: preset.label, time: preset.time })}
          >
            <div className="option-left">
              {preset.icon && <span className="icon">{preset.icon}</span>}
              <span className="label">{preset.label}</span>
            </div>
            {preset.time && <span className="time">{preset.display}</span>}
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}

export default ReminderOverlay;
