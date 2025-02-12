import React, { useState } from "react";
import { Container, Nav } from "react-bootstrap";
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
<<<<<<< HEAD
    updateStringMatch
  } = useIndexMatching();

  const sectionFunctions = {
    sites: { add: addSite, remove: removeSite, update: updateSite },
    regex: { add: addRegex, remove: removeRegex, update: updateRegex },
    urls: { add: addUrl, remove: removeUrl, update: updateUrl },
=======
    updateStringMatch,
  } = useIndexMatching();

  const sections = [
    { key: "allowedSites", label: "Sites" },
    { key: "allowedUrls", label: "URLs" },
    { key: "stringmatches", label: "String Matches" },
    { key: "regex", label: "RegEx" },
  ];

  const sectionFunctions = {
    allowedSites: { add: addSite, remove: removeSite, update: updateSite },
    regex: { add: addRegex, remove: removeRegex, update: updateRegex },
    allowedURLs: { add: addUrl, remove: removeUrl, update: updateUrl },
>>>>>>> origin/main
    stringmatches: { add: addStringMatch, remove: removeStringMatch, update: updateStringMatch }
  };

  const sectionItems = {
<<<<<<< HEAD
    sites:sites,
    regex: regexs,
    urls:urls,
    stringmatches: stringMatches
  };

  const currentFunctions = sectionFunctions[activeIndexSection];
  const currentItems = sectionItems[activeIndexSection];

  return (
    <Container>
      <Nav variant="tabs" activeKey={activeIndexSection} onSelect={setActiveIndexSection}>
      <Nav.Item>
          <Nav.Link
            eventKey="sites"
            active={activeIndexSection === "sites"}
            onClick={() => setActiveIndexSection("sites")}
            className='subnav-link'
          >
            sites
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="urls"
            active={activeIndexSection === "urls"}
            onClick={() => setActiveIndexSection("urls")}
            className='subnav-link'
          >
            URLs
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="stringmatches"
            active={activeIndexSection === "stringmatches"}
            onClick={() => setActiveIndexSection("stringmatches")}
            className='subnav-link'
          >
            String matches
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="regex"
            active={activeIndexSection === "regex"}
            onClick={() => setActiveIndexSection("regex")}
            className='subnav-link'
          >
            RegEx
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Conditionally Render Sections */}
      {activeIndexSection === "sites" && <div>showing sites list</div>}
      {activeIndexSection === "urls" && <div>showing urls list</div>}
      {activeIndexSection === "stringmatches" && <div>showing stringmatches list</div>}
      {activeIndexSection === "regex" && <div>showing regex list</div>}

      {/* Pass the functions to IndexInput */}
      <IndexInput {...currentFunctions} />

      {/* Pass the items to IndexList */}
      <IndexList items={currentItems} />
=======
    allowedSites:allowedSites,
    regex: allowedRegex,
    allowedURLs:allowedURLs,
    stringmatches: allowedStringMatches
  };

  return (
    <Container className="indexing-section">
      <Nav variant="tabs" activeKey={activeIndexSection} onSelect={setActiveIndexSection}>
        {sections.map((section) => (
          <Nav.Item key={section.key}>
            <Nav.Link
              eventKey={section.key}
              className={`subnav-link ${activeIndexSection === section.key ? "active" : ""}`}
            >
              {section.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

 
      <div className="indexing-box">
        <h2 className="section-title">
          Showing {sections.find(s => s.key === activeIndexSection)?.label} List
        </h2>

        <IndexInput {...sectionFunctions[activeIndexSection]} />
      </div>

      <IndexList items={sectionItems[activeIndexSection]} />
>>>>>>> origin/main
    </Container>
  );
};

<<<<<<< HEAD
export default IndexingSection;
=======
export default IndexingSection;
>>>>>>> origin/main
