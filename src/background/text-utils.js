import { logToFile } from "../utils/Logger";

/**
 * Removes anchor links from URLs
 */
export function removeAnchorLink(url) {
  return url.split("#")[0];
}

/**
 * Extracts unique words from a string
 */
export function getWordsSet(str) {
  return new Set(str.toLowerCase().match(/\b\w+\b/g));
}

/**
 * Calculates Jaccard similarity between two text strings
 */
export function jaccardSimilarityTexts(text1, text2) {
  const setA = getWordsSet(text1);
  const setB = getWordsSet(text2);

  const intersection = new Set([...setA].filter((word) => setB.has(word)));
  const union = new Set([...setA, ...setB]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

const JACCARD_THRESHOLD = 0.8;
/**
 * Remove duplicate search results based on title similarity
 */
export function removeDuplicates(results) {
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      if (
        jaccardSimilarityTexts(results[i].title, results[j].title) >
        JACCARD_THRESHOLD
      ) {
        logToFile(0,"Removing duplicate:", results[j].title, "to similar to", results[i].title);
        results.splice(j, 1);
        j--;
      }
    }
  }
}
