import { getInitialState, setState, getState, updateURLFromState } from './state.js';
import { buildQuery } from './queryBuilder.js';
import { fetchWithCount } from './fetchService.js';
import { renderTable } from './tableView.js';
import { initSearch } from './search.js';
import { renderPagination, updateMetaBar } from './pagination.js';
import { renderFilterChips } from './filterChips.js';

let currentFetchController = null;

async function init() {
    const initialState = getInitialState();
    setState(initialState, false);

    initSearch();
    renderFilterChips(initialState.filters);

    window.addEventListener('updateState', (event) => {
        console.log('updateState event received:', event.detail);
        setState(event.detail);
    });

    document.addEventListener('stateChanged', async (event) => {
        await loadData();
    });

    await loadData();
}

async function loadData() {
    const state = getState();
    console.log('loadData called, state.filters:', state.filters);
    
    const loadingBody = document.getElementById('table-body');
    const loadingMeta = document.getElementById('meta-bar');

    if (loadingBody) {
        loadingBody.innerHTML = '<tr><td colspan="10" class="px-6 py-4 text-center text-gray-500">Loading...</td></tr>';
    }
    if (loadingMeta) {
        loadingMeta.textContent = 'Loading...';
    }

    if (currentFetchController) {
        currentFetchController.abort();
    }
    currentFetchController = new AbortController();

    try {
        const sparqlQuery = buildQuery(state);
        const { data, total } = await fetchWithCount(sparqlQuery);

        renderTable(data, state);
        renderFilterChips(state.filters);
        updateMetaBar(state.page, total, state.limit, state.entity);
        renderPagination(state.page, total, state.limit);
    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }
        console.error('Error loading data:', error);
        
        if (loadingBody) {
            loadingBody.innerHTML = `<tr><td colspan="10" class="px-6 py-4 text-center text-red-500">Error loading data: ${error.message}</td></tr>`;
        }
        if (loadingMeta) {
            loadingMeta.textContent = 'Error loading data';
        }
    }
}

document.addEventListener('DOMContentLoaded', init);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, loadData };
}
