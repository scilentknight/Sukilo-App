/** Tiny className combiner (keeps JSX readable without a dependency). */
export function cn(...values) {
  return values.filter(Boolean).join(" ");
}
