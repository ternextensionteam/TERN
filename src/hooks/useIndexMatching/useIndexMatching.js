import { useState, useEffect } from 'react';

const useIndexMatching = () => {
    const [allowedSites, setSites] = useState([]);
    const [allowedRegex, setRegexs] = useState([]);
    const [allowedURLs, setUrls] = useState([]);
    const [allowedStringMatches, setStringMatches] = useState([]);

    useEffect(() => {
        // Load initial state from local storage
        chrome.storage.local.get(['allowedSites', 'allowedRegex', 'allowedURLs', 'allowedStringMatches'], (result) => {
            if (result.allowedSites) {
                setSites(result.allowedSites);
                console.log('Loaded allowedSites from local storage:', result.allowedSites);
            }
            if (result.allowedRegex) {
                setRegexs(result.allowedRegex);
                console.log('Loaded allowedRegex from local storage:', result.allowedRegex);
            }
            if (result.allowedURLs) {
                setUrls(result.allowedURLs);
                console.log('Loaded allowedURLs from local storage:', result.allowedURLs);
            }
            if (result.allowedStringMatches) {
                setStringMatches(result.allowedStringMatches);
                console.log('Loaded allowedStringMatches from local storage:', result.allowedStringMatches);
            }
        });
    }, []);

    const saveStateToLocalStorage = (key, value) => {
        chrome.storage.local.set({ [key]: value });
        console.log(`Saved ${key} to local storage:`, value);
    };

    const addSite = (site) => {
        const newSites = [...allowedSites, site];
        setSites(newSites);
        saveStateToLocalStorage('allowedSites', newSites);
    };

    const removeSite = (index) => { // Changed to accept index
        const newSites = allowedSites.filter((_, i) => i !== index);
        setSites(newSites);
        saveStateToLocalStorage('allowedSites', newSites);
    };

    const updateSite = (oldSite, newSite) => {
        const newSites = allowedSites.map(s => s === oldSite ? newSite : s);
        setSites(newSites);
        saveStateToLocalStorage('allowedSites', newSites);
    };

    const addRegex = (regex) => {
        const newRegexs = [...allowedRegex, regex];
        setRegexs(newRegexs);
        saveStateToLocalStorage('allowedRegex', newRegexs);
    };

    const removeRegex = (index) => { // Changed to accept index
        const newRegexs = allowedRegex.filter((_, i) => i !== index);
        setRegexs(newRegexs);
        saveStateToLocalStorage('allowedRegex', newRegexs);
    };

    const updateRegex = (oldRegex, newRegex) => {
        const newRegexs = allowedRegex.map(r => r === oldRegex ? newRegex : r);
        setRegexs(newRegexs);
        saveStateToLocalStorage('allowedRegex', newRegexs);
    };

    const addUrl = (url) => {
        console.log('addUrl called with:', url); // Debug log
        const newUrls = [...allowedURLs, url];
        setUrls(newUrls);
        saveStateToLocalStorage('allowedURLs', newUrls);
    };

    const removeUrl = (index) => { // Changed to accept index
        const newUrls = allowedURLs.filter((_, i) => i !== index);
        setUrls(newUrls);
        saveStateToLocalStorage('allowedURLs', newUrls);
    };

    const updateUrl = (oldUrl, newUrl) => {
        const newUrls = allowedURLs.map(u => u === oldUrl ? newUrl : u);
        setUrls(newUrls);
        saveStateToLocalStorage('allowedURLs', newUrls);
    };

    const addStringMatch = (stringMatch) => {
        const newStringMatches = [...allowedStringMatches, stringMatch];
        setStringMatches(newStringMatches);
        saveStateToLocalStorage('allowedStringMatches', newStringMatches);
    };

    const removeStringMatch = (index) => { // Changed to accept index
        const newStringMatches = allowedStringMatches.filter((_, i) => i !== index);
        setStringMatches(newStringMatches);
        saveStateToLocalStorage('allowedStringMatches', newStringMatches);
    };

    const updateStringMatch = (oldStringMatch, newStringMatch) => {
        const newStringMatches = allowedStringMatches.map(sm => sm === oldStringMatch ? newStringMatch : sm);
        setStringMatches(newStringMatches);
        saveStateToLocalStorage('allowedStringMatches', newStringMatches);
    };

    const checkMatch = (url) => {
        const siteMatch = allowedSites.some(site => url.includes(site));
        const regexMatch = allowedRegex.some(regex => new RegExp(regex).test(url));
        const urlMatch = allowedURLs.includes(url);
        const stringMatch = allowedStringMatches.some(stringMatch => url.includes(stringMatch));

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
        checkMatch
    };
};

export default useIndexMatching;