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
    setReminder(task.reminder || { label: "No Reminder", time: null });
    setDueDate(task.dueDate || null);
    setIsChecked(task.completed || false);
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
    }
    onUpdateTask(task.id, newText.trim(), newDescription, reminder, dueDate, isChecked);
  };

  const saveDescription = () => {
    setIsEditingDescription(false);
    onUpdateTask(task.id, newText, newDescription.trim(), reminder, dueDate, isChecked);
  };

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onUpdateTask(task.id, newText, newDescription, reminder, dueDate, newCheckedState);
  };

  const handleReminderClick = (e) => {
    e.stopPropagation();
    if (bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      setOverlayPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setShowReminderOverlay((prev) => !prev); // Toggle the reminder overlay
    }
  };

  const handlePresetSelect = (preset) => {
    const newReminder = {
      label: preset.label || "No Reminder",
      time: preset.time ? new Date(preset.time).toISOString() : null,
    };
    setReminder(newReminder);
    setShowReminderOverlay(false); // Close the overlay after selecting a preset
    onUpdateTask(task.id, newText, newDescription, newReminder, dueDate, isChecked);
  };

  const handleDueDateClick = (e) => {
    e.stopPropagation();
    if (dueDateRef.current) {
      const rect = dueDateRef.current.getBoundingClientRect();
      setOverlayPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setShowDueOverlay((prev) => !prev); // Toggle the due date overlay
    }
  };

  const handleDueDateSelect = (date) => {
    const newDueDate = date ? new Date(date).toISOString() : null;
    setDueDate(newDueDate);
    setShowDueOverlay(false); // Close the overlay after selecting a date
    onUpdateTask(task.id, newText, newDescription, reminder, newDueDate, isChecked);
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
        onClick={handleDueDateClick} // Single click to toggle the overlay
        data-tooltip="Due Date"
        data-tooltip-position="top"
      >
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
<<<<<<< HEAD
            {isEditing ? (
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => handleKeyPress(e, saveTitle)}
                autoFocus
                className="edit-input"
=======
            <Row>
              <Col
                xs
                className="d-flex align-items-center"
                style={{ wordBreak: "break-word" }}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={newText}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoFocus
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      padding: 0,
                      margin: 0,
                      outline: "none",
                      boxShadow: "none",
                    }}
                  />
                ) : (
                  <div
                    onDoubleClick={handleDoubleClick}
                    style={{
                      textDecoration: isChecked ? "line-through" : "none",
                    }}
                  >
                    {task.text}
                  </div>
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {task.due && (
                  <div
                    className={`due-date ${
                      isOverdue(task.due) ? "overdue" : ""
                    }`}
                  >
                    {formatDate(new Date(task.due))}
                  </div>
                )}
              </Col>
            </Row>
          </Col>

          {/* Bell Icon */}
          <Col xs="auto" className="d-flex align-items-center">
            <Button
              variant="link"
              onClick={(e) => {
                e.stopPropagation(); // Prevent description toggle
                onToggleReminder(task.id);
              }}
              style={{ padding: 0 }}
              aria-label="Toggle Reminder"
            >
              <img
                src={
                  task.reminder
                    ? `/vector_arts/checked_bell.png`
                    : `/vector_arts/bell.png`
                }
                alt="Reminder"
                style={{ width: "20px", height: "20px" }}
>>>>>>> origin/main
              />
            ) : (
              <div className={`task-name ${isChecked ? "line-through" : ""}`} onDoubleClick={() => setIsEditing(true)}>
                {newText}
              </div>
            )}
            {renderDueDate()}
          </Col>
          <Col xs="auto" className="task-icons">
            <Button ref={bellButtonRef} variant="link" onClick={handleReminderClick} className="reminder-btn">
              {renderReminderIcon()}
            </Button>
            {showReminderOverlay && (
              <ReminderOverlay
                onSelectPreset={handlePresetSelect}
                targetPosition={overlayPosition}
                onClose={() => setShowReminderOverlay(false)}
              />
            )}
            {showDueOverlay && (
              <DueOverlay
                onSelectDate={handleDueDateSelect}
                targetPosition={overlayPosition}
                onClose={() => setShowDueOverlay(false)}
              />
            )}
            <Button variant="link" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="delete-btn">
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