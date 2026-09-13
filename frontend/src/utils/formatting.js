export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'Open':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium';
    case 'In Progress':
      return 'bg-amber-50 text-amber-700 border border-amber-200/60 font-medium';
    case 'Closed':
      return 'bg-slate-100 text-slate-600 border border-slate-200 font-medium';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200 font-medium';
  }
}

export function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'High':
      return 'bg-rose-50 text-rose-700 border border-rose-200/60 font-medium';
    case 'Medium':
      return 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
    case 'Low':
      return 'bg-sky-50 text-sky-700 border border-sky-200/60 font-medium';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200 font-medium';
  }
}
