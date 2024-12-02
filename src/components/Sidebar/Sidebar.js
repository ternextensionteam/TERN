import React, { useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { FaCog } from "react-icons/fa";

import TaskSection from "../TaskSection/TaskSection";
import "./Sidebar.css";

function Sidebar() {
  const [activeSection, setActiveSection] = useState("tasks");

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
            Indexing
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
      {activeSection === "indexing" && <div>Indexing</div>}
      {activeSection === "settings" && <div>Settings</div>}
    </Container>
  );
}

export default Sidebar;
