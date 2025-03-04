import React, { useRef } from "react";

import { Container, Nav } from "react-bootstrap";

function exportBackup() {
  chrome.storage.local.get(null, (data) => {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    chrome.storage.local.set(data, () => {
      console.log("Backup restored.");
    });
  };
  reader.readAsText(file);
}

const SettingsSection = () => {
  const fileInputRef = useRef(null);

  const handleImportBackupClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Container className="settings-section">
      <h1>Settings</h1>
      <h2>Backup</h2>
      <button
        className="btn btn-primary"
        onClick={exportBackup}
        style={{ marginRight: "10px" }}
      >
        Backup
      </button>
      <button className="btn btn-primary" onClick={handleImportBackupClick}>
        Load Backup
      </button>
      <input
        type="file"
        accept=".json"
        onChange={importBackup}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
    </Container>
  );
};

export default SettingsSection;
