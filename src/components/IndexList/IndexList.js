import React from 'react';
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import './IndexList.css';
import { logToMessage } from "../../utils/Logger";

const IndexList = ({ items = [], onDelete, activeIndexSection}) => {
  const handleDelete = (e, item) => {
    e.stopPropagation();
    logToMessage(0, `IndexList - Delete clicked for rule: ${item}`);
    onDelete(activeIndexSection, item);
  };

  return (
    <div className="index-list-container">
      {items.map((item, index) => (
        <Card className="index-card" key={index}>
          <Card.Body>
            <Row className="align-items-center">
              <Col>
                <div className="index-url">{item}</div>
              </Col>
              <Col xs="auto" className="index-icons">
                <Button
                  variant="link"
                  onClick={(e) => handleDelete(e, item)}
                  className="delete-btn"
                  aria-label="delete"
                >
                  <FaTrashAlt 
                    data-tooltip="Delete" 
                    data-tooltip-position="top" 
                    style={{ width: "20px", height: "20px" }} 
                  />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default IndexList;
