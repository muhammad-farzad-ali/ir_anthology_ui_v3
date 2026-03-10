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

    container.innerHTML = '<div class="flex flex-wrap gap-2">';

    filterEntries.forEach(([key, value]) => {
        if (!value) return;

        const chip = document.createElement('div');
        chip.className = 'inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm';
        
        const label = document.createElement('span');
        label.innerHTML = `<strong>${key}:</strong> ${decodeURIComponent(value)}`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'ml-1 text-blue-600 hover:text-blue-800 font-bold';
        removeBtn.innerHTML = '&times;';
        removeBtn.type = 'button';
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Remove button clicked for key:', key);
            removeFilter(key);
        });

        chip.appendChild(label);
        chip.appendChild(removeBtn);
        container.querySelector('div').appendChild(chip);
    });

    container.innerHTML += '</div>';
}

function removeFilter(filterKey) {
    console.log('removeFilter called with key:', filterKey);
    const currentState = window.AppState;
    console.log('Current state filters:', currentState.filters);
    const newFilters = { ...currentState.filters };
    delete newFilters[filterKey];
    console.log('New filters after delete:', newFilters);

    window.dispatchEvent(new CustomEvent('updateState', {
        detail: {
            filters: newFilters,
            page: 1
        }
    }));
}

export { renderFilterChips, removeFilter };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderFilterChips, removeFilter };
}
