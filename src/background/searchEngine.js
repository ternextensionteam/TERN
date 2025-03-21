import MiniSearch from "minisearch";
import { encode } from "he";
import { removeAnchorLink, removeDuplicates } from "./text-utils.js";
import { logToFile } from "../utils/Logger.js";

const stopWords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];

const INDEX_DESCRIPTOR = {
  fields: ["title", "content"], // Fields to index
  storeFields: ["title"], // Fields to return in search results
  idField: "id", // Field for unique identifier
  processTerm: (term, _fieldName) =>
    stopWords.includes(term) ? null : term.toLowerCase(),
  searchOptions: {
    prefix: true, // Allow prefix matches
    boost: { title: 2 }, // Give higher weight to title matches
    fuzzy: 0.2, // Allow slight spelling variations
    processTerm: (term) => term.toLowerCase()
  },
};

let miniSearch = new MiniSearch(INDEX_DESCRIPTOR);

const SCORE_THRESHOLD = 0.5;
/**
 * Get search suggestions based on input text
 */
export function getSuggestions(text) {
  let results = miniSearch.search(text);
  let filteredResults = results.filter((result) => result.score > SCORE_THRESHOLD);


  // check if results length different from filteredResults length
  if (results.length !== filteredResults.length) {
    logToFile(0,"results length: ", results.length ,"different from filteredResults length: ", filteredResults.length);
  }

  filteredResults = filteredResults.slice(0, 10);

  removeDuplicates(filteredResults);
  
  let suggestions = filteredResults.map((result) => ({
    content: result.id,
    description: encode(result.title),
  }));

  if (suggestions.length === 0) {
    suggestions.push({
      content: text,
      description: `No indexed pages found for "${text}"`,
    });
  }
  return suggestions;
}

/**
 * Index a page in the search engine
 */
export function handleIndexPage(request) {
  logToFile(2,"Indexing page:", request.url);

  let pageData = {
    id: removeAnchorLink(request.url),
    title: request.title,
    content: request.content,
  };

  if (miniSearch.has(pageData.id)) {
    miniSearch.replace(pageData);
  } else {
    miniSearch.add(pageData);
  }
  saveMinisearch();
}

/**
 * Save search index to storage
 */
export async function saveMinisearch() {
  await chrome.storage.local.set({ pageIndex: JSON.stringify(miniSearch) });
}

/**
 * Load search index from storage
 */
export async function loadSearchIndex() {
  const data = await chrome.storage.local.get("pageIndex");
  if (data.pageIndex) {
    miniSearch = MiniSearch.loadJSON(data.pageIndex, INDEX_DESCRIPTOR);
  }
}

/**
 * Get the MiniSearch instance
 */
export function getMiniSearch() {
  return miniSearch;
}

// Add at the end of the file
export function _resetMiniSearchForTests(mockInstance) {
  miniSearch = mockInstance;
}