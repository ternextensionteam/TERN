import React, { useState, useEffect } from "react";
import { checkWhitelist } from "../../utils/WhitelistChecker";

function WhitelistIndicator() {
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
      setIsWhitelisted(isPageWhitelisted);
    };

    updateWhitelistStatus();

    const handleStorageChange = (changes, namespace) => {
      if (
        namespace === "local" &&
        (changes.allowedSites || changes.allowedURLs || changes.allowedStringMatches || changes.allowedRegex)
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
