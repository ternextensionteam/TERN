import { useState, useEffect } from 'react';
import { isUrlWhitelisted, getWhitelistRules, STORAGE_KEY, defaultWhitelistRules} from '../../utils/WhitelistChecker';
import { logToMessage } from '../../utils/Logger';

const DELETED_STORAGE_KEY = 'deletedWhitelistRules';

const defaultDeletedRules = defaultWhitelistRules;

function useIndexMatching() {
  const [rules, setRules] = useState(defaultWhitelistRules);
  const [deletedRules, setDeletedRules] = useState(defaultDeletedRules);

  // Load rules and deleted rules from storage on mount
  useEffect(() => {
    const loadRules = async () => {
      const storedRules = await getWhitelistRules();
      logToMessage(0,'Loaded whitelisting rules from storage');
      setRules(storedRules);

      const deletedResult = await chrome.storage.local.get(DELETED_STORAGE_KEY);
      setDeletedRules(deletedResult[DELETED_STORAGE_KEY] || defaultDeletedRules);
    };

    loadRules();

    const handleStorageChange = (changes, namespace) => {
      if (namespace === "local") {
        if (changes[STORAGE_KEY]) {
          logToMessage(0,'WhitelistRules changed in useIndexMatching:');
          setRules(changes[STORAGE_KEY].newValue);
        }
        if (changes[DELETED_STORAGE_KEY]) {
          setDeletedRules(changes[DELETED_STORAGE_KEY].newValue || defaultDeletedRules);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Save rules to storage
  const saveRulesToStorage = async (updatedRules) => {
    logToMessage(0,'Saving rules to storage:', updatedRules);
    await chrome.storage.local.set({ [STORAGE_KEY]: updatedRules });
  };

  // Save deleted rules to storage
  const saveDeletedRulesToStorage = async (updatedDeletedRules) => {
    await chrome.storage.local.set({ [DELETED_STORAGE_KEY]: updatedDeletedRules });
  };

  // Add a rule
  const addRule = async (type, rule) => {
    if (rules[type].includes(rule)) return; // Avoid duplicates
    const updatedRules = { ...rules, [type]: [...rules[type], rule] };
    setRules(updatedRules);
    await saveRulesToStorage(updatedRules);
  };

  // Remove a rule (move it to deleted rules)
  const removeRule = async (type, ruleToRemove) => {
    if (!rules[type].includes(ruleToRemove)) return;
    
    const updatedRules = {
      ...rules,
      [type]: rules[type].filter(rule => rule !== ruleToRemove)
    };
    
    const updatedDeletedRules = {
      ...deletedRules,
      [type]: [...deletedRules[type], ruleToRemove]
    };

    setRules(updatedRules);
    setDeletedRules(updatedDeletedRules);
    await saveRulesToStorage(updatedRules);
    await saveDeletedRulesToStorage(updatedDeletedRules);
  };

  // Recover a deleted rule (move it back to active rules)
  const recoverRule = async (type, ruleToRecover) => {
    if (!deletedRules[type].includes(ruleToRecover)) return;
    
    const updatedDeletedRules = {
      ...deletedRules,
      [type]: deletedRules[type].filter(rule => rule !== ruleToRecover)
    };

    const updatedRules = {
      ...rules,
      [type]: [...rules[type], ruleToRecover]
    };

    setRules(updatedRules);
    setDeletedRules(updatedDeletedRules);
    await saveRulesToStorage(updatedRules);
    await saveDeletedRulesToStorage(updatedDeletedRules);
  };

  // Check if the current URL is whitelisted
  const checkCurrentUrl = async () => {
    return isUrlWhitelisted(window.location.href);
  };

  return { rules, deletedRules, addRule, removeRule, recoverRule, checkCurrentUrl };
}

export default useIndexMatching;
