import React, { useState, useEffect } from "react";
import { isUrlWhitelisted, STORAGE_KEY } from "../../utils/WhitelistChecker";

function WhitelistIndicator() {
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  useEffect(() => {
    const updateWhitelistStatus = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      const currentURL = currentTab.url;
      const isPageWhitelisted = await isUrlWhitelisted(currentURL);
      setIsWhitelisted(isPageWhitelisted);
    };

    updateWhitelistStatus();

    const handleStorageChange = (changes, namespace) => {
      if (
        namespace === "local" &&
        (changes[STORAGE_KEY])
      ) {
        updateWhitelistStatus();
      }
    };

    const handleTabChange = () => {
      updateWhitelistStatus();
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    chrome.tabs.onActivated.addListener(handleTabChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.tabs.onActivated.removeListener(handleTabChange);
    };
  }, []);

  return (
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
  );
}

export default WhitelistIndicator;
