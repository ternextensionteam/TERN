import React, { useState } from "react";
import { Card, Row, Col, Form, Collapse, Button } from "react-bootstrap";
import { FaTrashAlt, FaBell, FaBellSlash } from "react-icons/fa";
import "../tooltip";
import "../base.css";
import "./TodoItem.css";

const isOverdue = (dueDate) => new Date(dueDate) < new Date();

const formatDate = (date) => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
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
  const [isReminderOn, setIsReminderOn] = useState(task.reminder ?? true);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleDescriptionDoubleClick = () => {
    setIsDescriptionVisible(true);
    setIsEditingDescription(true);
  };

  const handleTitleChange = (e) => {
    setNewText(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    const textarea = e.target;
    setNewDescription(e.target.value);
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  };

  const saveTitle = () => {
    setIsEditing(false);
    if (newText.trim() === "") {
      setNewText(task.text);
    }
    onUpdateTask(task.id, newText.trim(), newDescription); // Preserve description
  };

  const saveDescription = () => {
    setIsEditingDescription(false);
    const trimmedDescription = newDescription.trim();
    onUpdateTask(task.id, newText, trimmedDescription); // Preserve title
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveTitle();
    }
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === "Enter") {
      saveDescription();
    }
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleReminderToggle = (e) => {
    e.stopPropagation();
    setIsReminderOn(!isReminderOn);
    onToggleReminder(task.id);
  };

  const handleMouseEnter = () => {
    if (!isDescriptionVisible) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isDescriptionVisible) {
      setIsHovering(false);
    }
  };

  const handleDescriptionToggle = (e) => {
    if (
      e.target.tagName === "INPUT" || 
      e.target.tagName === "BUTTON" || 
      e.target.closest(".custom-checkbox")
    ) {
      return;
    }
    e.stopPropagation();
    setIsDescriptionVisible(!isDescriptionVisible);
  };

  return (
    <Card
      className={`task-card ${isDescriptionVisible ? "highlighted-border" : "default-border"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleDescriptionToggle}
    >
      <Card.Body>
        <Row className="align-items-center">
          {/* Checkbox */}
          <Col xs="auto" className="d-flex align-items-start">
            <Form.Check
              type="checkbox"
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              checked={isChecked}
              className="custom-checkbox"
              style={{
                transform: "scale(1.5)",
                marginRight: "7px",
              }}
            />
          </Col>

          {/* Task Title and Due Date */}
          <Col className="task-content">
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
            {task.due && (
              <div className={`due-date ${isOverdue(task.due) ? "overdue" : ""}`}>
                {formatDate(new Date(task.due))}
              </div>
            )}
          </Col>

          {/* Reminder and Delete Icons */}
          <Col xs="auto" className="task-icons">
            <Button
              variant="link"
              onClick={handleReminderToggle}
              className="reminder-btn"
              data-tooltip="Remind Me" 
              data-tooltip-position="bottom"
            >
              {isReminderOn ? (
                <FaBell
                  className="reminder-icon reminder-on"
                  data-tooltip="Remind Me" 
                  data-tooltip-position="bottom"
                  style={{
                    width: "24px",
                    height: "24px",
                  }}
                />
              ) : (
                <FaBellSlash
                  className="reminder-icon reminder-off"
                  style={{
                    width: "24px",
                    height: "24px",
                  }}
                />
              )}
            </Button>
            <Button
              variant="link"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="delete-btn"
              data-tooltip="Delete task" 
              data-tooltip-position="bottom"
            >
              <FaTrashAlt
                style={{
                  width: "20px",
                  height: "20px",
                }}
                className="fa-trash-alt"
              />
            </Button>
          </Col>
        </Row>

        {/* Task Description */}
        {task.description && (
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
                  {newDescription}
                </Card.Text>
              )}
            </div>
          </Collapse>
        )}
      </Card.Body>
    </Card>
  );
}

export default TodoItem;
