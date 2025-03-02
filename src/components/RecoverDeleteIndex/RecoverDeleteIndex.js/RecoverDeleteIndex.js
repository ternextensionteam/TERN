import React, { useState } from "react";
import { Card, Button, Nav } from "react-bootstrap";
import { FaRedo } from "react-icons/fa";
import "./RecoverDeletedIndex.css";

const RecoverDeletedIndex = ({ deletedItems, onRecover, onBack }) => {
  const [activeDeletedSection, setActiveDeletedSection] = useState("allowedSites");

  const sectionFunctions = {
    allowedSites: { label: "Sites" },
    regex: { label: "RegEx" },
    allowedURLs: { label: "URLs" },
    stringmatches: { label: "String Matches" },
  };

  const filteredDeletedItems = deletedItems[activeDeletedSection] || [];

  return (
    <div className="recover-deleted-container">
      <h2 className="section-title">Recover Deleted Index</h2>

      <Nav variant="tabs" activeKey={activeDeletedSection} onSelect={setActiveDeletedSection}>
        {Object.keys(sectionFunctions).map((key) => (
          <Nav.Item key={key}>
            <Nav.Link eventKey={key} className={`subnav-link ${activeDeletedSection === key ? "active" : ""}`}>
              {sectionFunctions[key].label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {filteredDeletedItems.length === 0 ? (
        <p className="empty-message">No deleted {sectionFunctions[activeDeletedSection].label} to recover.</p>
      ) : (
        filteredDeletedItems.map((item, index) => (
          <Card className="recover-card" key={index}>
            <Card.Body className="recover-card-body">
              <span className="recover-text">{item}</span>
              <Button
                variant="success"
                onClick={() => onRecover(activeDeletedSection, index)}
                className="recover-btn"
              >
                <FaRedo /> Recover
              </Button>
            </Card.Body>
          </Card>
        ))
      )}

      <Button variant="secondary" onClick={onBack} className="back-btn">
        Back to Indexed List
      </Button>
    </div>
  );
};

export default RecoverDeletedIndex;
