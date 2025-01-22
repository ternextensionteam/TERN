<<<<<<< HEAD
import React, { useState } from "react";
import { Card, Row, Col, Form, Collapse, Button } from "react-bootstrap";
import { FaTrashAlt, FaBell, FaBellSlash } from "react-icons/fa";
import "./TodoItem.css";
=======
import React, { useState, useRef, useEffect } from "react";
import { Card, Row, Col, Form, Collapse, Button } from "react-bootstrap";
import "./TodoItem.css";
import { FaTrashAlt } from "react-icons/fa";
>>>>>>> feature/update-todo-styling

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
<<<<<<< HEAD
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newText, setNewText] = useState(task.text || "");
  const [newDescription, setNewDescription] = useState(task.description || "");
  const [isChecked, setIsChecked] = useState(false);
  const [isReminderOn, setIsReminderOn] = useState(task.reminder ?? true);
=======
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(task.text);
  const [isChecked, setIsChecked] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
>>>>>>> feature/update-todo-styling

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

<<<<<<< HEAD
  const handleDescriptionDoubleClick = () => {
    setIsDescriptionVisible(true);
    setIsEditingDescription(true);
  };

  const handleTitleChange = (e) => {
    setNewText(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setNewDescription(e.target.value);
  };

  const saveTitle = () => {
    setIsEditing(false);
    if (newText.trim() === "") {
      setNewText(task.text);
    }
    onUpdateTask(task.id, newText.trim());
  };

  const saveDescription = () => {
    setIsEditingDescription(false);
    onUpdateTask(task.id, null, newDescription.trim());
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
=======
  const handleChange = (e) => {
    setNewText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateTask(task.id, newText);
  };

  const handleClickOutside = (event) => {
    if (cardRef.current && !cardRef.current.contains(event.target)) {
      setIsDescriptionVisible(false);
    }
  };

  const handleDescriptionToggle = () => {
    setIsDescriptionVisible(true);
>>>>>>> feature/update-todo-styling
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

<<<<<<< HEAD
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
=======
  return (
    <Card
      ref={cardRef}
      className={`mt-2 ${
        isDescriptionVisible ? "highlighted-border" : "default-border"
      }`}
      onClick={handleDescriptionToggle}
      style={{
        cursor: "pointer",
      }}
    >
      <Card.Body style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
        <Row>
          <Col xs="auto" className="d-flex align-items-center">
>>>>>>> feature/update-todo-styling
            <Form.Check
              type="checkbox"
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              checked={isChecked}
              className="custom-checkbox"
              style={{
                transform: "scale(1.5)",
<<<<<<< HEAD
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
            >
              {isReminderOn ? (
                <FaBell
                  className="reminder-icon reminder-on"
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
=======
                cursor: "pointer",
              }}
            />
          </Col>
          <Col>
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
            >
              <img
                src={
                  task.reminder
                    ? `/vector_arts/checked_bell.png`
                    : `/vector_arts/bell.png`
                }
                alt="Reminder"
                style={{ width: "20px", height: "20px" }}
              />
            </Button>
          </Col>
          <Col xs="auto" className="d-flex align-items-center">
            <Button
              variant="link"
              onClick={(e) => {
                e.stopPropagation(); // Prevent description toggle
                onDelete(task.id);
              }}
              style={{ padding: 0 }}
>>>>>>> feature/update-todo-styling
            >
              <FaTrashAlt
                style={{
                  width: "20px",
                  height: "20px",
<<<<<<< HEAD
                }}
                className="fa-trash-alt"
=======
                  color: "#dc3545",
                }}
                aria-label="Delete Task"
>>>>>>> feature/update-todo-styling
              />
            </Button>
          </Col>
        </Row>
<<<<<<< HEAD

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
=======
        {/* Collapsible Description */}
        {task.description && (
          <Collapse in={isDescriptionVisible}>
            <div className="mt-2">
              <Card.Text style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                {task.description}
              </Card.Text>
>>>>>>> feature/update-todo-styling
            </div>
          </Collapse>
        )}
      </Card.Body>
    </Card>
  );
}

export default TodoItem;
