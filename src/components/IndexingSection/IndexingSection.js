import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import "../tooltip";
import "../base.css";
import IndexInput from "../IndexInput/IndexInput";
import IndexList from "../IndexList/IndexList";
import "./IndexingSection.css";
import useIndexMatching from "../../hooks/useIndexMatching/useIndexMatching";

const IndexingSection = () => {
  const [activeIndexSection, setActiveIndexSection] = useState("allowedSites");
  const {
    allowedSites,
    allowedRegex,
    allowedURLs,
    allowedStringMatches,
    addSite,
    removeSite,
    updateSite,
    addRegex,
    removeRegex,
    updateRegex,
    addUrl,
    removeUrl,
    updateUrl,
    addStringMatch,
    removeStringMatch,
    updateStringMatch,
  } = useIndexMatching();

  const sections = [
    { key: "allowedSites", label: "Sites" },
    { key: "allowedURLs", label: "URLs" },
    { key: "stringmatches", label: "String Matches" },
    { key: "regex", label: "RegEx" },
  ];

  const sectionFunctions = {
    allowedSites: { add: addSite, remove: removeSite, update: updateSite },
    regex: { add: addRegex, remove: removeRegex, update: updateRegex },
    allowedURLs: { add: addUrl, remove: removeUrl, update: updateUrl },
    stringmatches: { add: addStringMatch, remove: removeStringMatch, update: updateStringMatch },
  };

  const sectionItems = {
    allowedSites: allowedSites,
    regex: allowedRegex,
    allowedURLs: allowedURLs,
    stringmatches: allowedStringMatches,
  };

  const handleDelete = (index) => {
    const removeFunction = sectionFunctions[activeIndexSection].remove;
    if (removeFunction) {
      removeFunction(index);
    } else {
      console.error(`No remove function found for section: ${activeIndexSection}`);
    }
  };

  console.log('Active section:', activeIndexSection, 'Functions:', sectionFunctions[activeIndexSection]);

  return (
    <>
      <div className="indexing-upper-container">
        <Nav variant="tabs" activeKey={activeIndexSection} onSelect={setActiveIndexSection}>
          {sections.map((section) => (
            <Nav.Item key={section.key}>
              <Nav.Link
                eventKey={section.key}
                className={`subnav-link ${activeIndexSection === section.key ? "active" : ""}`}
                data-tooltip={section.label}
                data-tooltip-position="top"
              >
                {section.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
        <div className="indexing-input-box">
          <IndexInput {...sectionFunctions[activeIndexSection]} />
        </div>
      </div>
      <div className="list-name">
        <h2 className="section-title">
          Indexed {sections.find(s => s.key === activeIndexSection)?.label}:
        </h2>
      </div>
      <IndexList 
        items={sectionItems[activeIndexSection]} 
        onDelete={handleDelete} 
      />
    </>
  );
};

export default IndexingSection;
