import React, { useState, useEffect } from "react";
import { Nav, Button } from "react-bootstrap";
import { MdRestore } from "react-icons/md";
import "../tooltip";
import "../base.css";
import IndexInput from "../IndexInput/IndexInput";
import IndexList from "../IndexList/IndexList";
import RecoverDeletedIndex from "../RecoverDeletedIndex/RecoverDeletedIndex";
import "./IndexingSection.css";
import useIndexMatching from "../../hooks/useIndexMatching/useIndexMatching";

const STORAGE_KEYS = {
  INDEXED: "indexedItems",
  DELETED: "deletedItems",
};

const DEFAULT_REGEX = [
  "^https://[^/]+.amazon.com/.*$",
  "^https://atoz.amazon.work/.*$",
  "^https://quip-amazon.com/.*$",
  "^https://quip.com/.*$",
];

const IndexingSection = () => {
  const [activeIndexSection, setActiveIndexSection] = useState("allowedSites");
  const [showRecoverPage, setShowRecoverPage] = useState(false);

  const [deletedItems, setDeletedItems] = useState({
    allowedSites: [],
    regex: [],
    allowedURLs: [],
    stringmatches: [],
  });

  const [indexedItems, setIndexedItems] = useState({
    allowedSites: [],
    allowedURLs: [],
    stringmatches: [],
    regex: [],
  });

  const {
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
  } = useIndexMatching();

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEYS.DELETED, STORAGE_KEYS.INDEXED], (result) => {
      const storedDeleted = result[STORAGE_KEYS.DELETED] || {
        allowedSites: [],
        regex: [],
        allowedURLs: [],
        stringmatches: [],
      };

      const storedIndexed = result[STORAGE_KEYS.INDEXED] || {
        allowedSites: [],
        allowedURLs: [],
        stringmatches: [],
        regex: [...DEFAULT_REGEX],
      };

      if (!storedIndexed.regex || storedIndexed.regex.length === 0) {
        storedIndexed.regex = [...DEFAULT_REGEX];
      }

      console.log("Loaded deletedItems from storage:", storedDeleted);
      console.log("Loaded indexedItems from storage:", storedIndexed);

      setDeletedItems(storedDeleted);
      setIndexedItems(storedIndexed);

      chrome.storage.local.set({ [STORAGE_KEYS.INDEXED]: storedIndexed });
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ [STORAGE_KEYS.INDEXED]: indexedItems });
  }, [indexedItems]);

  useEffect(() => {
    chrome.storage.local.set({ [STORAGE_KEYS.DELETED]: deletedItems });
  }, [deletedItems]);

  const sections = [
    { key: "allowedSites", label: "Sites" },
    { key: "allowedURLs", label: "URLs" },
    { key: "stringmatches", label: "String Matches" },
    { key: "regex", label: "RegEx" },
  ];

  const sectionFunctions = {
    allowedSites: { add: addSite, remove: removeSite, update: updateSite },
    regex: { add: addRegex, remove: removeRegex, update: updateRegex },
    allowedURLs: { add: addUrl, remove: removeUrl, update: updateUrl },
    stringmatches: { add: addStringMatch, remove: removeStringMatch, update: updateStringMatch },
  };

  const handleAddItem = (newItem) => {
    if (!newItem.trim()) return;

    setIndexedItems((prev) => {
      const updatedItems = {
        ...prev,
        [activeIndexSection]: [...prev[activeIndexSection], newItem],
      };
      console.log(`Added "${newItem}" to indexedItems:`, updatedItems);
      chrome.storage.local.set({ [STORAGE_KEYS.INDEXED]: updatedItems });
      return updatedItems;
    });

    sectionFunctions[activeIndexSection].add(newItem);
  };

  // ✅ Handle Deleting Items
  const handleDelete = (index) => {
    const removeFunction = sectionFunctions[activeIndexSection].remove;
    const itemToDelete = indexedItems[activeIndexSection][index];

    if (removeFunction && itemToDelete !== undefined) {
      setIndexedItems((prev) => {
        const updatedItems = {
          ...prev,
          [activeIndexSection]: prev[activeIndexSection].filter((_, i) => i !== index),
        };
        chrome.storage.local.set({ [STORAGE_KEYS.INDEXED]: updatedItems });
        return updatedItems;
      });

      setDeletedItems((prev) => {
        const updatedDeleted = {
          ...prev,
          [activeIndexSection]: [...prev[activeIndexSection], itemToDelete],
        };
        chrome.storage.local.set({ [STORAGE_KEYS.DELETED]: updatedDeleted });
        return updatedDeleted;
      });

      removeFunction(index);
    } else {
      console.error(`Error deleting item at index ${index} in ${activeIndexSection}`);
    }
  };

  // ✅ Handle Recovering Items
  const handleRecover = (sectionKey, index) => {
    const addFunction = sectionFunctions[sectionKey].add;
    const itemToRecover = deletedItems[sectionKey][index];

    if (addFunction && itemToRecover !== undefined) {
      setIndexedItems((prev) => {
        const updatedItems = {
          ...prev,
          [sectionKey]: [...prev[sectionKey], itemToRecover],
        };
        chrome.storage.local.set({ [STORAGE_KEYS.INDEXED]: updatedItems });
        return updatedItems;
      });

      setDeletedItems((prev) => {
        const updatedDeleted = {
          ...prev,
          [sectionKey]: prev[sectionKey].filter((_, i) => i !== index),
        };
        chrome.storage.local.set({ [STORAGE_KEYS.DELETED]: updatedDeleted });
        return updatedDeleted;
      });

      addFunction(itemToRecover);
    } else {
      console.error(`Failed to recover item at index ${index} in ${sectionKey}`);
    }
  };

  const handleOpenRecoverPage = (e) => {
    e.target.blur();
    document.dispatchEvent(new Event("click"));
    setTimeout(() => setShowRecoverPage(true), 50);
  };

  if (showRecoverPage) {
    return (
      <RecoverDeletedIndex
        deletedItems={deletedItems}
        onRecover={handleRecover}
        onBack={() => setShowRecoverPage(false)}
        onGoToIndexing={() => setShowRecoverPage(false)}
      />
    );
  }

  return (
    <>
      <div className="indexing-upper-container">
        <Nav variant="tabs" activeKey={activeIndexSection} onSelect={setActiveIndexSection}>
          {sections.map((section) => (
            <Nav.Item key={section.key}>
              <Nav.Link
                eventKey={section.key}
                className={`subnav-link ${activeIndexSection === section.key ? "active" : ""}`}
                data-tooltip={section.label}
                data-tooltip-position="top"
              >
                {section.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
        <div className="indexing-input-box">
          <IndexInput add={handleAddItem} />
        </div>
      </div>

      <div className="list-name">
        <h2 className="section-title">
          Indexed {sections.find((s) => s.key === activeIndexSection)?.label}:
        </h2>
      </div>

      <div className="list-container">
        <IndexList items={indexedItems[activeIndexSection]} onDelete={handleDelete} />
      </div>

      <div className="recover-button-container">
        <Button onClick={handleOpenRecoverPage} className="recover-button">
          <MdRestore size={24} />
        </Button>
      </div>
    </>
  );
};

export default IndexingSection;
