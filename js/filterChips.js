function renderFilterChips(filters) {
    const container = document.getElementById('filter-chips');
    if (!container) {
        console.error('Filter chips container not found');
        return;
    }

    console.log('Rendering filter chips with filters:', filters);

    const filterEntries = Object.entries(filters);

    if (filterEntries.length === 0) {
        container.innerHTML = '<div class="text-sm text-gray-400 italic">No active filters</div>';
        return;
    }

    let html = '<div class="flex flex-wrap gap-2">';

    filterEntries.forEach(([key, values]) => {
        if (!values || !Array.isArray(values)) return;
        
        values.forEach((value, index) => {
            if (!value) return;
            html += `
                <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm filter-chip" data-filter-key="${key}" data-filter-index="${index}">
                    <span><strong>${key}:</strong> ${decodeURIComponent(value)}</span>
                    <button type="button" class="ml-1 text-blue-600 hover:text-blue-800 font-bold remove-chip-btn">&times;</button>
                </div>
            `;
        });
    });

    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.remove-chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chip = e.target.closest('.filter-chip');
            const key = chip.dataset.filterKey;
            const index = parseInt(chip.dataset.filterIndex, 10);
            console.log('Remove button clicked for key:', key, 'index:', index);
            removeFilterValue(key, index);
        });
    });
}

function removeFilterValue(filterKey, filterIndex) {
    console.log('removeFilterValue called with key:', filterKey, 'index:', filterIndex);
    const currentState = window.AppState;
    console.log('Current state filters:', currentState.filters);
    const newFilters = { ...currentState.filters };
    
    if (newFilters[filterKey] && Array.isArray(newFilters[filterKey])) {
        newFilters[filterKey].splice(filterIndex, 1);
        if (newFilters[filterKey].length === 0) {
            delete newFilters[filterKey];
        }
    } else {
        delete newFilters[filterKey];
    }
    
    console.log('New filters after delete:', newFilters);

    window.dispatchEvent(new CustomEvent('updateState', {
        detail: {
            filters: newFilters,
            page: 1
        }
    }));
}

export { renderFilterChips, removeFilterValue };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderFilterChips, removeFilterValue };
}
