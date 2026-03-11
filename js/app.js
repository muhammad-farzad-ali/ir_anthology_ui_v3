import { getInitialState, setState, getState, updateURLFromState } from './state.js';
import { buildQuery } from './queryBuilder.js';
import { fetchWithCount } from './fetchService.js';
import { renderTable } from './tableView.js';
import { initSearch } from './search.js';
import { renderFilterChips } from './filterChips.js';

let currentFetchController = null;
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
        await loadData();
    });

    setupInfiniteScroll();
    
    await loadData();
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
        if (entry.isIntersecting && !isLoadingMore) {
            const state = getState();
            const currentLimit = state.limit;
            
            if (currentLimit < totalCount || currentLimit < 1000) {
                isLoadingMore = true;
                const newLimit = Math.min(currentLimit + 100, 1000);
                
                window.dispatchEvent(new CustomEvent('updateState', {
                    detail: {
                        limit: newLimit,
                        page: 1
                    }
                }));
                
                isLoadingMore = false;
            }
        }
    }, { rootMargin: '100px' });

    observer.observe(sentinel);
}

async function loadData() {
    const state = getState();
    console.log('loadData called, state.filters:', state.filters);
    
    const loadingBody = document.getElementById('table-body');
    if (loadingBody) {
        loadingBody.innerHTML = '<tr><td colspan="10" class="px-6 py-4 text-center text-gray-500">Loading...</td></tr>';
    }

    if (currentFetchController) {
        currentFetchController.abort();
    }
    currentFetchController = new AbortController();

    try {
        const sparqlQuery = buildQuery(state);
        console.log('SPARQL Query:', sparqlQuery);
        const { data, total } = await fetchWithCount(sparqlQuery);
        
        totalCount = total;

        renderTable(data, state);
        renderFilterChips(state.filters);
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

document.addEventListener('DOMContentLoaded', init);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, loadData };
}
