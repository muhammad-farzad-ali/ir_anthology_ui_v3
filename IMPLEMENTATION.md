# IR Anthology UI - Implementation Details

## Table of Contents

1. [Project Structure](#project-structure)
2. [State Management](#state-management)
3. [Module Documentation](#module-documentation)
4. [Data Flow](#data-flow)
5. [Events System](#events-system)
6. [Configuration](#configuration)

---

## Project Structure

```
ir_anthology_ui_v3/
├── index.html              # Main HTML with Tailwind CSS
├── style.css              # Custom table styles
├── PROGRESS.md            # Development progress notes
├── ABSTRACT.md           # High-level overview
├── js/
│   ├── app.js            # Main entry point
│   ├── state.js          # State & URL sync
│   ├── queryBuilder.js   # SPARQL query generation
│   ├── fetchService.js   # API communication
│   ├── tableView.js      # Dynamic table rendering
│   ├── search.js         # Search handling
│   ├── filterChips.js    # Filter chip display
│   └── settings.js       # Settings panel
└── .github/workflows/
    └── deploy.yml        # GitHub Pages deployment
```

---

## State Management

### State Structure

```javascript
{
    entity: 'Author',           // Current entity type
    filters: {                 // Active filters as arrays
        'Author': ['James', 'Smith'],
        'Year': ['2024']
    },
    sort_by: 'Publication',   // Column to sort by
    order: 'desc',           // 'asc' or 'desc'
    page: 1,                 // Current page
    limit: 50                // Results per### Valid Entity page
}
```

 Types

```javascript
['Author', 'Venue', 'Publication', 'Year', '2020s', '2010s', '2000s', 'Pre2000s']
```

### URL Parameter Mapping

| State Key | URL Parameter |
|-----------|---------------|
| entity | `?entity=Author` |
| sort_by | `&sort_by=Publication` |
| order | `&order=desc` |
| page | `&page=1` |
| limit | `&limit=50` |
| filters | `&filter_Author=James&filter_Author=Smith` |

---

## Module Documentation

### js/app.js

**Purpose**: Main entry point that ties all modules together.

**Key Responsibilities**:
- Initializes all modules
- Sets up event listeners for state changes
- Handles data loading
- Manages infinite scroll

**Important Functions**:

```javascript
async function init()
```
- Initializes the application
- Sets up event listeners
- Loads initial data

```javascript
async function loadData(keepScrollPosition)
```
- Fetches data from SPARQL endpoint
- Renders table and filter chips
- Handles scroll position

```javascript
function setupInfiniteScroll()
```
- Creates intersection observer
- Loads more data when reaching end

---

### js/state.js

**Purpose**: Central state management with URL synchronization.

**Key Functions**:

```javascript
function getInitialState()
```
- Reads URL parameters on page load
- Converts filter params to arrays
- Returns state object

```javascript
function setState(newState, pushToHistory = true)
```
- Merges new state with current state
- Updates URL (pushState or replaceState)
- Dispatches `stateChanged` event

```javascript
function buildURLFromState(state)
```
- Converts state to URL query string
- Handles array-based filters
- Returns URL path

**Events**:
- Listens to `popstate` for browser back/forward navigation

---

### js/queryBuilder.js

**Purpose**: Dynamically builds SPARQL queries based on state.

**Key Functions**:

```javascript
function buildQuery(state, filterMode = 'label')
```
- Main function to generate SPARQL
- Replaces placeholders: $ENTITY_TYPE, $FILTERS, $ORDER, $LIMIT, $OFFSET

```javascript
function getLabelVar(entityType)
```
- Returns SPARQL label variable
- Example: `'Author'` → `'?author_label'`

```javascript
function getUriVar(entityType)
```
- Returns SPARQL URI variable
- Example: `'Author'` → `'?author_URI'`

```javascript
function buildFilters(filters, filterMode = 'label')
```
- Generates FILTER clauses
- Uses CONTAINS for partial matching
- Example output:
```sparql
FILTER(CONTAINS(LCASE(?author_label), LCASE("james")) || CONTAINS(LCASE(?author_label), LCASE("smith")))
```

```javascript
function buildOrder(sort_by, order)
```
- Generates ORDER BY clause
- Example: `'Publication', 'desc'` → `ORDER BY DESC(?Publication)`

**Base Query Template**:
The module contains a SPARQL query that:
- Groups publications by entity (Author, Venue, Year, etc.)
- Counts related publications, venues, authors, years
- Supports decade groupings (2020s, 2010s, 2000s, Pre2000s)

---

### js/fetchService.js

**Purpose**: Communicates with SPARQL endpoint.

**Key Variables**:

```javascript
let SPARQL_ENDPOINT = 'http://webislab33.medien.uni-weimar.de:7018/sparql/';
```

**Key Functions**:

```javascript
async function fetchEntities(sparqlQuery)
```
- Sends GET request to SPARQL endpoint
- Returns JSON response

```javascript
async function fetchWithCount(sparqlQuery)
```
- Fetches main data + count query
- Returns `{ data, total }`

```javascript
function setEndpoint(endpoint)
```
- Updates the SPARQL endpoint URL

---

### js/tableView.js

**Purpose**: Dynamic table rendering based on SPARQL response.

**Key Constants**:

```javascript
const HIDDEN_COLUMNS = ['URI'];  // Columns not displayed
const CLICKABLE_COLUMNS = ['Entity', 'Publication', 'Venue', 'Author', 'Year', '2020s', '2010s', '2000s', 'Pre2000s'];
```

**Key Functions**:

```javascript
function renderTable(data, state)
```
- Main rendering function
- Reads `data.head.vars` for columns
- Calls renderTableHead and renderTableBody

```javascript
function renderTableHead(vars, state)
```
- Creates `<thead>` from variables
- Adds entity change and sort buttons
- Sets data attributes for interactivity

```javascript
function renderTableBody(vars, bindings, state)
```
- Creates `<tbody>` from bindings
- Sets data attributes on cells:
  - `data-entity-column`: Column name
  - `data-entity-type`: Current entity type
  - `data-entity-title`: Entity label from Entity column

**Event Handlers**:

```javascript
function handleEntityChange(varName)
```
- Called when clicking column header text
- Updates entity in state

```javascript
function handleSortClick(columnName)
```
- Called when clicking sort arrow
- Toggles asc/desc order

```javascript
function handleCellClick(event)
```
- Called when clicking table cell
- Uses `data-entity-column` to update entity
- Uses `data-entity-type` as filter key
- Uses `data-entity-title` as filter value

---

### js/search.js

**Purpose**: Handles search input.

**Key Functions**:

```javascript
function initSearch()
```
- Sets up Enter key listener

```javascript
function handleSearch(input, searchInside)
```
- Parses comma-separated values
- Uses `data-search-inside` as filter key
- Adds to filters and triggers update

```javascript
function updateSearchInside(entityType)
```
- Updates `data-search-inside` attribute on search input

---

### js/filterChips.js

**Purpose**: Displays active filters as removable chips.

**Key Functions**:

```javascript
function renderFilterChips(filters)
```
- Renders each filter key in a row
- Values displayed as chips with remove buttons

```javascript
function removeFilterValue(filterKey, filterIndex)
```
- Removes specific value from filter array
- Dispatches state update

---

### js/settings.js

**Purpose**: Settings panel for SPARQL endpoint configuration.

**Key Functions**:

```javascript
function initSettings()
```
- Toggles settings panel visibility
- Handles endpoint input save

---

## Data Flow

```
User Action
    ↓
Event Handler (tableView, search, etc.)
    ↓
window.dispatchEvent('updateState')
    ↓
setState() in state.js
    ↓
Update window.AppState
    ↓
Update URL (pushState)
    ↓
Dispatch 'stateChanged' event
    ↓
loadData() in app.js
    ↓
buildQuery() in queryBuilder.js
    ↓
fetchWithCount() in fetchService.js
    ↓
SPARQL Endpoint
    ↓
renderTable() in tableView.js
    ↓
Render Filter Chips
    ↓
Update UI
```

---

## Events System

### updateState Event

Dispatched from modules to update state:

```javascript
window.dispatchEvent(new CustomEvent('updateState', {
    detail: {
        entity: 'Year',           // Optional: change entity
        filters: { Author: ['x'] }, // Optional: update filters
        sort_by: 'Year',         // Optional: change sort
        order: 'asc',            // Optional: change order
        page: 1,                 // Optional: change page
        limit: 50                // Optional: change limit
    }
}));
```

### stateChanged Event

Fired after state is updated (triggers data reload):

```javascript
document.addEventListener('stateChanged', async (event) => {
    const currentState = event.detail;
    await loadData(false endpointChanged Event

F);
});
```

###ired when user saves new SPARQL endpoint:

```javascript
window.addEventListener('endpointChanged', (event) => {
    setEndpoint(event.detail.endpoint);
    loadData(false);
});
```

---

## Configuration

### Changing SPARQL Endpoint

1. Click gear icon
2. Enter new endpoint URL
3. Click "Save Settings"
4. Data reloads from new endpoint

### Adding New Entity Types

1. Add to `VALID_ENTITIES` array in `queryBuilder.js`
2. The dynamic label/URI variables are auto-generated

### Modifying the SPARQL Query

Edit `BASE_SPARQL_TEMPLATE` in `queryBuilder.js`:

```javascript
const BASE_SPARQL_TEMPLATE = `
PREFIX ex: <https://ir.webis.de/kg/>

SELECT ...
WHERE {
  VALUES ?entityType { "$ENTITY_TYPE" }
  ...
  $FILTERS
  ...
}
GROUP BY ...
$ORDER
LIMIT $LIMIT
OFFSET $OFFSET
`;
```

Placeholders that get replaced:
- `$ENTITY_TYPE` - Current entity (Author, Venue, etc.)
- `$FILTERS` - Generated FILTER clauses
- `$ORDER` - ORDER BY clause
- `$LIMIT` - Results limit
- `$OFFSET` - Pagination offset

---

## Development Notes

### Key Design Decisions

1. **Dynamic Columns**: Table reads `head.vars` from SPARQL response, so any SELECT changes are automatically reflected
2. **Array-based Filters**: Multiple values per filter key supported
3. **Case-insensitive Search**: Uses `LCASE()` and `CONTAINS()` in SPARQL
4. **URL Sync**: All state persisted in URL for shareability
5. **ES Modules**: No bundler needed, works directly in browser

### Troubleshooting

**Empty Results**:
- Check browser console for SPARQL errors
- Verify endpoint is accessible

**CORS Errors**:
- Endpoint must allow cross-origin requests
- Consider using a CORS proxy

**Filters Not Working**:
- Check console for filter generation
- Verify filter key matches entity type
