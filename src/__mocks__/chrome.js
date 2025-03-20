// Mock Chrome API for testing
const listeners = new Set();

const chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        const result = {};
        if (keys.includes("deletedTasks")) result.deletedTasks = [{ id: 1, text: "Deleted Task", completed: false }];
        if (keys.includes("completedTasks")) result.completedTasks = [];
        if (keys.includes("selectedText")) result.selectedText = '';
        chrome.runtime.lastError = null; 
        callback(result);
      }),
      set: jest.fn((data, callback) => {
        chrome.runtime.lastError = null;
        if (callback) callback();
      }),
      remove: jest.fn(),
    },
    onChanged: {
      addListener: jest.fn((listener) => {
        listeners.add(listener);
      }),
      removeListener: jest.fn((listener) => {
        listeners.delete(listener);
      }),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
    lastError: null, 
  },
  tabs: {
    query: jest.fn().mockResolvedValue([
      { id: 1, url: "https://example.com" },
    ]),
    onActivated: {
      addListener: jest.fn(), // Mocking onActivated
      removeListener: jest.fn(),
    },
    onUpdated: {
      addListener: jest.fn(), // Mocking onActivated
      removeListener: jest.fn(),
    },
  },
};

global.chrome = chrome;
export default chrome; 