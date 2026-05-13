/**
 * Shared formatting utilities used across pages.
 * Eliminates duplicated formatCurrency/formatDate/formatDateTime functions.
 */

export const formatCurrency = (value: any, currencyCode: string = 'USD') => {
  const supported = ['USD', 'ZWL', 'ZAR', 'EUR', 'GBP'];
  const code = supported.includes(currencyCode) ? currencyCode : 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
};

export const formatAmount = (value: any) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  }).format(value || 0);
};

export const formatDateTime = (dateString: any) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (dateString: any) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateLong = (dateString: any) => {
  if (!dateString) return 'N/A';
  const options: any = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

/** "Mar 27, 2026" — used across vendor pages and scheduled orders */
export const formatDateShort = (dateString: any): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** "Thursday, March 27, 2026" — used in order confirmation screens */
export const formatDateFull = (dateString: any): string => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};
