import { getTicket, updateTicket } from '../api/api.js';
import { formatDateTime, getStatusBadgeClass, getPriorityBadgeClass } from '../utils/formatting.js';
import { renderLoadingState, renderErrorState } from '../components/states.js';

export async function renderTicketDetails(container, ticketId) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full';

  let ticket = null;
  let isLoading = true;
  let error = null;
  let isSubmitting = false;
  let submitError = null;
  let successMessage = null;

  wrapper.innerHTML = `
    <div class="mb-5">
      <a href="/" data-link class="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to Dashboard
      </a>
    </div>
    <div id="ticket-detail-content">
      <!-- Loaded dynamically -->
    </div>
  `;

  container.appendChild(wrapper);
  const contentContainer = wrapper.querySelector('#ticket-detail-content');

  async function loadData() {
    isLoading = true;
    error = null;
    renderUI();
    try {
      ticket = await getTicket(ticketId);
      isLoading = false;
      renderUI();
    } catch (err) {
      if (err.message === 'BACKEND_UNAVAILABLE') {
        throw err;
      }
      isLoading = false;
      error = err.message;
      renderUI();
    }
  }

  function renderUI() {
    if (isLoading) {
      contentContainer.innerHTML = '';
      contentContainer.appendChild(renderLoadingState('Loading ticket details...'));
      return;
    }

    if (error) {
      contentContainer.innerHTML = '';
      contentContainer.appendChild(renderErrorState(error, loadData));
      return;
    }

    if (!ticket) {
      contentContainer.innerHTML = '';
      contentContainer.appendChild(renderErrorState('Ticket not found.', loadData));
      return;
    }

    contentContainer.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Details Column (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Ticket Header Card -->
          <div class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
              <div class="flex items-center space-x-2.5">
                <span class="text-xs font-semibold text-slate-500 font-mono">${ticket.ticket_id}</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] ${getStatusBadgeClass(ticket.status)}">
                  ${ticket.status}
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] ${getPriorityBadgeClass(ticket.priority)}">
                  ${ticket.priority} Priority
                </span>
              </div>
              <span class="text-xs text-slate-400 font-mono">Created ${formatDateTime(ticket.created_at)}</span>
            </div>

            <h1 class="text-xl font-semibold text-slate-900 mt-4 tracking-tight">${escapeHtml(ticket.subject)}</h1>

            <!-- Customer Meta Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
              <div>
                <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Customer Name</p>
                <p class="mt-1 text-xs font-semibold text-slate-900">${escapeHtml(ticket.customer_name)}</p>
              </div>
              <div>
                <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Customer Email</p>
                <p class="mt-1 text-xs text-slate-900">
                  <a href="mailto:${escapeHtml(ticket.customer_email)}" class="text-slate-900 font-medium hover:underline">${escapeHtml(ticket.customer_email)}</a>
                </p>
              </div>
            </div>

            <!-- Description -->
            <div class="mt-6 pt-6 border-t border-slate-200">
              <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">Issue Description</p>
              <div class="bg-slate-50 rounded-md p-4 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-200/60">${escapeHtml(ticket.description)}</div>
            </div>
          </div>

          <!-- Activity & Notes History -->
          <div class="space-y-4">
            <h2 class="text-xs font-semibold text-slate-900 uppercase tracking-wider">Activity & Notes History</h2>

            ${(!ticket.notes || ticket.notes.length === 0) ? `
              <div class="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500 shadow-sm">
                No notes or status updates recorded yet.
              </div>
            ` : `
              <div class="space-y-3">
                ${ticket.notes.map(note => `
                  <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span class="text-xs font-medium text-slate-700">Support Note</span>
                      <span class="text-[11px] text-slate-400 font-mono">${formatDateTime(note.created_at)}</span>
                    </div>
                    <p class="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">${escapeHtml(note.note_text)}</p>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Sidebar Column: Update Ticket Panel (1 col) -->
        <div>
          <div class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm sticky top-20">
            <h2 class="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Update Ticket</h2>

            <form id="update-form" class="space-y-4">
              <div>
                <label for="update-status" class="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select id="update-status" class="block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white text-slate-900">
                  <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
                  <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Closed" ${ticket.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
              </div>

              <div>
                <label for="update-note" class="block text-xs font-medium text-slate-700 mb-1">Add Note *</label>
                <textarea id="update-note" rows="4" placeholder="Detail progress or reason for status change..." class="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"></textarea>
                <p id="note-error" class="mt-1 text-xs text-rose-600 hidden">Note is required.</p>
              </div>

              ${submitError ? `<div class="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-600">${escapeHtml(submitError)}</div>` : ''}
              ${successMessage ? `<div class="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-600">${escapeHtml(successMessage)}</div>` : ''}

              <button type="submit" id="update-submit-btn" ${isSubmitting ? 'disabled' : ''} class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}">
                ${isSubmitting ? 'Updating...' : 'Update Ticket'}
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    const updateForm = contentContainer.querySelector('#update-form');
    if (updateForm) {
      updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newStatus = updateForm.querySelector('#update-status').value;
        const noteText = updateForm.querySelector('#update-note').value.trim();
        const noteError = updateForm.querySelector('#note-error');

        if (!noteText) {
          noteError.classList.remove('hidden');
          return;
        }
        noteError.classList.add('hidden');

        isSubmitting = true;
        submitError = null;
        successMessage = null;
        renderUI();

        try {
          await updateTicket(ticket.ticket_id, newStatus, noteText);
          isSubmitting = false;
          successMessage = 'Ticket updated successfully.';
          ticket = await getTicket(ticketId);
          renderUI();
        } catch (err) {
          if (err.message === 'BACKEND_UNAVAILABLE') {
            throw err;
          }
          isSubmitting = false;
          submitError = err.message || 'Failed to update ticket.';
          renderUI();
        }
      });
    }
  }

  await loadData();
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
