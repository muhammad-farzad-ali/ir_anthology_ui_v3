# IR Anthology UI v3

A lightweight, frontend-only BI tool connected directly to a SPARQL endpoint. This application dynamically renders data tables based on SPARQL query responses, making it completely agnostic to the specific query structure.

## Architecture Overview

This project follows a **modular architecture** designed to be simple enough for a junior developer to understand and extend. The key design principle is **dynamic table rendering** - by reading the `head.vars` array from the SPARQL JSON response, the UI automatically renders whatever columns the query returns.

### Project Structure

```
ir_anthology_ui_v3/
├── index.html          # Main HTML file with Tailwind CSS
├── style.css          # Custom styles for table interactions
├── js/
│   ├── app.js         # Main entry point - ties all modules together
│   ├── state.js       # Central state management & URL syncing
│   ├── queryBuilder.js # SPARQL query generation
│   ├── fetchService.js # API communication with SPARQL endpoint
│   ├── tableView.js   # Dynamic table rendering (core feature)
│   ├── search.js      # Search input handling
│   └── pagination.js  # Pagination controls
└── README.md
```

### How It Works

1. **State Management** (`state.js`): Maintains application state in sync with URL query parameters
2. **Query Building** (`queryBuilder.js`): Dynamically builds SPARQL queries based on current state
3. **Data Fetching** (`fetchService.js`): Sends queries to the SPARQL endpoint
4. **Dynamic Rendering** (`tableView.js`): Reads `data.head.vars` from SPARQL response and auto-generates table columns
5. **Interactivity**: Search, sorting, and click-to-filter features update state and URL

## Module Documentation

### js/state.js

Manages the application state and syncs it with URL query parameters.

**State Structure:**
```javascript
{
    entity: 'Author',      // Current entity type (Author, Venue, Publication, Year, etc.)
    filters: {},          // Active filters as { entityType: value }
    sort_by: 'Publication', // Column to sort by
    order: 'desc',        // Sort direction ('asc' or 'desc')
    page: 1,              // Current page number
    limit: 100            // Results per page
}
```

**Key Functions:**
- `getInitialState()`: Reads state from URL on page load
- `setState(newState)`: Updates state and URL
- `buildURLFromState(state)`: Generates URL from state object

### js/queryBuilder.js

Builds SPARQL queries dynamically based on application state.

**Base Query Template:**
The module contains the main SPARQL query that counts publications, venues, authors, and years for each entity type.

**Key Functions:**
- `buildQuery(state)`: Returns a complete SPARQL string with state values injected
- `buildFilters(filters)`: Generates FILTER clauses for URI-based filtering
- `buildOrder(sort_by, order)`: Generates ORDER BY clause

### js/tableView.js

**The Core Dynamic Feature**: This module reads `data.head.vars` from the SPARQL JSON response and automatically generates table columns. If you modify the SELECT statement in the SPARQL query, the UI updates automatically.

**Key Features:**
- Auto-generates `<th>` elements from `data.head.vars`
- Auto-generates `<td>` elements from `data.results.bindings`
- Hides specific columns (like 'URI') from display
- Makes certain columns clickable for pivot/navigation
- Adds sorting functionality to headers

**Adding New Columns:**
To add a new column to the UI:
1. Modify the SPARQL query in `queryBuilder.js` to include the new variable
2. The table automatically renders it - no JavaScript changes needed

### js/search.js

Handles search input with format: `EntityType: searchTerm`

**Examples:**
- `Author: John` - Filter for authors named John
- `Venue: SIGIR` - Filter for SIGIR venue

### js/fetchService.js

Communicates with the SPARQL endpoint.

**Configuration:**
```javascript
const SPARQL_ENDPOINT = 'http://webislab33.medien.uni-weimar.de:7018/sparql/';
```

### js/pagination.js

Handles pagination UI and meta text display.

## Extending the Application

### Adding a New Entity Type

1. Add to `VALID_ENTITIES` array in `queryBuilder.js`
2. Add the SPARQL variable mapping in `ENTITY_TYPE_TO_SPARQL_VAR`
3. Update `VALID_FILTER_ENTITIES` in `search.js` if needed

### Modifying the SPARQL Query

1. Edit `BASE_SPARQL_TEMPLATE` in `queryBuilder.js`
2. The UI will automatically reflect any new columns via `data.head.vars`

### Adding New UI Features

1. Add the feature to the appropriate module
2. Emit a `stateChanged` event or dispatch `updateState` to trigger data reload

## Events

The application uses CustomEvents for communication:

- `stateChanged`: Fired when state is updated (triggers data reload)
- `updateState`: Dispatch on window to update state

Example:
```javascript
window.dispatchEvent(new CustomEvent('updateState', {
    detail: { sort_by: 'Year', order: 'asc' }
}));
```

## Deployment

This is a static application that can be deployed to GitHub Pages:

1. Build the project (if using a bundler)
2. Push to a GitHub repository
3. Enable GitHub Pages in repository settings
4. The app runs entirely client-side with no backend required

## Browser Support

- Modern browsers with ES6 module support
- Tailwind CSS via CDN for styling

## Troubleshooting

**CORS Issues:** If the SPARQL endpoint doesn't allow CORS, you may need a proxy server or CORS configuration on the endpoint.

**Empty Results:** Check the browser console for SPARQL query errors. The query can be logged from `fetchService.js`.

**Sorting Not Working:** Ensure the column name in `sort_by` matches exactly what's in `data.head.vars`.
