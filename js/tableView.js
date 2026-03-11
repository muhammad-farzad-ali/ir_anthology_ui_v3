const HIDDEN_COLUMNS = ['URI'];
const CLICKABLE_COLUMNS = ['Entity', 'Publication', 'Venue', 'Author', 'Year', '2020s', '2010s', '2000s', 'Pre2000s'];

function renderTable(data, state) {
    if (!data || !data.head || !data.head.vars) {
        renderEmptyTable();
        return;
    }

    const vars = data.head.vars;
    const bindings = data.results.bindings;

    renderTableHead(vars, state);
    renderTableBody(vars, bindings, state);
}

const COLUMN_WIDTHS = {
    'Entity': 'w-auto min-w-[200px]',
    'Publication': 'w-24',
    'Venue': 'w-24',
    'Author': 'w-24',
    'Year': 'w-20',
    '2020s': 'w-20',
    '2010s': 'w-20',
    '2000s': 'w-20',
    'Pre2000s': 'w-24'
};

function renderTableHead(vars, state) {
    const thead = document.getElementById('table-head');
    if (!thead) return;

    const headerRow = document.createElement('tr');
    vars.forEach(varName => {
        if (HIDDEN_COLUMNS.includes(varName)) return;

        const th = document.createElement('th');
        const widthClass = COLUMN_WIDTHS[varName] || 'w-24';
        th.className = `${widthClass}`;

        const textBtn = document.createElement('button');
        textBtn.className = 'text-left text-xs font-medium tracking-wider';
        if (state.entity === varName) {
            textBtn.classList.add('font-bold');
            textBtn.style.color = '#1d4ed8';
        }
        textBtn.textContent = varName;
        textBtn.addEventListener('click', () => handleEntityChange(varName));

        const sortBtn = document.createElement('button');
        sortBtn.className = 'ml-1 text-gray-400 hover:text-gray-600';
        sortBtn.dataset.sortBy = varName;
        if (state.sort_by === varName) {
            sortBtn.textContent = state.order === 'asc' ? '▲' : '▼';
            sortBtn.classList.add('text-blue-600');
        } else {
            sortBtn.textContent = '↕';
        }
        sortBtn.addEventListener('click', () => handleSortClick(varName));

        th.appendChild(textBtn);
        th.appendChild(sortBtn);
        headerRow.appendChild(th);
    });

    thead.innerHTML = '';
    thead.appendChild(headerRow);
}

function handleEntityChange(varName) {
    const currentState = window.AppState;
    if (currentState.entity === varName) return;

    window.dispatchEvent(new CustomEvent('updateState', {
        detail: {
            entity: varName,
            filters: {},
            page: 1
        }
    }));
}

function renderTableBody(vars, bindings, state) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    const currentEntityType = state?.entity || 'Author';

    tbody.innerHTML = '';

    if (bindings.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = vars.filter(v => !HIDDEN_COLUMNS.includes(v)).length;
        td.className = 'px-6 py-4 text-center text-gray-500';
        td.textContent = 'No results found';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    bindings.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        tr.className = rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';

        vars.forEach(varName => {
            if (HIDDEN_COLUMNS.includes(varName)) return;

            const td = document.createElement('td');
            const widthClass = COLUMN_WIDTHS[varName] || 'w-24';
            const cellData = row[varName];

            if (cellData && cellData.value) {
                let displayValue = cellData.value;

                if (varName === 'Entity') {
                    const uri = row['URI']?.value;
                    if (uri) {
                        td.innerHTML = `<a href="${uri}" target="_blank" class="text-blue-600 hover:underline">${displayValue}</a>`;
                    } else {
                        td.textContent = displayValue;
                    }
                    td.className = `px-4 py-3 text-sm text-gray-900 break-words ${widthClass}`;
                } else if (CLICKABLE_COLUMNS.includes(varName)) {
                    const entityTitle = row['Entity']?.value || displayValue;
                    const entityUri = row['URI']?.value || '';
                    td.className = `clickable-cell text-blue-600 text-center ${widthClass}`;
                    td.dataset.column = varName;
                    td.dataset.entityTitle = entityTitle;
                    td.dataset.entityUri = entityUri;
                    td.dataset.entityType = currentEntityType;
                    td.textContent = displayValue;
                } else {
                    td.textContent = displayValue;
                    td.className = `px-4 py-3 text-sm text-gray-900 text-center ${widthClass}`;
                }
            } else {
                td.textContent = '-';
                td.className = `px-4 py-3 text-sm text-gray-900 text-center ${widthClass}`;
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    tbody.addEventListener('click', handleCellClick);
}

function renderEmptyTable() {
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');

    if (thead) {
        thead.innerHTML = '<tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No Data</th></tr>';
    }

    if (tbody) {
        tbody.innerHTML = '<tr><td class="px-6 py-4 text-gray-500">No data available</td></tr>';
    }
}

function handleSortClick(columnName) {
    const currentState = window.AppState;
    const newOrder = currentState.sort_by === columnName && currentState.order === 'desc' ? 'asc' : 'desc';

    window.dispatchEvent(new CustomEvent('updateState', {
        detail: {
            sort_by: columnName,
            order: newOrder,
            page: 1
        }
    }));
}

function handleCellClick(event) {
    const cell = event.target.closest('.clickable-cell');
    if (!cell) return;

    const clickedColumn = cell.dataset.column;
    const entityType = cell.dataset.entityType;
    const entityTitle = cell.dataset.entityTitle;

    console.log('Cell clicked:', { clickedColumn, entityType, entityTitle });

    if (!entityTitle) return;

    const currentState = window.AppState;
    const newFilters = { ...currentState.filters };
    
    if (!newFilters[entityType]) {
        newFilters[entityType] = [];
    }
    if (!Array.isArray(newFilters[entityType])) {
        newFilters[entityType] = [newFilters[entityType]];
    }
    
    if (entityTitle && !newFilters[entityType].includes(entityTitle)) {
        newFilters[entityType].push(entityTitle);
    }

    console.log('New filters:', newFilters);
    console.log('Dispatching updateState event...');

    window.dispatchEvent(new CustomEvent('updateState', {
        detail: {
            entity: clickedColumn,
            filters: newFilters,
            page: 1
        }
    }));
}

export { renderTable, renderTableHead, renderTableBody, HIDDEN_COLUMNS, CLICKABLE_COLUMNS };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderTable, renderTableHead, renderTableBody, HIDDEN_COLUMNS, CLICKABLE_COLUMNS };
}
