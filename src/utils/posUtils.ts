
/**
 * POS utility functions
 */

/**
 * Format a number to a currency string without any currency symbol
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Convert a currency string back to a number
 */
export const parseCurrency = (currencyString: string): number => {
  return parseInt(currencyString.replace(/\D/g, ''), 10) || 0;
};

/**
 * Generate a unique transaction ID
 */
export const generateTransactionId = (): string => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `TRX-${timestamp}-${random}`;
};
