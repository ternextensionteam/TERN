import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Calendar from "react-calendar"; // Import Calendar directly
import { FaRegClock, FaBellSlash, FaRegCalendarAlt } from "react-icons/fa";
import "./ReminderOverlay.css";
import "./CalendarOverlay.css";

function ReminderOverlay({ onSelectPreset, targetPosition, onClose, bellButtonRef }) {
  const overlayRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("12:00 PM");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for custom dropdown

  // Handle closing the overlay when clicking outside or clicking the bell button
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target) &&
        !(bellButtonRef?.current && bellButtonRef.current.contains(event.target))
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, bellButtonRef]);

  // Adjust position to prevent overlay overflow
  useEffect(() => {
    if (!targetPosition) return;

    const { innerWidth, innerHeight } = window;
    let newTop = targetPosition.top;
    let newLeft = targetPosition.left;
    const padding = 20;

    const tempOverlay = document.createElement("div");
    tempOverlay.style.position = "absolute";
    tempOverlay.style.visibility = "hidden";
    tempOverlay.style.zIndex = "-9999";
    tempOverlay.className = "overlay-popup";
    document.body.appendChild(tempOverlay);

    const overlayRect = tempOverlay.getBoundingClientRect();
    document.body.removeChild(tempOverlay);

    if (newTop + overlayRect.height > innerHeight - padding) {
      newTop = innerHeight - overlayRect.height - padding;
    }
    if (newLeft + overlayRect.width > innerWidth - padding) {
      newLeft = innerWidth - overlayRect.width - padding;
    }
    if (newLeft < padding) {
      newLeft = padding;
    }
    if (newTop < padding) {
      newTop = padding;
    }

    setAdjustedPosition({ top: newTop, left: newLeft });
  }, [targetPosition]);

  const handleDateSave = () => {
    const [time, period] = selectedTime.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    const adjustedHours = period === "PM" && hours !== 12 ? hours + 12 : period === "AM" && hours === 12 ? 0 : hours;

    const savedDate = new Date(selectedDateTime);
    savedDate.setHours(adjustedHours, minutes, 0, 0);

    onSelectPreset({ label: "Custom", time: savedDate.toISOString() });
    setIsCalendarVisible(false);
    onClose();
  };

  const handleDateChange = (date) => {
    setSelectedDateTime(date);
  };

  const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min of [0, 30]) {
      const formattedTime = new Date(0, 0, 0, hour, min).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      times.push(formattedTime);
    }
  }

  // Get the current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Find the closest future time interval
  const nextIntervalIndex = times.findIndex((time) => {
    const [hour, minute] = time.split(/:| /);
    const amPm = time.split(" ")[1];
    const hour24 = amPm === "PM" && hour !== "12" ? +hour + 12 : amPm === "AM" && hour === "12" ? 0 : +hour;

    return (
      hour24 > currentHour || (hour24 === currentHour && +minute > currentMinutes)
    );
  });

  // Ensure the list starts from the next future time
  const startIndex = nextIntervalIndex === -1 ? 0 : nextIntervalIndex;
  const reorderedTimes = [
    ...times.slice(startIndex),
    ...times.slice(0, startIndex),
  ];

  return reorderedTimes;
};

  // Prevent rendering until adjustedPosition is set
  if (!adjustedPosition) return null;

  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className="overlay-popup"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        zIndex: 9999,
        minWidth: isCalendarVisible ? "250px" : "auto", // Make the calendar smaller
      }}
    >
      {isCalendarVisible ? (
        <div className="calendar-overlay">
          <Calendar
            formatShortWeekday={(locale, date) =>
              ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][date.getDay()]
            }
            onChange={handleDateChange}
            value={selectedDateTime}
            className="calendar-component"
            locale="en-US"
            minDate={new Date()}
            tileDisabled={({ date, view }) => {
              if (view === "month") {
                return date < new Date().setHours(0, 0, 0, 0);
              }
              return false;
            }}
            tileClassName={({ date, view }) => {
              const currentDate = new Date();
              currentDate.setHours(0, 0, 0, 0);

              if (view === "month" && date < currentDate) {
                return "disabled-tile";
              }

              return "";
            }}
          />

          {/* Custom Time Dropdown */}
          <div className="dropdown-wrapper">
  <div
    className="dropdown-header"
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
  >
    <span className={isDropdownOpen ? "" : "selected-time"}>{selectedTime}</span> {/* Add class for selected time */}
  </div>
  {isDropdownOpen && (
    <ul className="dropdown-options">
      {generateTimeOptions().map((time) => (
        <li
          key={time}
          onClick={() => {
            setSelectedTime(time);
            setIsDropdownOpen(false);
          }}
          className={selectedTime === time ? "selected" : ""}
        >
          {time}
        </li>
      ))}
    </ul>
  )}
</div>


          <div className="action-buttons">
            <button className="back-btn" onClick={() => setIsCalendarVisible(false)}>
              Back
            </button>
            <button className="save-btn" onClick={handleDateSave}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="overlay-options">
          {[
            { label: "Later today", time: new Date().setHours(17, 0, 0, 0), icon: <FaRegClock /> },
            { label: "Tomorrow", time: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(9, 0, 0, 0), icon: <FaRegClock /> },
            { label: "Next week", time: new Date(new Date().setDate(new Date().getDate() + 7 - new Date().getDay())).setHours(9, 0, 0, 0), icon: <FaRegClock /> },
            { label: "Pick a date & time", time: "", icon: <FaRegCalendarAlt /> },
            { label: "No Reminder", time: null, icon: <FaBellSlash /> },
          ].map((preset) => (
            <div
              key={preset.label}
              className="preset-option"
              onClick={() => {
                if (preset.label === "Pick a date & time") {
                  setIsCalendarVisible(true);
                } else {
                  onSelectPreset({ label: preset.label, time: preset.time });
                  onClose();
                }
              }}
            >
              <div className="option-left">
                {preset.icon && <span className="icon">{preset.icon}</span>}
                <span className="label">{preset.label}</span>
              </div>
              {preset.time && preset.label !== "Pick a date & time" && (
                <span className="time">{new Date(preset.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

export default ReminderOverlay;