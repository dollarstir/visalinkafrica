/**
 * Format price with cedi sign
 * @param {string|number} price - The price value (can be string or number)
 * @returns {string} Formatted price with cedi sign
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '₵0.00';
  
  // Convert to string and remove any existing currency symbols
  let priceStr = price.toString().trim();
  
  // Remove currency symbols and letters, keep only numbers and decimal point
  priceStr = priceStr.replace(/[^0-9.]/g, '');
  
  // Parse as float
  const priceNum = parseFloat(priceStr);
  
  if (isNaN(priceNum)) return '₵0.00';
  
  // Format with 2 decimal places and add cedi sign
  return `₵${priceNum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Clean price input - remove currency symbols and return numeric string
 * @param {string} priceInput - The price input from user
 * @returns {string} Clean numeric string
 */
export const cleanPriceInput = (priceInput) => {
  if (!priceInput) return '';
  
  // Remove currency symbols, letters, and keep only numbers and decimal point
  return priceInput.toString().replace(/[^0-9.]/g, '');
};

