import React, { useState } from "react";
import { Card, Row, Col, Form, Collapse, Button } from "react-bootstrap";
import { FaTrashAlt, FaBell, FaBellSlash } from "react-icons/fa";
import "../tooltip";
import "../base.css";
import "./TodoItem.css";
import ReminderOverlay from "../ReminderOverlay";

const formatDate = (date) => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `Today ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else {
    return date.toLocaleString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
};

function TodoItem({ task, onDelete, onToggleReminder, onUpdateTask }) {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newText, setNewText] = useState(task.text || "");
  const [newDescription, setNewDescription] = useState(task.description || "");
  const [isChecked, setIsChecked] = useState(false);
  const [reminderTime, setReminderTime] = useState(task.due || null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  // Open/Close Reminder Overlay and Calculate Position
  const handleReminderClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOverlayPosition({
      top: rect.bottom + window.scrollY, // Position below the button
      left: rect.left + window.scrollX, // Align with the button
    });
    setShowOverlay(!showOverlay);
  };

  // Handle Reminder Selection
  const handlePresetSelect = (preset) => {
    const newReminderTime = preset.time ? new Date(preset.time).toISOString() : null;
    setReminderTime(newReminderTime);
    setShowOverlay(false);
    onUpdateTask(task.id, newText, newDescription, newReminderTime);
  };

  // Render Reminder Bell
  const renderReminderIcon = () => {
    if (!reminderTime) {
      return (
        <FaBellSlash
          className="reminder-icon reminder-off"
          data-tooltip="No Reminder"
          data-tooltip-position="top"
          style={{ width: "24px", height: "24px" }}
        />
      );
    }

    let formattedTime = "Reminder";
    try {
      const date = new Date(reminderTime);
      if (!isNaN(date)) {
        formattedTime = formatDate(date);
      } else {
        formattedTime = "Invalid Time";
      }
    } catch (error) {
      formattedTime = "Invalid Time";
    }

    return (
      <FaBell
        className="reminder-icon reminder-on"
        data-tooltip={formattedTime}
        data-tooltip-position="top"
        style={{ width: "24px", height: "24px" }}
      />
    );
  };

  // Title Editing Handlers
  const handleDoubleClick = () => setIsEditing(true);
  const handleTitleChange = (e) => setNewText(e.target.value);
  const saveTitle = () => {
    setIsEditing(false);
    if (newText.trim() === "") {
      setNewText(task.text);
    }
    onUpdateTask(task.id, newText.trim(), newDescription, reminderTime);
  };
  const handleKeyDown = (e) => e.key === "Enter" && saveTitle();

  // Description Editing Handlers
  const handleDescriptionDoubleClick = () => {
    setIsDescriptionVisible(true);
    setIsEditingDescription(true);
  };
  const handleDescriptionChange = (e) => setNewDescription(e.target.value);
  const saveDescription = () => {
    setIsEditingDescription(false);
    onUpdateTask(task.id, newText, newDescription.trim(), reminderTime);
  };
  const handleDescriptionKeyDown = (e) => e.key === "Enter" && saveDescription();

  // Hover Effect
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // Handle Task Deletion
  const handleDelete = (e) => {
    e.stopPropagation();
    e.currentTarget.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    setTimeout(() => {
      onDelete(task.id);
    }, 100);
  };
  
  

  return (
    <Card
      className={`task-card ${isDescriptionVisible || isHovering ? "highlighted-border" : "default-border"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
    >
      <Card.Body>
        <Row className="align-items-center">
          {/* Checkbox */}
          <Col xs="auto">
            <Form.Check
              type="checkbox"
              onChange={() => setIsChecked(!isChecked)}
              checked={isChecked}
              className="custom-checkbox"
              style={{ transform: "scale(1.5)", marginRight: "7px" }}
            />
          </Col>

          {/* Task Title */}
          <Col>
            {isEditing ? (
              <input
                type="text"
                value={newText}
                onChange={handleTitleChange}
                onBlur={saveTitle}
                onKeyDown={handleKeyDown}
                autoFocus
                className="edit-input"
              />
            ) : (
              <div
                className={`task-name ${isChecked ? "line-through" : ""}`}
                onDoubleClick={handleDoubleClick}
              >
                {newText}
              </div>
            )}
          </Col>

          {/* Reminder and Delete Icons */}
          <Col xs="auto" className="task-icons">
            <div className="reminder-wrapper" style={{ position: "relative" }}>
              <Button variant="link" onClick={handleReminderClick} className="reminder-btn">
                {renderReminderIcon()}
              </Button>
              {showOverlay && (
                <ReminderOverlay
                  onSelectPreset={handlePresetSelect}
                  targetPosition={overlayPosition}
                  onClose={() => setShowOverlay(false)}
                />
              )}
            </div>
            <Button
              variant="link"
              onClick={handleDelete} // Use updated handleDelete
              className="delete-btn"
              data-tooltip="Delete task"
              data-tooltip-position="top"
            >
              <FaTrashAlt style={{ width: "20px", height: "20px" }} />
            </Button>
          </Col>
        </Row>

        {/* Task Description */}
        <Collapse in={isDescriptionVisible || isHovering}>
          <div className="mt-2">
            {isEditingDescription ? (
              <textarea
                value={newDescription}
                onChange={handleDescriptionChange}
                onBlur={saveDescription}
                onKeyDown={handleDescriptionKeyDown}
                autoFocus
                className="edit-description"
              />
            ) : (
              <Card.Text
                className="description-text"
                onDoubleClick={handleDescriptionDoubleClick}
              >
                {newDescription || "No description"}
              </Card.Text>
            )}
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
}

export default TodoItem;
