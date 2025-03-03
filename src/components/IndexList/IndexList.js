import React from 'react';
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import './IndexList.css';

const IndexList = ({ items = [], onDelete }) => {
  const handleDelete = (e, index) => {
    e.stopPropagation();
    console.log(`IndexList - Delete clicked for item ${index}`);

    setTimeout(() => {
      if (onDelete) onDelete(index);
    }, 250);
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
                  onClick={(e) => handleDelete(e, index)}
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
