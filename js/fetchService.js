let SPARQL_ENDPOINT = "https://webislab33.medien.uni-weimar.de/sparql/";

async function fetchEntities(sparqlQuery) {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(sparqlQuery)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

async function fetchWithCount(sparqlQuery) {
  const countQuery = buildCountQuery(sparqlQuery);
  const results = await fetchEntities(sparqlQuery);

  try {
    const countResults = await fetchEntities(countQuery);
    const totalCount = countResults.results.bindings[0]?.count?.value || 0;
    return { data: results, total: parseInt(totalCount, 10) };
  } catch (e) {
    console.warn("Could not fetch total count:", e);
    return { data: results, total: results.results.bindings.length };
  }
}

function buildCountQuery(sparqlQuery) {
  const withoutSelect = sparqlQuery.replace(
    /SELECT[\s\S]*?WHERE/,
    "SELECT (COUNT(DISTINCT ?entity_URI) AS ?count) WHERE",
  );
  const withoutOrder = withoutSelect.replace(
    /ORDER BY[\s\S]*?(LIMIT|$)/m,
    "$1",
  );
  const withoutLimit = withoutOrder.replace(/LIMIT \d+/, "LIMIT 1");
  return withoutLimit;
}

function setEndpoint(endpoint) {
  SPARQL_ENDPOINT = endpoint;
}

function getEndpoint() {
  return SPARQL_ENDPOINT;
}

export {
  fetchEntities,
  fetchWithCount,
  buildCountQuery,
  SPARQL_ENDPOINT,
  setEndpoint,
  getEndpoint,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fetchEntities,
    fetchWithCount,
    buildCountQuery,
    SPARQL_ENDPOINT,
    setEndpoint,
    getEndpoint,
  };
}
