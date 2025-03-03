import { useState, useEffect } from 'react';

const useIndexMatching = () => {
  const [allowedSites, setSites] = useState(null);
  const [allowedRegex, setRegexs] = useState(null);
  const [allowedURLs, setUrls] = useState(null);
  const [allowedStringMatches, setStringMatches] = useState(null);

  const STORAGE_KEY = 'indexMatchingData';

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const defaultData = {
        allowedSites: [],
        allowedRegex: [
          "^https://[^/]+.amazon.com/.*$",
          "^https://atoz.amazon.work/.*$",
          "^https://quip-amazon.com/.*$",
          "^https://quip.com/.*$"
        ],
        allowedURLs: [],
        allowedStringMatches: [],
      };
      const loadedData = result[STORAGE_KEY] || defaultData;
      if (!loadedData.allowedRegex || loadedData.allowedRegex.length === 0) {
        loadedData.allowedRegex = defaultData.allowedRegex;
      }
      setSites(loadedData.allowedSites);
      setRegexs(loadedData.allowedRegex);
      setUrls(loadedData.allowedURLs);
      setStringMatches(loadedData.allowedStringMatches);
    });
  }, []);

  const saveStateToLocalStorage = (updatedData) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const currentData = result[STORAGE_KEY] || {
        allowedSites: [],
        allowedRegex: [
          "^https://[^/]+.amazon.com/.*$",
          "^https://atoz.amazon.work/.*$",
          "^https://quip-amazon.com/.*$",
          "^https://quip.com/.*$"
        ],
        allowedURLs: [],
        allowedStringMatches: [],
      };
      const newData = { ...currentData, ...updatedData };
      chrome.storage.local.set({ [STORAGE_KEY]: newData });
    });
  };

  const addSite = (site) => {
    if (allowedSites === null) return;
    const newSites = [...allowedSites, site];
    setSites(newSites);
    saveStateToLocalStorage({ allowedSites: newSites });
  };

  const removeSite = (index) => {
    if (allowedSites === null) return;
    const newSites = allowedSites.filter((_, i) => i !== index);
    setSites(newSites);
    saveStateToLocalStorage({ allowedSites: newSites });
  };

  const updateSite = (index, newSite) => {
    if (allowedSites === null) return;
    const newSites = allowedSites.map((s, i) => (i === index ? newSite : s));
    setSites(newSites);
    saveStateToLocalStorage({ allowedSites: newSites });
  };

  const addRegex = (regex) => {
    if (allowedRegex === null) return;
    const newRegexs = [...allowedRegex, regex];
    setRegexs(newRegexs);
    saveStateToLocalStorage({ allowedRegex: newRegexs });
  };

  const removeRegex = (index) => {
    if (allowedRegex === null) return;
    const newRegexs = allowedRegex.filter((_, i) => i !== index);
    setRegexs(newRegexs);
    saveStateToLocalStorage({ allowedRegex: newRegexs });
  };

  const updateRegex = (index, newRegex) => {
    if (allowedRegex === null) return;
    const newRegexs = allowedRegex.map((r, i) => (i === index ? newRegex : r));
    setRegexs(newRegexs);
    saveStateToLocalStorage({ allowedRegex: newRegexs });
  };

  const addUrl = (url) => {
    if (allowedURLs === null) return;
    const newUrls = [...allowedURLs, url];
    setUrls(newUrls);
    saveStateToLocalStorage({ allowedURLs: newUrls });
  };

  const removeUrl = (index) => {
    if (allowedURLs === null) return;
    const newUrls = allowedURLs.filter((_, i) => i !== index);
    setUrls(newUrls);
    saveStateToLocalStorage({ allowedURLs: newUrls });
  };

  const updateUrl = (index, newUrl) => {
    if (allowedURLs === null) return;
    const newUrls = allowedURLs.map((u, i) => (i === index ? newUrl : u));
    setUrls(newUrls);
    saveStateToLocalStorage({ allowedURLs: newUrls });
  };

  const addStringMatch = (stringMatch) => {
    if (allowedStringMatches === null) return;
    const newStringMatches = [...allowedStringMatches, stringMatch];
    setStringMatches(newStringMatches);
    saveStateToLocalStorage({ allowedStringMatches: newStringMatches });
  };

  const removeStringMatch = (index) => {
    if (allowedStringMatches === null) return;
    const newStringMatches = allowedStringMatches.filter((_, i) => i !== index);
    setStringMatches(newStringMatches);
    saveStateToLocalStorage({ allowedStringMatches: newStringMatches });
  };

  const updateStringMatch = (index, newStringMatch) => {
    if (allowedStringMatches === null) return;
    const newStringMatches = allowedStringMatches.map((sm, i) =>
      i === index ? newStringMatch : sm
    );
    setStringMatches(newStringMatches);
    saveStateToLocalStorage({ allowedStringMatches: newStringMatches });
  };

  const checkMatch = (url) => {
    if (allowedSites === null || allowedRegex === null || allowedURLs === null || allowedStringMatches === null) return false;
    const siteMatch = allowedSites.some((site) => url.includes(site));
    const regexMatch = allowedRegex.some((regex) => new RegExp(regex).test(url));
    const urlMatch = allowedURLs.includes(url);
    const stringMatch = allowedStringMatches.some((stringMatch) =>
      url.includes(stringMatch)
    );
    return siteMatch || regexMatch || urlMatch || stringMatch;
  };

  return {
    allowedSites,
    allowedRegex,
    allowedURLs,
    allowedStringMatches,
    addSite,
    removeSite,
    updateSite,
    addRegex,
    removeRegex,
    updateRegex,
    addUrl,
    removeUrl,
    updateUrl,
    addStringMatch,
    removeStringMatch,
    updateStringMatch,
    checkMatch,
  };
};

export default useIndexMatching;