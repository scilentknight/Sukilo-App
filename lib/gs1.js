/**
 * @param {string} raw
 * @returns {boolean}
 */
export function isPlausibleBarcode(raw) {
  if (!raw || !raw.trim()) {
    return true;
  }
  const digits = raw.replace(/\D/g, "");
  return digits.length === 12 || digits.length === 13 || digits.length === 14;
}

/**
 * @param {string} gtin
 * @param {string} [origin]
 * @returns {string}
 */
export function buildDigitalLink(gtin, origin) {
  const base =
    origin ?? (typeof window === "undefined" ? "" : window.location.origin);
  return `${base.replace(/\/$/, "")}/01/${gtin}`;
}
