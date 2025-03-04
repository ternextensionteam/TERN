import React, { useRef, useState, useEffect } from "react";
import { Card, Row, Col, Form, Collapse, Button } from "react-bootstrap";
import { FaTrashAlt, FaBell, FaBellSlash } from "react-icons/fa";
import "../tooltip";
import "../base.css";
import "./TodoItem.css";
import ReminderOverlay from "../ReminderOverlay";
import DueOverlay from "../DueOverlay";
import { formatReminderTime, formatDueDate } from "../FormatTime";

function TodoItem({ task, onDelete, onUpdateTask }) {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newText, setNewText] = useState(task.text || "");
  const [newDescription, setNewDescription] = useState(task.description || "");
  const [isChecked, setIsChecked] = useState(task.completed || false);
  const [reminder, setReminder] = useState(task.reminder || { label: "No Reminder", time: null });
  const [dueDate, setDueDate] = useState(task.dueDate || null);
  const [showReminderOverlay, setShowReminderOverlay] = useState(false);
  const [showDueOverlay, setShowDueOverlay] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  const bellButtonRef = useRef(null);
  const dueDateRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickOutside = !event.target.closest('.overlay-popup') && 
        !event.target.closest('.reminder-btn') && 
        !event.target.closest('.due-date-text');
      
      if (isClickOutside) {
        if (showReminderOverlay) setShowReminderOverlay(false);
        if (showDueOverlay) setShowDueOverlay(false);
      }
    };

    if (showReminderOverlay || showDueOverlay) {
      window.addEventListener('click', handleClickOutside, true);
      return () => {
        window.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [showReminderOverlay, showDueOverlay]);

  useEffect(() => {
    setNewText(task.text || "");
    setNewDescription(task.description || "");
    setIsChecked(task.completed || false);
    setReminder(task.reminder || { label: "No Reminder", time: null });
    setDueDate(task.dueDate || null);
  }, [task]);

  const handleKeyPress = (event, saveFunction) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveFunction();
    }
  };

  const saveTitle = () => {
    setIsEditing(false);
    if (newText.trim() === "") {
      setNewText(task.text);
      return;
    }
    onUpdateTask(task.id, newText.trim(), task.description, task.reminder, task.dueDate, task.completed);
  };

  const saveDescription = () => {
    setIsEditingDescription(false);
    if (newDescription.trim() === "") {
      setNewDescription(task.description);
      return;
    }
    onUpdateTask(task.id, task.text, newDescription.trim(), task.reminder, task.dueDate, task.completed);
  };

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onUpdateTask(task.id, task.text, task.description, task.reminder, task.dueDate, newCheckedState);
  };

  const handleReminderClick = (e) => {
    e.stopPropagation();
    if (bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      setOverlayPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setShowReminderOverlay((prev) => !prev);
    }
  };

  const handlePresetSelect = (preset) => {
    const newReminder = {
      label: preset.label || "No Reminder",
      time: preset.label === "Tomorrow" ? "2025-02-20T10:00:00Z" : preset.time,
    };
    setReminder(newReminder);
    setShowReminderOverlay(false);
    onUpdateTask(task.id, task.text, task.description, newReminder, task.dueDate, false);
  };

  const handleDueDateClick = (e) => {
    e.stopPropagation();
    if (dueDateRef.current) {
      const rect = dueDateRef.current.getBoundingClientRect();
      setOverlayPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setShowDueOverlay((prev) => !prev);
    }
  };

  const handleDueDateSelect = (date) => {
    const newDueDate = date ? `${date}:00Z` : null;
    setDueDate(newDueDate);
    setShowDueOverlay(false);
    onUpdateTask(task.id, task.text, task.description, task.reminder, newDueDate, false);
  };

  const renderReminderIcon = () => {
    if (!reminder.time) {
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
      formattedTime = formatReminderTime(reminder.time);
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

  const renderDueDate = () => {
    const isNoDueDate = !dueDate;
    const formattedDueDate = isNoDueDate ? "No Due Date" : formatDueDate(dueDate);

    return (
      <div
        ref={dueDateRef}
        className={`due-date-text ${isNoDueDate ? "no-due-date" : "due-date-set"}`}
        onClick={handleDueDateClick}
        data-tooltip="Due Date"
        data-tooltip-position="top"
        data-testid="due-date"
      >
        <input
          type="datetime-local"
          value={dueDate ? new Date(dueDate).toISOString().slice(0, 16) : ""}
          onChange={(e) => handleDueDateSelect(e.target.value)}
          style={{ display: "none" }}
          aria-label="due date"
        />
        {formattedDueDate}
      </div>
    );
  };

  return (
    <Card
      className={`task-card ${isDescriptionVisible || isHovering || isEditingDescription ? "highlighted-border" : "default-border"}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        if (!isEditingDescription) {
          setIsHovering(false);
        }
      }}
      onClick={() => {
        if (!isEditingDescription) {
          setIsDescriptionVisible(!isDescriptionVisible);
        }
      }}
    >
      <Card.Body>
        <Row className="align-items-center">
          <Col xs="auto">
            <Form.Check
              type="checkbox"
              onChange={handleCheckboxChange}
              checked={isChecked}
              className="custom-checkbox"
              style={{ transform: "scale(1.5)", marginRight: "7px" }}
            />
          </Col>
          <Col>
            {isEditing ? (
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => handleKeyPress(e, saveTitle)}
                autoFocus
                className="edit-input"
              />
            ) : (
              <div className={`task-name ${isChecked ? "line-through" : ""}`} 
              onDoubleClick={() => setIsEditing(true)}
              style={{ color: isOverdue ? "red" : "black" }} // task turns red if overdue
              >
                {newText}
              </div>
            )}
            {renderDueDate()}
          </Col>
          <Col xs="auto" className="task-icons">
            <Button 
              ref={bellButtonRef} 
              variant="link" 
              onClick={handleReminderClick} 
              className="reminder-btn"
              aria-label="reminder"
              data-tooltip="Reminder"
              data-tooltip-position="top"
            >
              {renderReminderIcon()}
            </Button>
            {showReminderOverlay && (
              <ReminderOverlay
                onSelectPreset={handlePresetSelect}
                targetPosition={overlayPosition}
                onClose={() => setShowReminderOverlay(false)}
                bellButtonRef={bellButtonRef}
              />
            )}
            {showDueOverlay && (
              <DueOverlay
                onSelectDate={handleDueDateSelect}
                targetPosition={overlayPosition}
                onClose={() => setShowDueOverlay(false)}
                calendarButtonRef={dueDateRef}
              />
            )}
            <Button 
              variant="link" 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
              className="delete-btn"
              aria-label="delete"
            >
              <FaTrashAlt data-tooltip="Delete" data-tooltip-position="top" style={{ width: "20px", height: "20px" }} />
            </Button>
          </Col>
        </Row>

        <Collapse in={isDescriptionVisible || isHovering || isEditingDescription}>
          <div className="mt-2">
            {isEditingDescription ? (
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={saveDescription}
                onKeyDown={(e) => handleKeyPress(e, saveDescription)}
                autoFocus
                className="edit-description"
              />
            ) : (
              <Card.Text className="description-text" onDoubleClick={() => setIsEditingDescription(true)}>
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