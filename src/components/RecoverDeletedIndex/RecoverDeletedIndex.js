import React, { useState } from "react";
import { Card, Button, Nav } from "react-bootstrap";
import { FaRedo } from "react-icons/fa";
import { IoChevronBackOutline } from "react-icons/io5";
import "../tooltip";
import "../base.css";
import "./RecoverDeletedIndex.css";

const RecoverDeletedIndex = ({
  deletedItems = {},
  onRecover,
  onBack,
  onGoToIndexing,
  activeItems = {},
}) => {
  const [activeDeletedSection, setActiveDeletedSection] =
    useState("allowedSites");

  const safeDeletedItems = deletedItems || {
    allowedSites: [],
    allowedURLs: [],
    stringmatches: [],
    regex: [],
  };

  const sectionMap = {
    allowedSites: { label: "Sites" },
    allowedURLs: { label: "URLs" },
    allowedStringMatches: { label: "String Matches" },
    allowedRegex: { label: "RegEx" },
  };

  console.log(
    `RecoverDeletedIndex - Raw deletedItems[${activeDeletedSection}]:`,
    safeDeletedItems[activeDeletedSection]
  );
  console.log(
    `RecoverDeletedIndex - Raw activeItems[${activeDeletedSection}]:`,
    activeItems[activeDeletedSection]
  );

  const filteredDeletedItems = (
    safeDeletedItems[activeDeletedSection] || []
  ).filter((item) => !(activeItems[activeDeletedSection] || []).includes(item));

  console.log(
    `RecoverDeletedIndex - Filtered deleted items for ${activeDeletedSection}:`,
    filteredDeletedItems
  );

  return (
    <div className="recover-deleted-container">
      <h2 className="section-title">
        Deleted {sectionMap[activeDeletedSection]?.label}
      </h2>

      <Nav
        variant="tabs"
        activeKey={activeDeletedSection}
        onSelect={setActiveDeletedSection}
      >
        {Object.keys(sectionMap).map((key) => (
          <Nav.Item key={key}>
            <Nav.Link
              eventKey={key}
              className={`subnav-link ${
                activeDeletedSection === key ? "active" : ""
              }`}
              data-tooltip={sectionMap[key].label}
              data-tooltip-position="top"
            >
              {sectionMap[key].label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <div className="recover-card-container">
        {filteredDeletedItems.length === 0 ? (
          <p className="empty-message">
            No deleted {sectionMap[activeDeletedSection]?.label} to recover.
          </p>
        ) : (
          filteredDeletedItems.map((item, index) => (
            <Card className="recover-card" key={index}>
              <Card.Body className="recover-card-body">
                <span className="recover-text">{item}</span>
                <Button
                  variant="success"
                  onClick={() => onRecover(activeDeletedSection, item)}
                  className="recover-btn"
                  data-tooltip="Recover link"
                  data-tooltip-position="top"
                >
                  <FaRedo />
                </Button>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
      <Button
        variant="secondary"
        onClick={onBack}
        className="back-btn1"
        data-tooltip="Back"
      >
        <IoChevronBackOutline />
      </Button>
    </div>
  );
};

export default RecoverDeletedIndex;
