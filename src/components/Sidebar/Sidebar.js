import React, { useState, useEffect, useRef } from "react";
import { Nav } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import { LuListTodo } from "react-icons/lu";
import { AiOutlineNodeIndex } from "react-icons/ai";
import WhitelistIndicator from "../WhitelistIndicator/WhitelistIndicator";
import TaskSection from "../TaskSection/TaskSection";
import IndexingSection from "../IndexingSection/IndexingSection";
import "../tooltip";
import "../base.css";
import "./Sidebar.css";
import SettingsSection from "../SettingsSection/SettingsSection";

function Sidebar() {
  const [activeSection, setActiveSection] = useState("tasks");
  const sidebarRef = useRef(null);

  useEffect(() => {
    const loadAndApplySettings = (attempt = 0) => {
      const maxAttempts = 3;
      const delay = 500;

      const tryLoad = () => {
        chrome.storage.local.get(['theme', 'themeColor'], (result) => {
          if (chrome.runtime.lastError) {
            if (attempt < maxAttempts) {
              console.warn('Storage not ready, retrying...', chrome.runtime.lastError);
              setTimeout(() => tryLoad(), delay * (attempt + 1));
            } else {
              console.error('Failed to load settings after ' + maxAttempts + ' attempts:', chrome.runtime.lastError);
              applyDefaultSettings();
            }
            return;
          }

          const savedTheme = result.theme || 'system';
          const savedThemeColor = result.themeColor || '#0069b9';

          document.documentElement.setAttribute('data-theme', savedTheme);
          if (savedTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
          }
          document.documentElement.style.setProperty('--primary-color', savedThemeColor);

          chrome.runtime.sendMessage({
            type: 'applyTheme',
            theme: savedTheme,
            themeColor: savedThemeColor
          });
        });
      };

      tryLoad();
    };

    const applyDefaultSettings = () => {
      console.log('Applying default settings');
      document.documentElement.setAttribute('data-theme', 'system');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      document.documentElement.style.setProperty('--primary-color', '#0069b9');
      chrome.runtime.sendMessage({
        type: 'applyTheme',
        theme: 'system',
        themeColor: '#0069b9'
      });
    };

    loadAndApplySettings();

    const timer = setTimeout(() => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.add('loaded');
      }
    }, 100);

    const checkOverflow = () => {
      if (sidebarRef.current) {
        const contentHeight = sidebarRef.current.scrollHeight;
        const viewportHeight = window.innerHeight;
        if (contentHeight > viewportHeight) {
          sidebarRef.current.classList.add('content-overflow');
        } else {
          sidebarRef.current.classList.remove('content-overflow');
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    const storageChangeHandler = (changes, area) => {
      if (area === 'local' && (changes.theme || changes.themeColor)) {
        console.log('Storage changed, reloading settings:', changes);
        loadAndApplySettings();
      }
    };

    chrome.storage.onChanged.addListener(storageChangeHandler);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (document.documentElement.getAttribute('data-theme') === 'system') {
        document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      chrome.storage.onChanged.removeListener(storageChangeHandler);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('resize', checkOverflow);
      clearTimeout(timer);
    };
  }, [activeSection]);

  return (
    <div ref={sidebarRef} className="sidebar">
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
              <WhitelistIndicator />
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

      {activeSection === "tasks" && <TaskSection />}
      {activeSection === "indexing" && <IndexingSection />}
      {activeSection === "settings" && <SettingsSection />}
    </div>
  );
}

export default Sidebar;