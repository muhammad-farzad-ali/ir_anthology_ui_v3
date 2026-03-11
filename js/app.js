import { getInitialState, setState, getState, updateURLFromState } from './state.js';
import { buildQuery } from './queryBuilder.js';
import { fetchWithCount, setEndpoint } from './fetchService.js';
import { renderTable } from './tableView.js';
import { initSearch, updateSearchInside } from './search.js';
import { renderFilterChips } from './filterChips.js';
import { initSettings } from './settings.js';

let currentFetchController = null;
let isLoadingMore = false;
let totalCount = 0;
let previousScrollPosition = 0;
let previousLimit = 50;

async function init() {
    const initialState = getInitialState();
    initialState.limit = 50;
    setState(initialState, false);
    previousLimit = 50;

    initSearch();
    initSettings();
    renderFilterChips(initialState.filters);

    document.getElementById('reset-btn')?.addEventListener('click', () => {
        const defaultState = {
            entity: 'Author',
            filters: {},
            sort_by: 'Publication',
            order: 'desc',
            page: 1,
            limit: 50
        };
        setState(defaultState);
    });

    window.addEventListener('updateState', (event) => {
        console.log('updateState event received:', event.detail);
        setState(event.detail);
    });

    window.addEventListener('endpointChanged', (event) => {
        console.log('Endpoint changed:', event.detail.endpoint);
        setEndpoint(event.detail.endpoint);
        loadData(false);
    });

    document.addEventListener('stateChanged', async (event) => {
        const currentState = getState();
        const isLimitIncrease = currentState.limit > previousLimit;
        previousLimit = currentState.limit;
        updateSearchInside(currentState.entity);
        await loadData(isLimitIncrease);
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
        if (entry.isIntersecting && !isLoadingMore) {
            const state = getState();
            const currentLimit = state.limit;
            
            if (currentLimit < totalCount || currentLimit < 1000) {
                isLoadingMore = true;
                previousScrollPosition = window.scrollY;
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

async function loadData(keepScrollPosition = false) {
    const state = getState();
    console.log('loadData called, state.filters:', state.filters);
    
    if (!keepScrollPosition) {
        previousScrollPosition = window.scrollY;
    }

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

        if (keepScrollPosition && previousScrollPosition > 0) {
            requestAnimationFrame(() => {
                window.scrollTo(0, previousScrollPosition);
            });
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

document.addEventListener('DOMContentLoaded', init);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, loadData };
}
