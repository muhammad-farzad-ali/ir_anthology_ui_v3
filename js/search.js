const VALID_FILTER_ENTITIES = ['Author', 'Venue', 'Publication', 'Year', '2020s', '2010s', '2000s', 'Pre2000s'];

function parseSearchQuery(input) {
    const filters = {};
    const parts = input.split(',').map(p => p.trim()).filter(p => p);
    
    for (const part of parts) {
        if (part) {
            filters[part] = [part];
        }
    }
    
    return filters;
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSearch(searchInput.value, searchInput.dataset.searchInside);
        }
    });
}

function handleSearch(input, searchInside) {
    const currentState = window.AppState;
    const newFilters = { ...currentState.filters };
    
    const filterKey = searchInside || currentState.entity || 'Author';
    
    if (!newFilters[filterKey]) {
        newFilters[filterKey] = [];
    }
    
    const parts = input.split(',').map(p => p.trim()).filter(p => p);
    
    for (const part of parts) {
        if (part && !newFilters[filterKey].includes(part)) {
            newFilters[filterKey].push(part);
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

function updateSearchInside(entityType) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.dataset.searchInside = entityType;
    }
}

export { parseSearchQuery, initSearch, handleSearch, clearSearch, updateSearchInside, VALID_FILTER_ENTITIES };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseSearchQuery, initSearch, handleSearch, clearSearch, updateSearchInside, VALID_FILTER_ENTITIES };
}
