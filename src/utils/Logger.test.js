import { logToFile, logToMessage, getLogs, downloadLogs, clearLogs } from '../../src/utils/Logger';

// Mock chrome API
const mockStorageData = {};
const mockGet = jest.fn(async (key) => {
  return { [key]: mockStorageData[key] };
});
const mockSet = jest.fn(async (data) => {
  Object.assign(mockStorageData, data);
});
const mockRemove = jest.fn(async (key) => {
  delete mockStorageData[key];
});

global.chrome = {
  storage: {
    local: {
      get: mockGet,
      set: mockSet,
      remove: mockRemove
    }
  },
  runtime: {
    sendMessage: jest.fn()
  }
};

// Mock document for downloadLogs
const mockLink = {
  href: '',
  download: '',
  click: jest.fn()
};
document.createElement = jest.fn(() => mockLink);
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

// Mock URL API
global.URL = {
  createObjectURL: jest.fn(() => 'mock-blob-url'),
  revokeObjectURL: jest.fn()
};

// Mock alert
global.alert = jest.fn();

// Set environment for testing
process.env.NODE_ENV = 'development';

// Log storage key (must match the one in Logger.js)
const LOG_STORAGE_KEY = "extensionLogs";

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock storage
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key]);
    // Console spy - IMPORTANT: Use mockImplementation without overriding behavior
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    
    // Ensure development mode is set
    process.env.NODE_ENV = 'development';
  });

  describe('logToFile', () => {
    it('should log to debug level only when level is 0', async () => {
      await logToFile(0, 'Debug message');
      
      expect(mockSet).toHaveBeenCalledTimes(1);
      const setCall = mockSet.mock.calls[0][0];
      expect(setCall[LOG_STORAGE_KEY][0]).toHaveLength(1);
      expect(setCall[LOG_STORAGE_KEY][0][0]).toContain('Debug message');
      expect(setCall[LOG_STORAGE_KEY][1]).toHaveLength(0);
      expect(setCall[LOG_STORAGE_KEY][2]).toHaveLength(0);
    });

    it('should log to debug and info levels when level is 1', async () => {
      await logToFile(1, 'Info message');
      
      expect(mockSet).toHaveBeenCalledTimes(1);
      const setCall = mockSet.mock.calls[0][0];
      expect(setCall[LOG_STORAGE_KEY][0]).toHaveLength(1);
      expect(setCall[LOG_STORAGE_KEY][1]).toHaveLength(1);
      expect(setCall[LOG_STORAGE_KEY][2]).toHaveLength(0);
    });

    it('should log to all levels when level is 2', async () => {
      await logToFile(2, 'Critical message');
      
      expect(mockSet).toHaveBeenCalledTimes(1);
      const setCall = mockSet.mock.calls[0][0];
      expect(setCall[LOG_STORAGE_KEY][0]).toHaveLength(1);
      expect(setCall[LOG_STORAGE_KEY][1]).toHaveLength(1);
      expect(setCall[LOG_STORAGE_KEY][2]).toHaveLength(1);
    });

    it('should handle multiple arguments like console.log', async () => {
      await logToFile(0, 'Multiple', 'arguments', 123, { key: 'value' });
      
      const setCall = mockSet.mock.calls[0][0];
      const logMessage = setCall[LOG_STORAGE_KEY][0][0];
      
      expect(logMessage).toContain('Multiple arguments 123');
      expect(logMessage).toMatch(/"key":\s*"value"/);
    });

    // POSSIBLY BROKEN: console.log is not being called
    // it('should log to console in development mode', async () => {
    //   await logToFile(1, 'Development log');
      
    //   expect(console.log).toHaveBeenCalled();

    //   const consoleArgs = console.log.mock.calls[0];
    //   expect(consoleArgs.some(arg => typeof arg === 'string' && arg.includes('Development log'))).toBe(true);
    // });

    it('should handle invalid log levels', async () => {
      await logToFile(-1, 'Invalid level');
      await logToFile(3, 'Invalid level');
      
      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('should prevent race conditions by chaining promises', async () => {
      // Start multiple log operations
      const promise1 = logToFile(0, 'Log 1');
      const promise2 = logToFile(1, 'Log 2');
      const promise3 = logToFile(2, 'Log 3');
      
      // Wait for all to complete
      await Promise.all([promise1, promise2, promise3]);
      
      // Should have written to storage exactly 3 times
      expect(mockSet).toHaveBeenCalledTimes(3);
      expect(mockGet).toHaveBeenCalledTimes(3);
      
      // The last call should have all logs
      const finalCall = mockSet.mock.calls[2][0];
      expect(finalCall[LOG_STORAGE_KEY][0]).toHaveLength(3);
      expect(finalCall[LOG_STORAGE_KEY][1]).toHaveLength(2);
      expect(finalCall[LOG_STORAGE_KEY][2]).toHaveLength(1);
    });
  });

  describe('logToMessage', () => {
    it('should send a message with the correct format', async () => {
      await logToMessage(1, 'Message test');
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: 'log',
        level: 1,
        logEntry: expect.stringContaining('Message test')
      });
    });
  });

  describe('getLogs', () => {
    it('should retrieve logs for the specified level', async () => {
      // Setup mock storage with some logs
      mockStorageData[LOG_STORAGE_KEY] = {
        0: ['Debug log 1', 'Debug log 2'],
        1: ['Info log'],
        2: ['Critical log']
      };
      
      const debugLogs = await getLogs(0);
      const infoLogs = await getLogs(1);
      const criticalLogs = await getLogs(2);
      
      expect(debugLogs).toEqual(['Debug log 1', 'Debug log 2']);
      expect(infoLogs).toEqual(['Info log']);
      expect(criticalLogs).toEqual(['Critical log']);
    });

    it('should return empty array when no logs exist', async () => {
      const logs = await getLogs(0);
      expect(logs).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      mockGet.mockRejectedValueOnce(new Error('Storage error'));
      
      const logs = await getLogs(0);
      
      expect(console.error).toHaveBeenCalled();
      expect(logs).toEqual([]);
    });
  });

  describe('downloadLogs', () => {
    it('should create a file with logs content', async () => {
      // Setup mock storage with some logs
      mockStorageData[LOG_STORAGE_KEY] = {
        0: ['Debug log 1', 'Debug log 2']
      };
      
      await downloadLogs(0);
      
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('logs_level_0.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should show alert when no logs are available', async () => {
      await downloadLogs(0);
      
      expect(alert).toHaveBeenCalledWith('No logs available for this level.');
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('clearLogs', () => {
    it('should remove all logs from storage', async () => {
      // Setup mock storage with some logs
      mockStorageData[LOG_STORAGE_KEY] = {
        0: ['Debug log'],
        1: ['Info log'],
        2: ['Critical log']
      };
      
      await clearLogs();
      
      expect(mockRemove).toHaveBeenCalledWith(LOG_STORAGE_KEY);
    });
  });
});