import { createTicket } from '../api/api.js';
import { navigateTo } from '../utils/router.js';

export async function renderCreateTicket(container) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full';

  wrapper.innerHTML = `
    <div class="mb-6">
      <a href="/" data-link class="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 mb-3 transition-colors">
        ← Back to Dashboard
      </a>
      <h1 class="text-xl font-semibold text-slate-900 tracking-tight">Create Support Ticket</h1>
      <p class="text-xs text-slate-500 mt-0.5">Submit a new customer inquiry or support request into the desk.</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 sm:p-8">
      <form id="create-ticket-form" class="space-y-6" novalidate>

        <!-- Customer Information Section -->
        <div>
          <h3 class="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Customer Details</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="customer_name" class="block text-xs font-medium text-slate-700 mb-1">Customer Name *</label>
              <input type="text" id="customer_name" name="customer_name" placeholder="Sarah Connor" class="block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900">
              <p id="error-customer_name" class="mt-1 text-xs text-rose-600 hidden"></p>
            </div>

            <div>
              <label for="customer_email" class="block text-xs font-medium text-slate-700 mb-1">Customer Email *</label>
              <input type="email" id="customer_email" name="customer_email" placeholder="sarah@cyberdyne.io" class="block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900">
              <p id="error-customer_email" class="mt-1 text-xs text-rose-600 hidden"></p>
            </div>
          </div>
        </div>

        <!-- Ticket Information Section -->
        <div>
          <h3 class="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Ticket Information</h3>

          <div class="space-y-4">
            <div>
              <label for="subject" class="block text-xs font-medium text-slate-700 mb-1">Issue Title *</label>
              <input type="text" id="subject" name="subject" placeholder="e.g. Unable to process recurring invoice payment" class="block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900">
              <p id="error-subject" class="mt-1 text-xs text-rose-600 hidden"></p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="priority" class="block text-xs font-medium text-slate-700 mb-1">Priority Level</label>
                <select id="priority" name="priority" class="block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white text-slate-900">
                  <option value="Medium" selected>Medium Priority</option>
                  <option value="Low">Low Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label for="description" class="block text-xs font-medium text-slate-700 mb-1">Description *</label>
              <textarea id="description" name="description" rows="5" placeholder="Provide full context, error logs, or replication steps..." class="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"></textarea>
              <p id="error-description" class="mt-1 text-xs text-rose-600 hidden"></p>
            </div>
          </div>
        </div>

        <div id="form-error" class="rounded-md bg-rose-50 border border-rose-200 p-3.5 hidden">
          <div class="flex">
            <div class="text-xs text-rose-700 font-medium" id="form-error-text"></div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <a href="/" data-link class="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors">
            Cancel
          </a>
          <button type="submit" id="submit-btn" class="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none transition-colors">
            Create Ticket
          </button>
        </div>

      </form>
    </div>
  `;

  container.appendChild(wrapper);

  const form = wrapper.querySelector('#create-ticket-form');
  const submitBtn = wrapper.querySelector('#submit-btn');
  const formError = wrapper.querySelector('#form-error');
  const formErrorText = wrapper.querySelector('#form-error-text');

  function clearErrors() {
    ['customer_name', 'customer_email', 'subject', 'description'].forEach(field => {
      const errEl = wrapper.querySelector(`#error-${field}`);
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.add('hidden');
      }
      const inputEl = wrapper.querySelector(`#${field}`);
      if (inputEl) inputEl.classList.remove('border-rose-500', 'focus:ring-rose-500', 'focus:border-rose-500');
    });
    formError.classList.add('hidden');
  }

  function showFieldError(field, message) {
    const errEl = wrapper.querySelector(`#error-${field}`);
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.remove('hidden');
    }
    const inputEl = wrapper.querySelector(`#${field}`);
    if (inputEl) inputEl.classList.add('border-rose-500', 'focus:ring-rose-500', 'focus:border-rose-500');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const customer_name = form.customer_name.value.trim();
    const customer_email = form.customer_email.value.trim();
    const subject = form.subject.value.trim();
    const description = form.description.value.trim();
    const priority = form.priority.value;

    let isValid = true;

    if (!customer_name) {
      showFieldError('customer_name', 'Customer name is required.');
      isValid = false;
    }

    if (!customer_email) {
      showFieldError('customer_email', 'Customer email is required.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer_email)) {
        showFieldError('customer_email', 'Please enter a valid email address.');
        isValid = false;
      }
    }

    if (!subject) {
      showFieldError('subject', 'Issue title is required.');
      isValid = false;
    }

    if (!description) {
      showFieldError('description', 'Description is required.');
      isValid = false;
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
      const result = await createTicket({
        customer_name,
        customer_email,
        subject,
        description,
        priority,
      });

      if (result && result.ticket_id) {
        navigateTo(`/tickets/${result.ticket_id}`);
      } else {
        navigateTo('/');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Ticket';
      if (err.message === 'BACKEND_UNAVAILABLE') {
        throw err;
      }
      formErrorText.textContent = err.message || 'Failed to create ticket. Please try again.';
      formError.classList.remove('hidden');
    }
  });
}
