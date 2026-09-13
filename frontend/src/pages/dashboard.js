import { getTickets, getTicketStats } from '../api/api.js';
import { formatDate, getStatusBadgeClass, getPriorityBadgeClass } from '../utils/formatting.js';
import { renderLoadingState, renderErrorState, renderEmptyState } from '../components/states.js';
import { navigateTo } from '../utils/router.js';

export async function renderDashboard(container) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full';

  // State
  let stats = { total: 0, open: 0, closed: 0, in_progress: 0, high_open: 0 };
  let tickets = [];
  let isLoadingStats = true;
  let isLoadingTickets = true;
  let statsError = null;
  let ticketsError = null;

  // Filter state
  let searchQuery = '';
  let selectedStatus = '';
  let selectedPriority = '';
  let offset = 0;
  const limit = 20;

  wrapper.innerHTML = `
    <div class="mb-6">
      <!-- Stats Grid -->
      <div id="stats-container" class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <!-- Stats loaded dynamically -->
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white border border-slate-200 rounded-lg shadow-sm mb-5 p-3.5">
      <div class="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div class="w-full md:w-80">
          <label for="search-input" class="sr-only">Search tickets</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input type="text" id="search-input" value="${searchQuery}" placeholder="Search by title, customer, ID..." class="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white">
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select id="status-filter" class="block w-full sm:w-auto pl-3 pr-8 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white text-slate-700">
            <option value="">All Statuses</option>
            <option value="Open" ${selectedStatus === 'Open' ? 'selected' : ''}>Open</option>
            <option value="In Progress" ${selectedStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Closed" ${selectedStatus === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>

          <select id="priority-filter" class="block w-full sm:w-auto pl-3 pr-8 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white text-slate-700">
            <option value="">All Priorities</option>
            <option value="High" ${selectedPriority === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${selectedPriority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Low" ${selectedPriority === 'Low' ? 'selected' : ''}>Low</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Ticket Table Section -->
    <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div id="tickets-content-container">
        <!-- Ticket table loaded dynamically -->
      </div>

      <!-- Pagination -->
      <div id="pagination-container" class="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
        <!-- Pagination loaded dynamically -->
      </div>
    </div>
  `;

  container.appendChild(wrapper);

  const statsContainer = wrapper.querySelector('#stats-container');
  const ticketsContentContainer = wrapper.querySelector('#tickets-content-container');
  const paginationContainer = wrapper.querySelector('#pagination-container');
  const searchInput = wrapper.querySelector('#search-input');
  const statusFilter = wrapper.querySelector('#status-filter');
  const priorityFilter = wrapper.querySelector('#priority-filter');

  async function loadStats() {
    isLoadingStats = true;
    statsError = null;
    renderStatsUI();
    try {
      stats = await getTicketStats();
      isLoadingStats = false;
      renderStatsUI();
    } catch (err) {
      if (err.message === 'BACKEND_UNAVAILABLE') {
        throw err;
      }
      isLoadingStats = false;
      statsError = err.message;
      renderStatsUI();
    }
  }

  function renderStatsUI() {
    if (isLoadingStats) {
      statsContainer.innerHTML = `
        <div class="col-span-full py-4 flex justify-center"><div class="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-slate-900"></div></div>
      `;
      return;
    }
    if (statsError) {
      statsContainer.innerHTML = `<div class="col-span-full text-xs text-rose-600">Failed to load statistics</div>`;
      return;
    }

    statsContainer.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
        <p class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Tickets</p>
        <p class="mt-1 text-xl font-semibold text-slate-900 font-mono">${stats.total ?? 0}</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
        <p class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Open</p>
        <p class="mt-1 text-xl font-semibold text-emerald-600 font-mono">${stats.open ?? 0}</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
        <p class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
        <p class="mt-1 text-xl font-semibold text-amber-600 font-mono">${stats.in_progress ?? 0}</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
        <p class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Closed</p>
        <p class="mt-1 text-xl font-semibold text-slate-600 font-mono">${stats.closed ?? 0}</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm col-span-2 sm:col-span-1">
        <p class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">High Open</p>
        <p class="mt-1 text-xl font-semibold text-rose-600 font-mono">${stats.high_open ?? 0}</p>
      </div>
    `;
  }

  async function loadTickets() {
    isLoadingTickets = true;
    ticketsError = null;
    renderTicketsUI();
    try {
      const params = {
        limit,
        offset,
      };
      if (selectedStatus) params.status = selectedStatus;
      if (selectedPriority) params.priority = selectedPriority;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      tickets = await getTickets(params);
      isLoadingTickets = false;
      renderTicketsUI();
    } catch (err) {
      if (err.message === 'BACKEND_UNAVAILABLE') {
        throw err;
      }
      isLoadingTickets = false;
      ticketsError = err.message;
      renderTicketsUI();
    }
  }

  function renderTicketsUI() {
    if (isLoadingTickets) {
      ticketsContentContainer.innerHTML = '';
      ticketsContentContainer.appendChild(renderLoadingState('Loading tickets...'));
      paginationContainer.innerHTML = '';
      return;
    }

    if (ticketsError) {
      ticketsContentContainer.innerHTML = '';
      ticketsContentContainer.appendChild(renderErrorState(ticketsError, loadTickets));
      paginationContainer.innerHTML = '';
      return;
    }

    if (!tickets || tickets.length === 0) {
      ticketsContentContainer.innerHTML = '';
      const isFiltered = searchQuery || selectedStatus || selectedPriority;
      const emptyStateEl = renderEmptyState(
        isFiltered ? 'No matching tickets found' : 'No tickets in the system',
        isFiltered ? 'Try adjusting your search query or filter criteria.' : 'Get started by creating your first support ticket.',
        isFiltered ? 'Clear Filters' : 'Create Ticket',
        () => {
          if (isFiltered) {
            searchQuery = '';
            selectedStatus = '';
            selectedPriority = '';
            searchInput.value = '';
            statusFilter.value = '';
            priorityFilter.value = '';
            offset = 0;
            loadTickets();
          } else {
            navigateTo('/tickets/new');
          }
        }
      );
      ticketsContentContainer.appendChild(emptyStateEl);
      paginationContainer.innerHTML = '';
      return;
    }

    ticketsContentContainer.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ticket ID</th>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created</th>
              <th scope="col" class="relative px-5 py-3"><span class="sr-only">View</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            ${tickets.map(ticket => `
              <tr class="hover:bg-slate-50/80 transition-colors cursor-pointer group" data-ticket-id="${ticket.ticket_id}">
                <td class="px-5 py-3.5 whitespace-nowrap text-xs font-mono font-medium text-slate-600">
                  ${ticket.ticket_id}
                </td>
                <td class="px-5 py-3.5 text-xs text-slate-900 font-medium max-w-xs truncate">
                  <span class="group-hover:text-slate-900 group-hover:underline">${escapeHtml(ticket.subject)}</span>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                  <div class="font-medium text-slate-900">${escapeHtml(ticket.customer_name)}</div>
                  <div class="text-slate-400 text-[11px]">${escapeHtml(ticket.customer_email)}</div>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap text-xs">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] ${getStatusBadgeClass(ticket.status)}">
                    ${ticket.status}
                  </span>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap text-xs">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] ${getPriorityBadgeClass(ticket.priority)}">
                    ${ticket.priority}
                  </span>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono text-[11px]">
                  ${formatDate(ticket.created_at)}
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap text-right text-xs font-medium">
                  <span class="text-slate-400 group-hover:text-slate-900">View →</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Row click handler
    ticketsContentContainer.querySelectorAll('tr[data-ticket-id]').forEach(row => {
      row.addEventListener('click', () => {
        const ticketId = row.getAttribute('data-ticket-id');
        navigateTo(`/tickets/${ticketId}`);
      });
    });

    // Pagination UI
    const hasMore = tickets.length === limit;
    const hasPrev = offset > 0;

    paginationContainer.innerHTML = `
      <div class="flex-1 flex justify-between sm:hidden">
        <button id="prev-btn-sm" ${!hasPrev ? 'disabled' : ''} class="relative inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 ${!hasPrev ? 'opacity-50 cursor-not-allowed' : ''}">Previous</button>
        <button id="next-btn-sm" ${!hasMore ? 'disabled' : ''} class="ml-3 relative inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 ${!hasMore ? 'opacity-50 cursor-not-allowed' : ''}">Next</button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-xs text-slate-500">
            Showing <span class="font-medium font-mono">${offset + 1}</span> to <span class="font-medium font-mono">${offset + tickets.length}</span> results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button id="prev-btn" ${!hasPrev ? 'disabled' : ''} class="relative inline-flex items-center px-3 py-1.5 rounded-l-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 ${!hasPrev ? 'opacity-50 cursor-not-allowed' : ''}">
              Previous
            </button>
            <button id="next-btn" ${!hasMore ? 'disabled' : ''} class="relative inline-flex items-center px-3 py-1.5 rounded-r-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 ${!hasMore ? 'opacity-50 cursor-not-allowed' : ''}">
              Next
            </button>
          </nav>
        </div>
      </div>
    `;

    const prevBtn = paginationContainer.querySelector('#prev-btn');
    const nextBtn = paginationContainer.querySelector('#next-btn');
    const prevBtnSm = paginationContainer.querySelector('#prev-btn-sm');
    const nextBtnSm = paginationContainer.querySelector('#next-btn-sm');

    if (prevBtn && hasPrev) {
      prevBtn.addEventListener('click', () => {
        offset = Math.max(0, offset - limit);
        loadTickets();
      });
    }
    if (nextBtn && hasMore) {
      nextBtn.addEventListener('click', () => {
        offset += limit;
        loadTickets();
      });
    }
    if (prevBtnSm && hasPrev) {
      prevBtnSm.addEventListener('click', () => {
        offset = Math.max(0, offset - limit);
        loadTickets();
      });
    }
    if (nextBtnSm && hasMore) {
      nextBtnSm.addEventListener('click', () => {
        offset += limit;
        loadTickets();
      });
    }
  }

  // Event listeners for filters
  let searchTimeout = null;
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      offset = 0;
      loadTickets();
    }, 300);
  });

  statusFilter.addEventListener('change', (e) => {
    selectedStatus = e.target.value;
    offset = 0;
    loadTickets();
  });

  priorityFilter.addEventListener('change', (e) => {
    selectedPriority = e.target.value;
    offset = 0;
    loadTickets();
  });

  // Initial load
  await Promise.all([loadStats(), loadTickets()]);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
