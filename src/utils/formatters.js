const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '—';
  return currencyFormatter.format(value);
}

export function formatPercent(value) {
  if (value == null || isNaN(value)) return '—';
  return percentFormatter.format(value / 100);
}

export function formatNumber(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatMonthYear(dateStr) {
  if (!dateStr) return '—';
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
}

export function addMonths(dateStr, months) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1 + months, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
}
