import { getInitialState, setState, getState, updateURLFromState } from './state.js';
import { buildQuery } from './queryBuilder.js';
import { fetchWithCount } from './fetchService.js';
import { renderTable, appendTableRows } from './tableView.js';
import { initSearch } from './search.js';
import { renderPagination } from './pagination.js';
import { renderFilterChips } from './filterChips.js';

let currentFetchController = null;
let currentData = null;
let isLoadingMore = false;
let totalCount = 0;

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
        await loadData(false);
    });

    setupInfiniteScroll();
    
    await loadData(false);
}

function setupInfiniteScroll() {
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '1px';
    
    const tableSection = document.querySelector('section.bg-white');
    if (tableSection) {
        tableSection.appendChild(sentinel);
    }

    const observer = new IntersectionObserver(async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoadingMore && currentData) {
            const state = getState();
            const loadedCount = currentData.results.bindings.length;
            
            if (loadedCount < totalCount) {
                isLoadingMore = true;
                await loadMoreData();
                isLoadingMore = false;
            }
        }
    }, { rootMargin: '100px' });

    observer.observe(sentinel);
}

async function loadData(isAppend = false) {
    const state = getState();
    console.log('loadData called, state.filters:', state.filters);
    
    if (!isAppend) {
        const loadingBody = document.getElementById('table-body');
        if (loadingBody) {
            loadingBody.innerHTML = '<tr><td colspan="10" class="px-6 py-4 text-center text-gray-500">Loading...</td></tr>';
        }
    }

    if (currentFetchController) {
        currentFetchController.abort();
    }
    currentFetchController = new AbortController();

    try {
        const sparqlQuery = buildQuery(state);
        console.log('SPARQL Query:', sparqlQuery);
        const { data, total } = await fetchWithCount(sparqlQuery);
        
        currentData = data;
        totalCount = total;

        if (isAppend) {
            appendTableRows(data, state);
        } else {
            renderTable(data, state);
            renderFilterChips(state.filters);
            renderPagination(state.page, total, state.limit);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }
        console.error('Error loading data:', error);
        
        const loadingBody = document.getElementById('table-body');
        if (loadingBody) {
            loadingBody.innerHTML = `<tr><td colspan="10" class="px-6 py-4 text-center text-red-500">Error loading data: ${error.message}</td></tr>`;
        }
    }
}

async function loadMoreData() {
    const state = getState();
    const newLimit = state.limit + 100;
    
    window.dispatchEvent(new CustomEvent('updateState', {
        detail: {
            limit: newLimit
        }
    }));
    
    await loadData(true);
}

document.addEventListener('DOMContentLoaded', init);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, loadData, loadMoreData };
}
