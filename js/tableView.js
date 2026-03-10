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
    renderTableBody(vars, bindings);
}

function renderTableHead(vars, state) {
    const thead = document.getElementById('table-head');
    if (!thead) return;

    const headerRow = document.createElement('tr');
    vars.forEach(varName => {
        if (HIDDEN_COLUMNS.includes(varName)) return;

        const th = document.createElement('th');
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sortable-header';
        th.textContent = varName;
        th.dataset.sortBy = varName;

        if (state.sort_by === varName) {
            th.classList.add(state.order === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }

        th.addEventListener('click', () => handleSortClick(varName));
        headerRow.appendChild(th);
    });

    thead.innerHTML = '';
    thead.appendChild(headerRow);
}

function renderTableBody(vars, bindings) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

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
                } else if (CLICKABLE_COLUMNS.includes(varName)) {
                    td.className = 'clickable-cell text-blue-600';
                    td.dataset.column = varName;
                    td.dataset.uri = row['URI']?.value || '';
                    td.dataset.value = displayValue;
                    td.textContent = displayValue;
                } else {
                    td.textContent = displayValue;
                }
            } else {
                td.textContent = '-';
            }

            td.className = td.className ? td.className : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
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
    const rowUri = cell.dataset.uri;

    if (!rowUri) return;

    const currentState = window.AppState;
    const currentEntityType = currentState.entity;

    const newFilters = { ...currentState.filters };
    newFilters[currentEntityType] = rowUri;

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
