/**
 * Create context menu item
 */
export function createContextMenu() {
  chrome.contextMenus.create({
    id: "addToHawk",
    title: "Add Task",
    contexts: ["selection"],
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
  });
}
