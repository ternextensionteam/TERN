import { STORAGE_KEY, defaultWhitelistRules } from '../utils/WhitelistChecker';

/**
 * Initialize storage with default values
 */
export async function initializeStorage() {
  await chrome.storage.local.set({ STORAGE_KEY: defaultWhitelistRules});
}