function checkSitesList(currentHostname, sitesList) {
  const match = sitesList.includes(currentHostname);
  if (match) {
    console.log("hostname is in Sites list");
  }
  return match;
}

function checkUrlsList(currentURL, urlsList) {
  const match = urlsList.includes(currentURL);
  if (match) {
    console.log(currentURL + " is in urls list");
  }
  return match;
}

function checkStringMatchesList(currentURL, stringMatchesList) {
  const match = stringMatchesList.some((match) => currentURL.includes(match));
  if (match) {
    console.log(currentURL + " matches a string in the stringMatches list");
  }
  return match;
}

function checkRegexList(currentURL, regexList) {
  const match = regexList.some((pattern) => {
    try {
      const regex = new RegExp(pattern);
      return regex.test(currentURL);
    } catch (error) {
      console.error("Invalid regex pattern:", pattern);
      return false;
    }
  });
  if (match) {
    console.log(currentURL + " matches a regex in the regex list");
  }
  return match;
}

export const STORAGE_KEY = "whitelistRules";

export const defaultWhitelistRules = {
  allowedSites: [],
  allowedURLs: [],
  allowedStringMatches: [],
  allowedRegex: [],
};

// Utility function to get the whitelist rules from storage
export async function getWhitelistRules() {
  console.log('Getting whitelist rules...');
  const result = await chrome.storage.local.get(STORAGE_KEY);
  console.log('Got whitelist rules:', result[STORAGE_KEY]);
  return result[STORAGE_KEY] || defaultWhitelistRules;
}

// Utility function to check if a URL is whitelisted
export async function isUrlWhitelisted(currentURL) {
  const rules = await getWhitelistRules();

  if (!currentURL) {
    console.log("Current URL is blank, skipping whitelist check.");
    return false;
  }
  const currentHostname = new URL(currentURL).hostname;
  console.log("Checking whitelist for " + currentURL);
  return (
    checkSitesList(currentHostname, rules.allowedSites) ||
    checkUrlsList(currentURL, rules.allowedURLs) ||
    checkStringMatchesList(currentURL, rules.allowedStringMatches) ||
    checkRegexList(currentURL, rules.allowedRegex)
  );
}
