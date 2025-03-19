// Mock Chrome API for testing
const listeners = new Set();

const chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({ selectedText: '' });
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
  tabs: {
    query: jest.fn().mockResolvedValue([
      { id: 1, url: "https://example.com" },
    ]),
    onActivated: {
      addListener: jest.fn(), // Mocking onActivated
      removeListener: jest.fn(),
    },
  },
};

global.chrome = chrome;
export default chrome; 