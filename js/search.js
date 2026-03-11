const VALID_FILTER_ENTITIES = ['Author', 'Venue', 'Publication', 'Year', '2020s', '2010s', '2000s', 'Pre2000s'];

function parseSearchQuery(input) {
    const filters = {};
    const parts = input.split(',').map(p => p.trim()).filter(p => p);
    
    for (const part of parts) {
        const colonIndex = part.indexOf(':');
        if (colonIndex > -1) {
            const entity = part.substring(0, colonIndex).trim();
            const value = part.substring(colonIndex + 1).trim();
            
            if (VALID_FILTER_ENTITIES.includes(entity)) {
                if (!filters[entity]) {
                    filters[entity] = [];
                }
                if (value) {
                    filters[entity].push(value);
                }
            }
        } else if (part) {
            if (!filters['Author']) {
                filters['Author'] = [];
            }
            filters['Author'].push(part);
        }
    }
    
    return filters;
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSearch(searchInput.value);
        }
    });
}

function handleSearch(input) {
    const parsedFilters = parseSearchQuery(input);
    const currentState = window.AppState;
    const newFilters = { ...currentState.filters };

    for (const [entity, values] of Object.entries(parsedFilters)) {
        if (values && values.length > 0) {
            newFilters[entity] = values;
        }
    }

    window.dispatchEvent(new CustomEvent('updateState', {
        detail: {
            filters: newFilters,
            page: 1
        }
    }));
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }

    window.dispatchEvent(new CustomEvent('updateState', {
        detail: {
            filters: {},
            page: 1
        }
    }));
}

export { parseSearchQuery, initSearch, handleSearch, clearSearch, VALID_FILTER_ENTITIES };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseSearchQuery, initSearch, handleSearch, clearSearch, VALID_FILTER_ENTITIES };
}
