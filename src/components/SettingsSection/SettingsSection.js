import React, { useRef, useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { FaRedo } from "react-icons/fa";
import "../base.css";
import "./SettingsSection.css";

const SettingsSection = () => {
  const fileInputRef = useRef(null);
  const colorUpdateRef = useRef(null);
  const [theme, setTheme] = useState('system');
  const [themeColor, setThemeColor] = useState('#0069b9');

  useEffect(() => {
    const loadSettings = () => {
      try {
        chrome.storage.local.get(['theme', 'themeColor'], (result) => {
          console.log('Loading settings from chrome.storage.local:', result);
          const savedTheme = result.theme || 'system';
          const savedThemeColor = result.themeColor || '#0069b9';

          setTheme(savedTheme);
          setThemeColor(savedThemeColor);
          applyTheme(savedTheme, savedThemeColor);
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        applyDefaultSettings();
      }
    };

    const applyDefaultSettings = () => {
      setTheme('system');
      setThemeColor('#0069b9');
      applyTheme('system', '#0069b9');
    };

    loadSettings();

    const storageChangeHandler = (changes, area) => {
      if (area === 'local' && (changes.theme || changes.themeColor)) {
        console.log('Storage changed, reloading settings:', changes);
        loadSettings();
      }
    };

    chrome.storage.onChanged.addListener(storageChangeHandler);

    return () => chrome.storage.onChanged.removeListener(storageChangeHandler);
  }, []);

  const exportBackup = () => {
    try {
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
    } catch (error) {
      console.error('Error exporting backup:', error);
    }
  };

  const importBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        chrome.storage.local.set(data, () => {
          console.log("Backup restored.");
          const newTheme = data.theme || 'system';
          const newThemeColor = data.themeColor || '#0069b9';
          setTheme(newTheme);
          setThemeColor(newThemeColor);
          applyTheme(newTheme, newThemeColor);
        });
      } catch (error) {
        console.error('Error importing backup:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleImportBackupClick = () => {
    fileInputRef.current.click();
  };

  const applyTheme = (newTheme, newThemeColor = themeColor) => {
    try {
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);

      let defaultThemeColor;
      if (newTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        defaultThemeColor = prefersDark ? '#76baff' : '#0069b9';
      } else if (newTheme === 'dark') {
        defaultThemeColor = '#76baff';
      } else { // light mode
        defaultThemeColor = '#0069b9';
      }

      const finalThemeColor = newThemeColor === '#0069b9' || newThemeColor === '#76baff' || !newThemeColor
        ? defaultThemeColor
        : newThemeColor;

      setThemeColor(finalThemeColor);
      document.documentElement.style.setProperty('--primary-color', finalThemeColor);

      chrome.storage.local.set({ theme: newTheme, themeColor: finalThemeColor }, (error) => {
        if (error) console.error('Error saving theme:', error);
        else console.log('Theme saved:', newTheme, 'Theme color:', finalThemeColor);
      });

      chrome.runtime.sendMessage({
        type: 'applyTheme',
        theme: newTheme,
        themeColor: finalThemeColor,
      });
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  // Debounce utility function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const updateThemeColor = (newColor) => {
    if (colorUpdateRef.current === newColor) return;
    colorUpdateRef.current = newColor;

    setThemeColor(newColor);
    document.documentElement.style.setProperty('--primary-color', newColor);
  };

  const saveThemeColor = (newColor) => {
    try {
      chrome.storage.local.set({ themeColor: newColor }, (error) => {
        if (error) console.error('Error saving theme color:', error);
        else console.log('Theme color saved:', newColor);
      });

      chrome.runtime.sendMessage({
        type: 'applyTheme',
        theme: theme,
        themeColor: newColor,
      });
    } catch (error) {
      console.error('Error changing theme color:', error);
    }
  };

  const debouncedUpdateThemeColor = debounce(updateThemeColor, 100);
  const debouncedSaveThemeColor = debounce(saveThemeColor, 500); 

  const handleThemeColorInput = (e) => {
    const newColor = e.target.value;
    debouncedUpdateThemeColor(newColor);
    debouncedSaveThemeColor(newColor);
  };

  const resetThemeColor = () => {
    try {
      let originalColor;
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        originalColor = '#76baff';
      } else {
        originalColor = '#0069b9';
      }
      updateThemeColor(originalColor);
      saveThemeColor(originalColor);
    } catch (error) {
      console.error('Error resetting theme color:', error);
    }
  };

  return (
    <Container className="settings-section">
      <section className="settings-group">
        <h2>Theme Mode</h2>
        <div className="theme-options">
          <button
            className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => applyTheme('light')}
          >
            Light Mode
          </button>
          <button
            className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => applyTheme('dark')}
          >
            Dark Mode
          </button>
          <button
            className={`btn ${theme === 'system' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => applyTheme('system')}
          >
            Follow System
          </button>
        </div>
      </section>

      <section className="settings-group">
        <h2>Change Theme Color</h2>
        <div className="theme-color-picker">
          <input
            type="color"
            value={themeColor}
            onInput={handleThemeColorInput}
            className="color-picker"
          />
          <span className="current-color">{themeColor.toUpperCase()}</span>
          <Button
            variant="success"
            onClick={resetThemeColor}
            className="recover-btn1"
            data-tooltip="Recover default color"
            data-tooltip-position="top"
          >
            <FaRedo />
          </Button>
        </div>
      </section>

      <section className="settings-group">
        <h2>Backups</h2>
        <div className="backup-options">
          <button
            className="btn btn-primary"
            onClick={exportBackup}
            style={{ marginRight: "10px" }}
          >
            Export Backup
          </button>
          <button
            className="btn btn-primary"
            onClick={handleImportBackupClick}
          >
            Import Backup
          </button>
          <input
            type="file"
            accept=".json"
            onChange={importBackup}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>
      </section>

      <section className="settings-group">
        <h2>About</h2>
        <div className="about-content">
          <p>Version: </p>
          <p>Created by: </p>
          <p>Date: 2025</p>
        </div>
      </section>
    </Container>
  );
};

export default SettingsSection;