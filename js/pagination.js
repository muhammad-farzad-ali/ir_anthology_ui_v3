function renderPagination(currentPage, totalItems, limit) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalItems / limit);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '<div class="flex items-center gap-2">';

    if (currentPage > 1) {
        html += `<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" data-page="${currentPage - 1}">Previous</button>`;
    }

    html += `<span class="px-4 py-2 text-gray-600">Page ${currentPage} of ${totalPages}</span>`;

    if (currentPage < totalPages) {
        html += `<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" data-page="${currentPage + 1}">Next</button>`;
    }

    html += '</div>';
    paginationContainer.innerHTML = html;

    paginationContainer.querySelectorAll('button[data-page]').forEach(button => {
        button.addEventListener('click', (e) => {
            const page = parseInt(e.target.dataset.page, 10);
            window.dispatchEvent(new CustomEvent('updateState', { detail: { page } }));
        });
    });
}

function updateMetaBar(currentPage, totalItems, limit, entity) {
    const metaBar = document.getElementById('meta-bar');
    if (!metaBar) return;

    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalItems);

    if (totalItems === 0) {
        metaBar.textContent = `Showing 0 of 0 ${entity}`;
        return;
    }

    metaBar.textContent = `Showing ${start}-${end} of ${totalItems} ${entity}`;
}

export { renderPagination, updateMetaBar };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderPagination, updateMetaBar };
}
