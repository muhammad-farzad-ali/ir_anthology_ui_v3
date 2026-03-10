const VALID_FILTER_ENTITIES = ['Author', 'Venue', 'Publication', 'Year', '2020s', '2010s', '2000s', 'Pre2000s'];

function parseSearchQuery(input) {
    const trimmed = input.trim();
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > -1) {
        const entity = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        
        if (VALID_FILTER_ENTITIES.includes(entity)) {
            return { entity, value };
        }
    }

    if (trimmed) {
        return { entity: null, value: trimmed };
    }

    return { entity: null, value: '' };
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
    const parsed = parseSearchQuery(input);
    const currentState = window.AppState;

    if (parsed.entity && parsed.value) {
        const newFilters = { ...currentState.filters };
        newFilters[parsed.entity] = parsed.value;

        window.dispatchEvent(new CustomEvent('updateState', {
            detail: {
                filters: newFilters,
                page: 1
            }
        }));
    } else if (parsed.value) {
        const filterKey = currentState.entity;
        const newFilters = { ...currentState.filters };
        newFilters[filterKey] = parsed.value;

        window.dispatchEvent(new CustomEvent('updateState', {
            detail: {
                filters: newFilters,
                page: 1
            }
        }));
    } else {
        window.dispatchEvent(new CustomEvent('updateState', {
            detail: {
                filters: {},
                page: 1
            }
        }));
    }
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseSearchQuery, initSearch, handleSearch, clearSearch, VALID_FILTER_ENTITIES };
}
