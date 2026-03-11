# IR Anthology UI v3 - Project Summary

## Goal

Build a static IR Anthology UI for GitHub Pages that dynamically renders data from a SPARQL endpoint with filtering, sorting, search, and infinite scroll.

## Instructions

1. Use modular JavaScript approach (simple enough for junior developer)
2. Keep everything static (GitHub Pages compatible)
3. Use Tailwind CSS via CDN
4. Make table 100% dynamic by reading `data.head.vars` from SPARQL JSON response
5. Support filtering via CONTAINS for partial matching
6. URL must sync with application state

## Discoveries

1. **Mixed Content Error**: GitHub Pages is HTTPS but the SPARQL endpoint (`http://webislab33.medien.uni-weimar.de:7018/sparql/`) is HTTP, causing browser to block requests. This works locally because localhost isn't subject to mixed content restrictions.
2. **Event Dispatch**: Used `window.dispatchEvent` and `window.addEventListener` for cross-module communication
3. **Dynamic SPARQL Variables**: Use `getLabelVar(entityType)` → `?${entityType.toLowerCase()}_label` instead of hardcoded mappings
4. **URL Sync**: Filters stored as arrays in state, need to handle multiple `filter_Key=value` params in URL

## Accomplished

- Project setup with Tailwind CSS and HTML structure
- Dynamic SPARQL query builder with CONTAINS for partial matching
- API fetch service with configurable endpoint
- 100% dynamic table rendering from `head.vars`
- Search with `data-search-inside` attribute and CONTAINS filters
- Filter chips with separate key/value display
- Reset button to clear filters
- Settings panel for SPARQL endpoint configuration
- GitHub Pages deployment workflow
- Complete documentation (ABSTRACT.md, IMPLEMENTATION.md, README.md)

## Current Issue

The app fails on GitHub Pages due to mixed content (HTTP endpoint on HTTPS page). Need to either:
- Use HTTPS endpoint (if available)
- Use a CORS proxy
- Contact server admin to enable HTTPS
