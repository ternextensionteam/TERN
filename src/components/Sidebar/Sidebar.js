import React, { useState, useEffect } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { FaCog } from "react-icons/fa";
import { checkWhitelist } from "../../utils/WhitelistChecker";
import TaskSection from "../TaskSection/TaskSection";
import IndexingSection from "../IndexingSection/IndexingSection";
import "./Sidebar.css";

function Sidebar() {
  const [activeSection, setActiveSection] = useState("tasks");
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  useEffect(() => {
    const updateWhitelistStatus = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      const result = await chrome.storage.local.get(
        ["allowedSites", "allowedURLs", "allowedStringMatches", "allowedRegex"]
      );

      const cachedWhitelist = {
        sites: result.allowedSites || [],
        urls: result.allowedURLs || [],
        stringMatches: result.allowedStringMatches || [],
        regex: result.allowedRegex || []
      };
      const currentURL = currentTab.url;
      const isPageWhitelisted = await checkWhitelist(currentURL, cachedWhitelist);
      console.log("isPageWhitelisted below", isPageWhitelisted);
      console.log("currentTab.url", currentTab.url);
      setIsWhitelisted(isPageWhitelisted);
    };

    // Initial check
    updateWhitelistStatus();

    // Listener for whitelist updates
    const handleStorageChange = (changes, namespace) => {
      if (
        namespace === "local" &&
        (changes.allowedSites || changes.allowedURLs || changes.allowedStringMatches || changes.allowedRegex)
      ) {
        updateWhitelistStatus();
      }
    };

    // Listener for tab changes
    const handleTabChange = () => {
      updateWhitelistStatus();
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    chrome.tabs.onActivated.addListener(handleTabChange);

    // Cleanup
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.tabs.onActivated.removeListener(handleTabChange);
    };
  }, []);

  return (
    <Container>
      {/* Navigation */}
      <Nav variant="tabs" className="mb-2 d-flex">
        <Nav.Item>
          <Nav.Link
            eventKey="tasks"
            active={activeSection === "tasks"}
            onClick={() => setActiveSection("tasks")}
          >
            Tasks
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="indexing"
            active={activeSection === "indexing"}
            onClick={() => setActiveSection("indexing")}
          >
            Indexing{" "}
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: isWhitelisted ? "green" : "gray",
                marginLeft: "5px",
              }}
            ></span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="ms-auto">
          <Nav.Link
            eventKey="settings"
            active={activeSection === "settings"}
            onClick={() => setActiveSection("settings")}
          >
            <FaCog size={24} style={{ cursor: "pointer" }} />
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Conditionally Render Sections */}
      {activeSection === "tasks" && <TaskSection />}
      {activeSection === "indexing" && <div><IndexingSection /></div>}
      {activeSection === "settings" && <div>Settings</div>}
    </Container>
  );
}

export default Sidebar;