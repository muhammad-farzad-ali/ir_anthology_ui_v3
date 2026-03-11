# IR Anthology UI v3

A lightweight, frontend-only BI tool connected directly to a SPARQL endpoint. This application dynamically renders data tables based on SPARQL query responses, making it completely agnostic to the specific query structure.

## Live Demo

**GitHub Pages**: [https://muhammad-farzad-ali.github.io/ir_anthology_ui_v3/](https://muhammad-farzad-ali.github.io/ir_anthology_ui_v3/)

## Features

- **Dynamic Table Rendering**: Automatically generates columns from SPARQL `head.vars`
- **Interactive Filtering**: Click table cells to add filters (multiple values supported)
- **Search**: Partial text matching using CONTAINS
- **Sorting**: Click column headers to sort ascending/descending
- **Infinite Scroll**: Loads more data as you scroll
- **URL Sync**: All state synced with URL parameters (shareable links)
- **Settings Panel**: Configure SPARQL endpoint
- **Reset**: Clear all filters with one click

## Quick Start

1. Clone the repository
2. Open `index.html` in a browser (or serve via local server)
3. The app loads data from the default SPARQL endpoint

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## Architecture Overview

This project follows a **modular architecture** designed to be simple enough for a junior developer to understand and extend.

### Project Structure

```
ir_anthology_ui_v3/
├── index.html              # Main HTML with Tailwind CSS
├── style.css              # Custom table styles
├── PROGRESS.md            # Development progress notes
├── ABSTRACT.md           # High-level overview
├── IMPLEMENTATION.md     # Detailed documentation
├── README.md             # This file
├── js/
│   ├── app.js            # Main entry point
│   ├── state.js          # State & URL sync
│   ├── queryBuilder.js   # SPARQL query generation
│   ├── fetchService.js   # API communication
│   ├── tableView.js     # Dynamic table rendering
│   ├── search.js        # Search handling
│   ├── filterChips.js   # Filter chip display
│   └── settings.js      # Settings panel
└── .github/workflows/
    └── deploy.yml        # GitHub Pages deployment
```

## State Structure

```javascript
{
    entity: 'Author',           // Current entity type
    filters: {                 // Active filters
        'Author': ['James'],
        'Year': ['2024']
    },
    sort_by: 'Publication',   // Sort column
    order: 'desc',            // Sort direction
    page: 1,                  // Current page
    limit: 50                 // Results per page
}
```

## Usage Guide

### Searching

Type in the search bar and press Enter:
- Values are matched against the current entity type using CONTAINS
- Multiple values separated by commas

### Changing Entity

Click on column header text (e.g., "Author", "Year") to switch entity type.

### Filtering

Click on any table cell to add a filter:
- Filter key = current entity type
- Filter value = clicked cell value

### Sorting

Click the sort arrow (↕) in column headers to toggle ascending/descending.

### Settings

Click the gear icon to change the SPARQL endpoint URL.

### Reset

Click the refresh icon to clear all filters and reset to default state.

## Module Documentation

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for detailed documentation on each module.

## Events System

The app uses CustomEvents for communication:

```javascript
// Update state
window.dispatchEvent(new CustomEvent('updateState', {
    detail: { entity: 'Year', filters: { Year: ['2024'] } }
}));

// Listen for state changes
document.addEventListener('stateChanged', (e) => {
    console.log('State updated:', e.detail);
});
```

## SPARQL Query

The app generates dynamic SPARQL queries. Example output:

```sparql
PREFIX ex: <https://ir.webis.de/kg/>

SELECT (?entity_label AS ?Entity)
 (?entity_URI AS ?URI)
  (COUNT(DISTINCT ?publication_label) AS ?Publication)
  ...
WHERE {
  VALUES ?entityType { "Author" }
  ?publication_URI ex:type "Publication" .
  ...
  FILTER(CONTAINS(LCASE(?author_label), LCASE("james")))
  ...
}
GROUP BY ?entity_label ?entity_URI
ORDER BY DESC(?Publication)
LIMIT 50
OFFSET 0
```

## Deployment

This is a static application deployed on GitHub Pages:

1. Changes pushed to `main` branch trigger automatic deployment
2. Visit the GitHub Pages URL to view the live app

### Manual Deployment

1. Push to GitHub repository
2. Go to Settings → Pages
3. Select "GitHub Actions" as source
4. Wait for workflow to complete

## Troubleshooting

**CORS Issues**: The SPARQL endpoint must allow cross-origin requests. Configure CORS on the endpoint or use a proxy.

**Empty Results**: Check browser console for SPARQL query errors.

**Filters Not Working**: Verify filter key matches entity type in URL.

## License

MIT
