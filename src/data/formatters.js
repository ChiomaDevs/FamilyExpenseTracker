export function formatMoney(amount) {
  return '₦' + Math.round(Number(amount)).toLocaleString('en-US');
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function getMonthYear(date = new Date()) {
  return { year: date.getFullYear(), month: date.getMonth() };
}
