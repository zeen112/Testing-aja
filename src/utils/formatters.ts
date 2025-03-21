
/**
 * Format a number as Indonesian Rupiah
 */
export const formatToRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a date string to localized date
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Convert a price string (possibly with Rupiah formatting) to a number
 */
export const parseRupiahToNumber = (rupiahString: string): number => {
  // Remove currency symbol, dots (thousand separators) and replace commas with dots for decimal
  const normalized = rupiahString
    .replace(/[^\d,]/g, '')  // Remove anything that's not a digit or comma
    .replace(/\./g, '')      // Remove dots (thousand separators in Indonesian format)
    .replace(/,/g, '.');     // Replace commas with dots (for decimal point)
  
  return parseFloat(normalized) || 0;
};
