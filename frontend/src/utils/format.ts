export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  // Calendar dates (enquiry date, due date, joining date, etc.) are stored
  // as UTC midnight for that day — formatting in the viewer's LOCAL
  // timezone (the default without `timeZone` set) can silently shift the
  // displayed day backward for anyone west of UTC, e.g. "15 Mar" rendering
  // as "14 Mar". Pin to UTC so the calendar day shown always matches what
  // was actually stored, regardless of where the viewer's browser is.
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function formatDateTime(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
