/**
 * Create context menu item
 */
export function createContextMenu() {
  chrome.contextMenus.create({
    id: "addToHawk",
    title: "Add Task",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "addToIndex",
    title: "Add to Index",
    contexts: ["page"],
  });
}

/**
 * Setup context menu handlers
 */
export function setupContextMenuListeners() {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "addToHawk") {
      // Open the side panel immediately to maintain connection to user gesture
      chrome.sidePanel.open({ windowId: tab.windowId })
        .then(() => {
          // Store the selected text after opening the panel
          return chrome.storage.local.set({ selectedText: info.selectionText });
        })
        .catch(error => {
          console.error("Error handling context menu click:", error);
        });
    }

    if (info.menuItemId === "addToIndex") {
      try {
        const currentURL = tab.url;
        const currentHostname = new URL(currentURL).hostname;

        chrome.storage.local.get('whitelistRules').then(result => {
          const whitelistRules = result.whitelistRules || { allowedSites: [], allowedURLs: [], allowedStringMatches: [], allowedRegex: [] };
          
          if (!whitelistRules.allowedSites.includes(currentHostname)) {
            whitelistRules.allowedSites.push(currentHostname);
            chrome.storage.local.set({ whitelistRules }).then(() => {
            });
          }
        });
      } catch (error) {
        console.error("Error adding URL to index:", error);
      }
    }
  });
}
