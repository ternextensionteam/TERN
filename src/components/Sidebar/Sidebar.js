import React, { useState } from "react";
import { Container, Nav } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import { LuListTodo } from "react-icons/lu";
import { AiOutlineNodeIndex } from "react-icons/ai";

import TaskSection from "../TaskSection/TaskSection";
import IndexingSection from "../IndexingSection/IndexingSection";
import "../tooltip";
import "../base.css";
import "./SideBar.css";

function Sidebar() {
  const [activeSection, setActiveSection] = useState("tasks");

  return (
    <Container className="sidebar">
      <Nav variant="tabs" className="mb-2 d-flex" style={{ paddingTop: "10px" }}>
        <Nav.Item>
          <label data-tooltip="To do" data-tooltip-position="bottom">
            <Nav.Link
              active={activeSection === "tasks"}
              onClick={() => setActiveSection("tasks")}
            >
              <LuListTodo className="icon" size={25} />
              <span style={{ marginLeft: "8px" }}>Tasks</span>
            </Nav.Link>
          </label>
        </Nav.Item>
        <Nav.Item>
          <label data-tooltip="Indexing" data-tooltip-position="bottom">
            <Nav.Link
              active={activeSection === "indexing"}
              onClick={() => setActiveSection("indexing")}
            >
              <AiOutlineNodeIndex className="icon" size={25} />
              <span style={{ marginLeft: "8px" }}>Indexing</span>
            </Nav.Link>
          </label>
        </Nav.Item>
        <Nav.Item className="ms-auto">
          <label data-tooltip="Settings" data-tooltip-position="bottom">
            <Nav.Link
              active={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
            >
              <FaCog size={25} />
            </Nav.Link>
          </label>
        </Nav.Item>
      </Nav>

      {/* Conditionally Render Sections */}
      {activeSection === "tasks" && <TaskSection />}
      {activeSection === "indexing" && <IndexingSection />}
      {activeSection === "settings" && <div>Settings</div>}
    </Container>
  );
}

export default Sidebar;