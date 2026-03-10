const DEFAULT_STATE = {
    entity: 'Author',
    filters: {},
    sort_by: 'Publication',
    order: 'desc',
    page: 1,
    limit: 100
};

const STATE_KEYS = ['entity', 'filters', 'sort_by', 'order', 'page', 'limit'];

function getInitialState() {
    const params = new URLSearchParams(window.location.search);
    const state = { ...DEFAULT_STATE };

    if (params.has('entity')) {
        state.entity = params.get('entity');
    }

    if (params.has('sort_by')) {
        state.sort_by = params.get('sort_by');
    }

    if (params.has('order')) {
        state.order = params.get('order');
    }

    if (params.has('page')) {
        state.page = parseInt(params.get('page'), 10);
    }

    if (params.has('limit')) {
        state.limit = parseInt(params.get('limit'), 10);
    }

    for (const [key, value] of params.entries()) {
        if (key.startsWith('filter_')) {
            const filterKey = key.replace('filter_', '');
            state.filters[filterKey] = decodeURIComponent(value);
        }
    }

    return state;
}

function getState() {
    return window.AppState || getInitialState();
}

function setState(newState, pushToHistory = true) {
    window.AppState = { ...window.AppState, ...newState };
    
    if (pushToHistory) {
        const url = buildURLFromState(window.AppState);
        window.history.pushState(window.AppState, '', url);
    }
    
    document.dispatchEvent(new CustomEvent('stateChanged', { detail: window.AppState }));
}

function buildURLFromState(state) {
    const params = new URLSearchParams();
    
    params.set('entity', state.entity);
    params.set('sort_by', state.sort_by);
    params.set('order', state.order);
    params.set('page', state.page);
    params.set('limit', state.limit);

    for (const [key, value] of Object.entries(state.filters)) {
        if (value) {
            params.set(`filter_${key}`, value);
        }
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : window.location.pathname;
}

function updateURLFromState() {
    const url = buildURLFromState(window.AppState);
    window.history.replaceState(window.AppState, '', url);
}

window.addEventListener('popstate', (event) => {
    if (event.state) {
        window.AppState = event.state;
        document.dispatchEvent(new CustomEvent('stateChanged', { detail: event.state }));
    }
});

export { DEFAULT_STATE, getInitialState, getState, setState, buildURLFromState, updateURLFromState };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEFAULT_STATE, getInitialState, getState, setState, buildURLFromState, updateURLFromState };
}
