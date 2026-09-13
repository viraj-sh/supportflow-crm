export function renderNavbar(currentPath) {
  const nav = document.createElement('header');
  nav.className = 'bg-white border-b border-gray-200 sticky top-0 z-30';

  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center space-x-3">
          <a href="/" data-link class="flex items-center space-x-2.5 text-slate-900 group">
            <span class="font-semibold text-sm tracking-tight text-slate-900">SupportFlow</span>
            <span class="hidden sm:inline text-xs text-slate-400 font-normal pl-2.5 border-l border-slate-200">CRM</span>
          </a>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/" data-link class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPath === '/' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}">
            Dashboard
          </a>
          <a href="/tickets/new" data-link class="inline-flex items-center px-3.5 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm">
            Create Ticket
          </a>
        </div>
      </div>
    </div>
  `;

  return nav;
}
