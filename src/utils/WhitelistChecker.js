export async function checkWhitelist(currentURL, cachedWhitelist) {
  if (!currentURL) {
    console.log("Current URL is blank, skipping whitelist check.");
    return false;
  }
  const currentHostname = new URL(currentURL).hostname;
  console.log("Checking whitelist for " + currentURL);
  return (
    checkSitesList(currentHostname, cachedWhitelist.sites) ||
    checkUrlsList(currentURL, cachedWhitelist.urls) ||
    checkStringMatchesList(currentURL, cachedWhitelist.stringMatches) ||
    checkRegexList(currentURL, cachedWhitelist.regex)
  );
}

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
  const match = regexList.some((regex) => new RegExp(regex).test(currentURL));
  if (match) {
    console.log(currentURL + " matches a regex in the regex list");
  }
  return match;
}
