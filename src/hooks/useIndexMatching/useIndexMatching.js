import { useState, useEffect } from 'react';

const useIndexMatching = () => {
    const [allowedSites, setSites] = useState([]);
    const [allowedRegex, setRegexs] = useState([]);
    const [allowedURLs, setUrls] = useState([]);
    const [allowedStringMatches, setStringMatches] = useState([]);

    useEffect(() => {
        // Load initial state from local storage
        chrome.storage.local.get(['allowedSites', 'allowedRegex', 'allowedURLs', 'allowedStringMatches'], (result) => {
            if (result.allowedSites) setSites(result.allowedSites);
            if (result.allowedRegex) setRegexs(result.allowedRegex);
            if (result.allowedURLs) setUrls(result.allowedURLs);
            if (result.allowedStringMatches) setStringMatches(result.allowedStringMatches);
        });
    }, []);

    const saveStateToLocalStorage = (key, value) => {
        chrome.storage.local.set({ [key]: value });
    };

    const addSite = (site) => {
        const newSites = [...allowedSites, site];
        setSites(newSites);
        saveStateToLocalStorage('allowedSites', newSites);
    };

    const removeSite = (site) => {
        const newSites = allowedSites.filter(s => s !== site);
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

    const removeRegex = (regex) => {
        const newRegexs = allowedRegex.filter(r => r !== regex);
        setRegexs(newRegexs);
        saveStateToLocalStorage('allowedRegex', newRegexs);
    };

    const updateRegex = (oldRegex, newRegex) => {
        const newRegexs = allowedRegex.map(r => r === oldRegex ? newRegex : r);
        setRegexs(newRegexs);
        saveStateToLocalStorage('allowedRegex', newRegexs);
    };

    const addUrl = (url) => {
        const newUrls = [...allowedURLs, url];
        setUrls(newUrls);
        saveStateToLocalStorage('allowedURLs', newUrls);
    };

    const removeUrl = (url) => {
        const newUrls = allowedURLs.filter(u => u !== url);
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

    const removeStringMatch = (stringMatch) => {
        const newStringMatches = allowedStringMatches.filter(sm => sm !== stringMatch);
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