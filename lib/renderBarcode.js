/**
 * Build a retail-style linear barcode PNG for a GTIN.
 *
 * @param {string} gtin
 * @returns {Promise<string>}
 */
export async function renderBarcodeDataUrl(gtin) {
  const JsBarcode = (await import("jsbarcode")).default;
  const canvas = document.createElement("canvas");
  const digits = String(gtin).replace(/\D/g, "");
  const format = digits.length === 13 ? "EAN13" : "CODE128";
  JsBarcode(canvas, digits, {
    format,
    displayValue: true,
    fontSize: 14,
    fontOptions: "bold",
    height: 72,
    margin: 10,
    background: "#fafaf9",
    lineColor: "#2b2422",
  });
  return canvas.toDataURL("image/png");
}
