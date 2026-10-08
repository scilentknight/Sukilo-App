/**
 * Format catalog price for display.
 *
 * @param {string|number} price
 * @param {string} currency
 * @returns {string}
 */
export function formatProductPrice(price, currency) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) {
    return `${currency} ${price}`;
  }
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
  return `${currency} ${formatted}`;
}

/**
 * Format cosine similarity as a visual match percentage.
 *
 * @param {number} similarity
 * @returns {string}
 */
export function formatVisualMatch(similarity) {
  const percent = Math.round(Math.max(0, Math.min(1, similarity)) * 100);
  return `${percent}% visual match`;
}
