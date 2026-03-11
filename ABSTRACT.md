# IR Anthology UI - Abstract

## Overview

A lightweight, static web application that dynamically renders data from a SPARQL endpoint. The UI is completely data-driven - it reads column names from the SPARQL response and automatically generates the table, making it adaptable to any SPARQL query structure.

## Key Features

- **Dynamic Table Rendering**: Reads `head.vars` from SPARQL JSON response and auto-generates columns
- **Interactive Filtering**: Click table cells to filter, with support for multiple values per category
- **Search**: Partial text matching using CONTAINS for flexible search
- **Sorting**: Click column headers to sort ascending/descending
- **Infinite Scroll**: Loads more data as user scrolls
- **URL Sync**: All state (filters, sort, entity) synced with URL parameters
- **Configurable Endpoint**: Change SPARQL endpoint via settings panel

## Technology Stack

- Vanilla JavaScript (ES6 Modules)
- Tailwind CSS (via CDN)
- SPARQL Protocol
- GitHub Pages

## Architecture

```
index.html → js/app.js → [state, queryBuilder, fetchService, tableView, search, filterChips, settings]
                    ↓
              SPARQL Endpoint
                    ↓
              Dynamic Table
```

## Usage

1. Open the application
2. Search using the search bar (e.g., "james" to search within current entity)
3. Click column headers to change entity type (Author, Venue, Year, etc.)
4. Click table cells to add filters
5. Use settings icon to change SPARQL endpoint
6. Use reset icon to clear all filters

## Live Demo

Deployed on GitHub Pages: `https://muhammad-farzad-ali.github.io/ir_anthology_ui_v3/`
