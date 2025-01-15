import React, { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import IndexInput from '../IndexInput/IndexInput';
import IndexList from '../IndexList/IndexList';
import './IndexingSection.css';
import useIndexMatching from '../../hooks/useIndexMatching/useIndexMatching';

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
    updateStringMatch
  } = useIndexMatching();

  const sectionFunctions = {
    allowedSites: { add: addSite, remove: removeSite, update: updateSite },
    regex: { add: addRegex, remove: removeRegex, update: updateRegex },
    allowedURLs: { add: addUrl, remove: removeUrl, update: updateUrl },
    stringmatches: { add: addStringMatch, remove: removeStringMatch, update: updateStringMatch }
  };

  const sectionItems = {
    allowedSites:allowedSites,
    regex: allowedRegex,
    allowedURLs:allowedURLs,
    stringmatches: allowedStringMatches
  };

  const currentFunctions = sectionFunctions[activeIndexSection];
  const currentItems = sectionItems[activeIndexSection];

  return (
    <Container>
      <Nav variant="tabs" activeKey={activeIndexSection} onSelect={setActiveIndexSection}>
      <Nav.Item>
          <Nav.Link
            eventKey="allowedSites"
            active={activeIndexSection === "allowedSites"}
            onClick={() => setActiveIndexSection("allowedSites")}
            className='subnav-link'
          >
            allowedSites
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="allowedURLs"
            active={activeIndexSection === "allowedURLs"}
            onClick={() => setActiveIndexSection("allowedURLs")}
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
      {activeIndexSection === "allowedSites" && <div>showing allowedSites list</div>}
      {activeIndexSection === "allowedURLs" && <div>showing allowedURLs list</div>}
      {activeIndexSection === "stringmatches" && <div>showing stringmatches list</div>}
      {activeIndexSection === "regex" && <div>showing regex list</div>}

      {/* Pass the functions to IndexInput */}
      <IndexInput {...currentFunctions} />

      {/* Pass the items to IndexList */}
      <IndexList items={currentItems} />
    </Container>
  );
};

export default IndexingSection;