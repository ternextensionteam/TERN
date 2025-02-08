chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
  });

  // Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToHawk",
    title: "Add Task",
    contexts: ["selection"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToHawk") {
    // Store the selected text in chrome.storage
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      // Open the side panel
      chrome.sidePanel.open({ windowId: tab.windowId });
    });
  }
});