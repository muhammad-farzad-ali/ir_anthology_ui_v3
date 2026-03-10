const BASE_SPARQL_TEMPLATE = `
PREFIX ex: <https://ir.webis.de/kg/>

SELECT (?entity_label AS ?Entity)
 (?entity_URI AS ?URI)
 (?publication_URI AS ?Publication_URI)
 (?venue_URI       AS ?Venue_URI)
 (?author_URI      AS ?Author_URI)
 (?year_URI        AS ?Year_URI)
 (?2020s_URI       AS ?2020s_URI)
 (?2010s_URI       AS ?2010s_URI)
 (?2000s_URI       AS ?2000s_URI)
 (?Pre2000s_URI    AS ?Pre2000s_URI)
  (COUNT(DISTINCT ?publication_label) AS ?Publication)
  (COUNT(DISTINCT ?venue_label)       AS ?Venue)
  (COUNT(DISTINCT ?author_label)      AS ?Author)
  (COUNT(DISTINCT ?year_label)        AS ?Year)
  (COUNT(DISTINCT ?2020s_label)       AS ?2020s)
  (COUNT(DISTINCT ?2010s_label)       AS ?2010s)
  (COUNT(DISTINCT ?2000s_label)       AS ?2000s)
  (COUNT(DISTINCT ?Pre2000s_label)    AS ?Pre2000s)
WHERE {
  VALUES ?entityType { "$ENTITY_TYPE" } 
  ?publication_URI ex:type  "Publication" ;
                   ex:label ?publication_label ;
                   ex:isConnectedTo ?year_URI .

  OPTIONAL {
    ?publication_URI ex:isConnectedTo ?venue_URI .
    ?venue_URI ex:type  "Venue" ;
               ex:label ?venue_label .
  }
  OPTIONAL {
    ?publication_URI ex:isConnectedTo ?author_URI .
    ?author_URI ex:type  "Author" ;
                ex:label ?author_label .
  }
  OPTIONAL {
    ?year_URI ex:type  "Year" ;
              ex:label ?year_label .
  }
  OPTIONAL {
    ?2020s_URI ex:type  "2020s" ;
               ex:label ?2020s_label .
    ?publication_URI ex:isConnectedTo ?2020s_URI .
  }
  OPTIONAL {
    ?2010s_URI ex:type  "2010s" ;
               ex:label ?2010s_label .
    ?publication_URI ex:isConnectedTo ?2010s_URI .
  }
  OPTIONAL {
    ?2000s_URI ex:type  "2000s" ;
               ex:label ?2000s_label .
    ?publication_URI ex:isConnectedTo ?2000s_URI .
  }
  OPTIONAL {
    ?Pre2000s_URI ex:type  "Pre2000s" ;
                  ex:label ?Pre2000s_label .
    ?publication_URI ex:isConnectedTo ?Pre2000s_URI .
  }

  $FILTERS

  BIND(
    IF(?entityType = "Publication", ?publication_URI,
    IF(?entityType = "Venue",       ?venue_URI,
    IF(?entityType = "Year",        ?year_URI,
    IF(?entityType = "2020s",       ?2020s_URI,
    IF(?entityType = "2010s",       ?2010s_URI,
    IF(?entityType = "2000s",       ?2000s_URI,
    IF(?entityType = "Pre2000s",    ?Pre2000s_URI,
                                    ?author_URI))))))) 
  AS ?entity_URI)
  BIND(
    IF(?entityType = "Publication", ?publication_label,
    IF(?entityType = "Venue",       ?venue_label,
    IF(?entityType = "Year",        ?year_label,
    IF(?entityType = "2020s",       ?2020s_label,
    IF(?entityType = "2010s",       ?2010s_label,
    IF(?entityType = "2000s",       ?2000s_label,
    IF(?entityType = "Pre2000s",    ?Pre2000s_label,
                                    ?author_label))))))) 
  AS ?entity_label)

}
GROUP BY ?entity_label ?entity_URI
$ORDER
LIMIT $LIMIT
OFFSET $OFFSET
`;

const ENTITY_TYPE_TO_SPARQL_VAR = {
    'Publication': '?publication_URI',
    'Venue': '?venue_URI',
    'Author': '?author_URI',
    'Year': '?year_URI',
    '2020s': '?2020s_URI',
    '2010s': '?2010s_URI',
    '2000s': '?2000s_URI',
    'Pre2000s': '?Pre2000s_URI'
};

const VALID_ENTITIES = ['Author', 'Venue', 'Publication', 'Year', '2020s', '2010s', '2000s', 'Pre2000s'];

function buildFilters(filters) {
    if (!filters || Object.keys(filters).length === 0) {
        return '';
    }

    const filterClauses = [];

    for (const [key, value] of Object.entries(filters)) {
        if (!value) continue;

        const sparqlVar = ENTITY_TYPE_TO_SPARQL_VAR[key];
        if (!sparqlVar) continue;

        if (value.startsWith('http://') || value.startsWith('https://')) {
            filterClauses.push(`FILTER(${sparqlVar} = <${value}>)`);
        } else {
            const escapedValue = value.replace(/'/g, "\\'");
            filterClauses.push(`FILTER(${sparqlVar} ex:label "${escapedValue}")`);
        }
    }

    return filterClauses.length > 0 ? filterClauses.join('\n  ') : '';
}

function buildOrder(sort_by, order) {
    if (!sort_by) return 'ORDER BY DESC(?Publication)';
    
    const direction = order === 'asc' ? 'ASC' : 'DESC';
    return `ORDER BY ${direction}(?${sort_by})`;
}

function buildQuery(state) {
    const entityType = VALID_ENTITIES.includes(state.entity) ? state.entity : 'Author';
    const filters = buildFilters(state.filters);
    const order = buildOrder(state.sort_by, state.order);
    const limit = state.limit || 100;
    const offset = ((state.page || 1) - 1) * limit;

    let query = BASE_SPARQL_TEMPLATE;
    query = query.replace('$ENTITY_TYPE', entityType);
    query = query.replace('$FILTERS', filters);
    query = query.replace('$ORDER', order);
    query = query.replace('$LIMIT', limit.toString());
    query = query.replace('$OFFSET', offset.toString());

    return query;
}

export { BASE_SPARQL_TEMPLATE, buildQuery, buildFilters, buildOrder, VALID_ENTITIES, ENTITY_TYPE_TO_SPARQL_VAR };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BASE_SPARQL_TEMPLATE, buildQuery, buildFilters, buildOrder, VALID_ENTITIES, ENTITY_TYPE_TO_SPARQL_VAR };
}
