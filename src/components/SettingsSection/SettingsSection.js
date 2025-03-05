import React, { useRef, useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { FaRedo } from "react-icons/fa";
import "../base.css";
import "./SettingsSection.css";

const SettingsSection = () => {
  const fileInputRef = useRef(null);
  const colorUpdateRef = useRef(null);
  const [theme, setTheme] = useState("system");
  const [themeColor, setThemeColor] = useState("#0069b9");
  const [isLoading, setIsLoading] = useState(true);

  const defaultColors = {
    light: "#0069b9",
    dark: "#76baff",
  };

  const lightenColorWithOpacity = (color, opacity = 0.2) => {
    let num = parseInt(color.slice(1), 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const applyThemeGlobally = (newTheme, newThemeColor) => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveTheme = newTheme === "system" ? (prefersDark ? "dark" : "light") : newTheme;
    const defaultThemeColor = effectiveTheme === "dark" ? defaultColors.dark : defaultColors.light;

    const finalThemeColor =
      newThemeColor === defaultColors.light || newThemeColor === defaultColors.dark || !newThemeColor
        ? defaultThemeColor
        : newThemeColor;

    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.style.setProperty("--primary-color", finalThemeColor);
    document.documentElement.style.setProperty("--hover-color", lightenColorWithOpacity(finalThemeColor, 0.2));

    chrome.storage.local.set({ theme: newTheme, themeColor: finalThemeColor }, () => {
      chrome.runtime.sendMessage({
        type: "applyTheme",
        theme: newTheme,
        themeColor: finalThemeColor,
      });
    });
  };

  useEffect(() => {
    const loadSettings = () => {
      chrome.storage.local.get(["theme", "themeColor"], (result) => {
        const savedTheme = result.theme || "system";
        const savedThemeColor = result.themeColor || "#0069b9";

        setTheme(savedTheme);
        setThemeColor(savedThemeColor);
        applyThemeGlobally(savedTheme, savedThemeColor);

        setIsLoading(false);
      });
    };

    loadSettings();

    const storageChangeHandler = (changes, area) => {
      if (area === "local" && (changes.theme || changes.themeColor)) {
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
    } catch (error) {}
  };

  const importBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        chrome.storage.local.set(data, () => {
          const newTheme = data.theme || "system";
          const newThemeColor = data.themeColor || "#0069b9";
          setTheme(newTheme);
          setThemeColor(newThemeColor);
          applyThemeGlobally(newTheme, newThemeColor);
        });
      } catch (error) {}
    };
    reader.readAsText(file);
  };

  const handleImportBackupClick = () => {
    fileInputRef.current.click();
  };

  const applyTheme = (newTheme) => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveTheme = newTheme === "system" ? (prefersDark ? "dark" : "light") : newTheme;
    const defaultThemeColor = effectiveTheme === "dark" ? defaultColors.dark : defaultColors.light;

    setTheme(newTheme);
    // Only use default color if no custom color exists
    const finalThemeColor =
      themeColor === defaultColors.light || themeColor === defaultColors.dark || !themeColor
        ? defaultThemeColor
        : themeColor;

    setThemeColor(finalThemeColor);
    applyThemeGlobally(newTheme, finalThemeColor);
  };

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
    applyThemeGlobally(theme, newColor);
  };

  const debouncedUpdateThemeColor = debounce(updateThemeColor, 100);

  const handleThemeColorChange = (e) => {
    const newColor = e.target.value;
    debouncedUpdateThemeColor(newColor);
  };

  const resetThemeColor = () => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveTheme = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
    const originalColor = effectiveTheme === "dark" ? defaultColors.dark : defaultColors.light;
    updateThemeColor(originalColor);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="settings-section">
      <section className="settings-group">
        <h2>Theme Mode</h2>
        <div className="theme-options">
          <button className={`btn ${theme === "light" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => applyTheme("light")}>
            Light Mode
          </button>
          <button className={`btn ${theme === "dark" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => applyTheme("dark")}>
            Dark Mode
          </button>
          <button className={`btn ${theme === "system" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => applyTheme("system")}>
            Follow System
          </button>
        </div>
      </section>

      <section className="settings-group">
        <h2>Change Theme Color</h2>
        <div className="theme-color-picker">
          <input type="color" value={themeColor} onChange={handleThemeColorChange} className="color-picker" />
          <span className="current-color">{themeColor.toUpperCase()}</span>
          <Button variant="success" onClick={resetThemeColor} className="recover-btn1">
            <FaRedo />
          </Button>
        </div>
      </section>
      <section className="settings-group">
        <h2>Backups</h2>
        <div className="backup-options">
          <button className="btn btn-primary" onClick={exportBackup} style={{ marginRight: "10px" }}>
            Export Backup
          </button>
          <button className="btn btn-primary" onClick={handleImportBackupClick}>
            Import Backup
          </button>
          <input type="file" accept=".json" onChange={importBackup} ref={fileInputRef} style={{ display: "none" }} />
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