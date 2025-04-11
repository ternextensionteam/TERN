import { createContextMenu, setupContextMenuListeners } from '../../background/contextMenu';

// Mock Chrome API
global.chrome = {
  contextMenus: {
    create: jest.fn(),
    removeAll: jest.fn(callback => callback()), // Execute the callback immediately
    onClicked: { addListener: jest.fn() }
  },
  sidePanel: {
    open: jest.fn(() => Promise.resolve())
  },
  storage: {
    local: {
      set: jest.fn(() => Promise.resolve())
    }
  }
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Context Menu Tests', () => {
  test('should remove existing context menu items before creating new ones', () => {
    createContextMenu();
    expect(chrome.contextMenus.removeAll).toHaveBeenCalled();
  });
  
  test('should create context menu items after removing existing ones', () => {
    createContextMenu();
    
    // Verify menu items are created
    expect(chrome.contextMenus.create).toHaveBeenCalledWith({
      id: "addTask",
      title: "Add Task",
      contexts: ["selection"]
    });
    
    expect(chrome.contextMenus.create).toHaveBeenCalledWith({
      id: "addToIndex",
      title: "Add to Index",
      contexts: ["page"]
    });
  });

  test('should set up context menu listeners', () => {
    setupContextMenuListeners();
    expect(chrome.contextMenus.onClicked.addListener).toHaveBeenCalled();
  });
});