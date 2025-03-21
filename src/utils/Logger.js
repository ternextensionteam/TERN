const LOG_STORAGE_KEY = "extensionLogs";

// Define log levels
const LOG_LEVELS = {
    DEBUG: 0,  // Logs everything (most detailed)
    INFO: 1,   // Logs important but less detailed
    CRITICAL: 2  // Logs only key functionality
};

// Detect development mode (Webpack injects process.env.NODE_ENV)
const IS_DEV = process.env.NODE_ENV == "development";

let writePromise = Promise.resolve(); // Initially resolved promise



/**
 * Removes logs older than a day from the beginning of the log array.
 * @param {string[]} logs - Array of log entries
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 24 hours)
 * @returns {string[]} - Updated log array
 */
const removeOldLogs = (logs, maxAgeMs = 24 * 60 * 60 * 1000) => {
    if (!logs || logs.length === 0) return logs;
    
    const now = new Date().getTime();
    let i = 0;
    
    while (i < logs.length) {
        // Extract timestamp directly from the log format [timestamp] [Level X] content
        const isoString = logs[i].substring(1, 25); // Extract ISO timestamp
        const logTime = new Date(isoString).getTime();
        
        if (now - logTime > maxAgeMs) {
            i++;
        } else {
            break;
        }
    }
    
    // If i > 0, remove the first i elements from the array
    if (i > 0) {
        logs.splice(0, i);
    }
   return logs;
};


/**
 * Formats content by converting objects to JSON and joining arguments.
 * Handles circular references safely.
 * @param {Array} args - Array of values to log
 * @returns {string} Formatted content as a string
 */
const formatLogContent = (args) => {
    return args.map(arg => {
        if (typeof arg !== "object" || arg === null) {
            return arg;
        }
        
        try {
            return JSON.stringify(arg, null, 2);
        } catch (error) {
            // Handle circular references or other JSON stringify errors
            if (error.message.includes('circular')) {
                return `[Circular Object: ${arg.constructor ? arg.constructor.name : 'Object'}]`;
            }
            return `[Object: stringify failed - ${error.message}]`;
        }
    }).join(" ");
};

/**
 * Formats log entries with timestamp, level, and content.
 * Works like console.log handling multiple arguments and formatting objects.
 * @param {number} level - The log level (0=DEBUG, 1=INFO, 2=CRITICAL)
 * @param {Array} args - Array of values to log
 * @returns {string} Formatted log entry as a string
 */
const formatLogEntry = (level, args) => {
    return `[${new Date().toISOString()}] [Level ${level}] ${formatLogContent(args)}`;
};

/**
 * Logs a message at the specified level.
 * - In development: Logs to console and storage.
 * - In production: Logs only to storage.
 * Uses sequential write operations to prevent race conditions.
 * @param {number} level - The log level (0=DEBUG, 1=INFO, 2=CRITICAL)
 * @param {...any} args - Values to log (works like console.log)
 * @returns {Promise<void>}
 */
export const logToFile = async (level, ...args) => {
    if (level < LOG_LEVELS.DEBUG || level > LOG_LEVELS.CRITICAL) {
        console.warn("Invalid log level:", level);
        return;
    }

    // Format log entry like console.log
    const logEntry = formatLogEntry(level, args);

    // in development, log to console as well
    if (IS_DEV) {
        console.log(`%c[Level ${level}]`, `color: ${level === 2 ? "red" : level === 1 ? "blue" : "gray"}`, ...args);
    }

    // Wait for previous writes to complete, then chain our write operation
    writePromise = writePromise.then(async () => {
        try {
            const result = await chrome.storage.local.get(LOG_STORAGE_KEY);
            let logs = result[LOG_STORAGE_KEY] || { 0: [], 1: [], 2: [] };

            // Remove logs older than a day for all levels
            for (let i = 0; i <= 2; i++) {
                logs[i] = removeOldLogs(logs[i]);
            }

            // Append log to all appropriate levels (from 0 up to and including the specified level)
            for (let i = 0; i <= level; i++) {
                logs[i].push(logEntry);
            }

            await chrome.storage.local.set({ [LOG_STORAGE_KEY]: logs });
        } catch (error) {
            console.error("Failed to write log:", error);
        }
    });

    return writePromise;
};

/**
 * Sends a log message through Chrome runtime messaging.
 * Useful for communicating between different extension contexts.
 * @param {number} level - The log level (0=DEBUG, 1=INFO, 2=CRITICAL)
 * @param {...any} args - Values to log (works like console.log)
 * @returns {Promise<void>}
 */
export const logToMessage = async (level, ...args) => {
    const content = formatLogContent(args);
    console.log("sending log message", args);
    chrome.runtime.sendMessage({ action: "log", level, content });
}

/**
 * Retrieves logs at a specific level.
 * @param {number} level - Log level to retrieve (0, 1, or 2)
 * @returns {Promise<string[]>} - Array of log messages
 */
export const getLogs = async (level) => {
    try {
        const result = await chrome.storage.local.get(LOG_STORAGE_KEY);
        const logs = result[LOG_STORAGE_KEY] || {};
        return logs[level] || [];
    } catch (error) {
        console.error("Failed to retrieve logs:", error);
        return [];
    }
};

/**
 * Downloads logs at a specific level as a text file.
 * @param {number} level - Log level to download (0, 1, or 2)
 */
export const downloadLogs = async (level) => {
    const logs = await getLogs(level);

    if (logs.length === 0) {
        alert("No logs available for this level.");
        return;
    }

    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_level_${level}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
};

/**
 * Clears logs for all levels.
 */
export const clearLogs = async () => {
    await chrome.storage.local.remove(LOG_STORAGE_KEY);
};
