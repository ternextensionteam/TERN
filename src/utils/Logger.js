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
 * Formats log entries with timestamp, level, and content.
 * Works like console.log handling multiple arguments and formatting objects.
 * @param {number} level - The log level (0=DEBUG, 1=INFO, 2=CRITICAL)
 * @param {Array} args - Array of values to log
 * @returns {string} Formatted log entry as a string
 */
const formatLogEntry = (level, args) => {
    return `[${new Date().toISOString()}] [Level ${level}] ${args.map(arg => 
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
    ).join(" ")}`;
}

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
    const logEntry = formatLogEntry(level, args);
    chrome.runtime.sendMessage({ action: "log", level, logEntry });
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
