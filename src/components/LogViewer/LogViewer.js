import React, { useState, useEffect } from "react";
import { Button, Tabs, Tab, Badge, Collapse } from "react-bootstrap";
import { FaDownload, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { getLogs, downloadLogs, clearLogs } from "../../utils/Logger";
import "./LogViewer.css";

const LogViewer = () => {
  const [logs, setLogs] = useState({
    0: [], // DEBUG
    1: [], // INFO
    2: [], // CRITICAL
  });
  const [activeKey, setActiveKey] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const refreshLogs = async () => {
    setIsLoading(true);
    try {
      const debugLogs = await getLogs(0);
      const infoLogs = await getLogs(1);
      const criticalLogs = await getLogs(2);
      
      setLogs({
        0: debugLogs,
        1: infoLogs,
        2: criticalLogs,
      });
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      refreshLogs();
    }
    
    // Set up listener for new logs
    const storageListener = (changes, area) => {
      if (area === "local" && changes.extensionLogs && isExpanded) {
        refreshLogs();
      }
    };
    
    chrome.storage.onChanged.addListener(storageListener);
    
    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, [isExpanded]);

  const handleDownload = (level) => {
    downloadLogs(level);
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear all logs?")) {
      await clearLogs();
      refreshLogs();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="log-viewer">
      <div className="log-header">
        <Button 
          variant="link" 
          onClick={toggleExpand} 
          className="collapse-toggle"
          aria-expanded={isExpanded}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          <span>Application Logs</span>
          <Badge bg="secondary" className="log-count">
            {logs[0].length + logs[1].length + logs[2].length}
          </Badge>
        </Button>
      </div>

      <Collapse in={isExpanded}>
        <div>
          <div className="log-actions">
            <Button 
              variant="outline-primary" 
              onClick={refreshLogs} 
              disabled={isLoading}
              size="sm"
            >
              Refresh
            </Button>
            <Button 
              variant="outline-danger" 
              onClick={handleClear}
              disabled={isLoading}
              size="sm"
            >
              <FaTrash /> Clear All Logs
            </Button>
          </div>

          <Tabs
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
            className="mb-3 compact-tabs"
          >
            <Tab 
              eventKey="0" 
              title={
                <span className="tab-title">
                  Debug <Badge bg="secondary">{logs[0].length}</Badge>
                </span>
              }
            >
              <div className="log-actions">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleDownload(0)}
                  disabled={logs[0].length === 0}
                  size="sm"
                >
                  <FaDownload /> Download
                </Button>
              </div>
              <div className="log-container">
                {isLoading ? (
                  <div className="text-center p-3">Loading logs...</div>
                ) : logs[0].length === 0 ? (
                  <div className="text-center p-3">No debug logs available</div>
                ) : (
                  <pre>{logs[0].join('\n')}</pre>
                )}
              </div>
            </Tab>
            
            <Tab 
              eventKey="1" 
              title={
                <span className="tab-title">
                  Info <Badge bg="info">{logs[1].length}</Badge>
                </span>
              }
            >
              <div className="log-actions">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleDownload(1)}
                  disabled={logs[1].length === 0}
                  size="sm"
                >
                  <FaDownload /> Download
                </Button>
              </div>
              <div className="log-container">
                {isLoading ? (
                  <div className="text-center p-3">Loading logs...</div>
                ) : logs[1].length === 0 ? (
                  <div className="text-center p-3">No info logs available</div>
                ) : (
                  <pre>{logs[1].join('\n')}</pre>
                )}
              </div>
            </Tab>
            
            <Tab 
              eventKey="2" 
              title={
                <span className="tab-title">
                  Critical <Badge bg="danger">{logs[2].length}</Badge>
                </span>
              }
            >
              <div className="log-actions">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleDownload(2)}
                  disabled={logs[2].length === 0}
                  size="sm"
                >
                  <FaDownload /> Download
                </Button>
              </div>
              <div className="log-container">
                {isLoading ? (
                  <div className="text-center p-3">Loading logs...</div>
                ) : logs[2].length === 0 ? (
                  <div className="text-center p-3">No critical logs available</div>
                ) : (
                  <pre>{logs[2].join('\n')}</pre>
                )}
              </div>
            </Tab>
          </Tabs>
        </div>
      </Collapse>
    </div>
  );
};

export default LogViewer;