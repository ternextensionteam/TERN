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
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "addToHawk") {
      try {
        await chrome.storage.local.set({ selectedText: info.selectionText });
        await chrome.sidePanel.open({ windowId: tab.windowId });
      } catch (error) {
        console.error("Error handling context menu click:", error);
      }
    }

    if (info.menuItemId === "addToIndex") {
      try {
        const currentURL = tab.url;
        const currentHostname = new URL(currentURL).hostname;

        const result = await chrome.storage.local.get('whitelistRules');
        const whitelistRules = result.whitelistRules || { allowedSites: [], allowedURLs: [], allowedStringMatches: [], allowedRegex: [] };
        
        if (!whitelistRules.allowedSites.includes(currentHostname)) {
          whitelistRules.allowedSites.push(currentHostname);
          await chrome.storage.local.set({ whitelistRules });
          chrome.runtime.sendMessage({ 
            action: 'updateIndexList',
            items: whitelistRules.allowedSites
          });
        }
      } catch (error) {
        console.error("Error adding URL to index:", error);
      }
    }
  });
}
