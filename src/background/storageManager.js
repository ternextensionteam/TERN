import { STORAGE_KEY, defaultWhitelistRules } from '../utils/WhitelistChecker';
import { logToFile } from '../utils/Logger';
/**
 * Initialize storage with default values
 */
export async function initializeStorage() {
  await chrome.storage.local.set({ [STORAGE_KEY]: defaultWhitelistRules});
  logToFile(1, "Default whitelist rules initialised (none set)");
}