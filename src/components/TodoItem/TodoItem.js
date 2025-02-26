import React, { useRef, useState, useEffect } from "react";
import { Card, Row, Col, Form, Collapse, Button } from "react-bootstrap";
import { FaTrashAlt, FaBell, FaBellSlash } from "react-icons/fa";
import "../tooltip";
import "../base.css";
import DueOverlay from "../DueOverlay"; // Ensure this is the correct import
import "./TodoItem.css";

function TodoItem({ task, onDelete, onUpdateTask }) {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newText, setNewText] = useState(task.text || "");
  const [newDescription, setNewDescription] = useState(task.description || "");
  const [isChecked, setIsChecked] = useState(task.completed || false);
  const [hasReminder, setHasReminder] = useState(task.hasReminder || false);
  const [dueDate, setDueDate] = useState(task.dueDate || null);
  const [showDueOverlay, setShowDueOverlay] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  const bellButtonRef = useRef(null);
  const dueDateRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    setHasReminder(task.hasReminder || false);
    const parsedDueDate = task.dueDate ? new Date(task.dueDate) : null;
    setDueDate(parsedDueDate && !isNaN(parsedDueDate.getTime()) ? parsedDueDate.toISOString() : null);
    setIsChecked(task.completed || false);
    setNewText(task.text || "");
    setNewDescription(task.description || "");
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
    onUpdateTask(task.id, newText.trim(), newDescription, hasReminder, dueDate);
  };

  const saveDescription = () => {
    setIsEditingDescription(false);
    onUpdateTask(task.id, newText, newDescription.trim(), hasReminder, dueDate);
  };

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onUpdateTask(task.id, newText, newDescription, hasReminder, dueDate);
  };

  const handleReminderClick = (e) => {
    e.stopPropagation();
    const newReminderState = !hasReminder;
    setHasReminder(newReminderState);
    onUpdateTask(task.id, newText, newDescription, newReminderState, dueDate);
  };

  const handleDueDateMouseDown = (e) => {
    e.stopPropagation();
    console.log("Mouse down on due date");
    longPressTimer.current = setTimeout(() => {
      setShowDueOverlay(false);
    }, 500);
  };

  const handleDueDateMouseUp = (e) => {
    e.stopPropagation();
    console.log("Mouse up on due date");
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;

      if (dueDateRef.current) {
        const rect = dueDateRef.current.getBoundingClientRect();
        setOverlayPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
        console.log("Toggling DueOverlay, current state:", showDueOverlay);
        setShowDueOverlay((prev) => !prev);
      }
    }
  };

  const handleDueDateSelect = (preset) => {
    console.log("Selected preset from DueOverlay:", preset);
    let newDueDate = null;
    if (preset && preset.time) {
      const parsedDate = new Date(preset.time);
      if (!isNaN(parsedDate.getTime())) {
        newDueDate = parsedDate.toISOString();
      } else {
        console.error("Invalid time in preset:", preset.time);
      }
    }
    console.log("New due date set:", newDueDate);
    setDueDate(newDueDate);
    setShowDueOverlay(false);
    onUpdateTask(task.id, newText, newDescription, hasReminder, newDueDate);
  };

  const renderReminderIcon = () => {
    return (
      <Button
        ref={bellButtonRef}
        variant="link"
        onClick={handleReminderClick}
        className="reminder-btn"
      >
        {hasReminder ? (
          <FaBell
            className="reminder-icon reminder-on"
            data-tooltip="Reminder on"
            data-tooltip-position="top"
            style={{ width: "24px", height: "24px" }}
          />
        ) : (
          <FaBellSlash
            className="reminder-icon reminder-off"
            data-tooltip="No Reminder"
            data-tooltip-position="top"
            style={{ width: "24px", height: "24px" }}
          />
        )}
      </Button>
    );
  };

  const renderDueDate = () => {
    const formatDateTime = (date) => {
      if (!date) return "No Due Date";
      const dueDate = new Date(date);
      if (isNaN(dueDate.getTime())) return "Invalid Date";

      return dueDate.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).replace(/,/, "");
    };

    return (
      <div
        ref={dueDateRef}
        className={`due-date-text ${!dueDate ? "no-due-date" : "due-date-set"}`}
        onMouseDown={handleDueDateMouseDown}
        onMouseUp={handleDueDateMouseUp}
        data-tooltip="Due Date"
        data-tooltip-position="top"
        data-testid="due-date"
      >
        {formatDateTime(dueDate)}
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
      onClick={(e) => {
        e.stopPropagation();
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
              <div className={`task-name ${isChecked ? "line-through" : ""}`} onDoubleClick={() => setIsEditing(true)}>
                {newText}
              </div>
            )}
            {renderDueDate()}
          </Col>
          <Col xs="auto" className="task-icons">
            {renderReminderIcon()}
            {showDueOverlay && (
              <DueOverlay
                onSelectPreset={handleDueDateSelect} // Changed to onSelectPreset
                targetPosition={overlayPosition}
                onClose={() => setShowDueOverlay(false)}
                bellButtonRef={dueDateRef} // Use dueDateRef instead of bellButtonRef
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