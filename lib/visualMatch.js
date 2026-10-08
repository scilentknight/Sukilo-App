/** Minimum cosine similarity shown in photo search results. */
export const MIN_VISUAL_MATCH = 0.5;

/**
 * Keep only products at or above the visual match floor.
 *
 * @param {Array<Record<string, unknown>>} items
 * @param {number} [minSimilarity]
 * @returns {Array<Record<string, unknown>>}
 */
export function filterStrongVisualMatches(items, minSimilarity = MIN_VISUAL_MATCH) {
  return (items ?? []).filter((item) => Number(item.similarity) >= minSimilarity);
}
