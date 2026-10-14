/**
 * Reads a UPC, EAN, Code 128 or QR value from an uploaded or captured photo.
 * ZXing is loaded on demand so it never enters the initial bundle.
 */
export async function decodeBarcodeFromFile(file) {
  const [{ BrowserMultiFormatReader }, { DecodeHintType }] = await Promise.all([
    import("@zxing/browser"),
    import("@zxing/library"),
  ]);
  const reader = new BrowserMultiFormatReader(new Map([[DecodeHintType.TRY_HARDER, true]]));
  const url = URL.createObjectURL(file);
  try {
    const value = (await reader.decodeFromImageUrl(url)).getText().trim();
    if (value) return value;
  } catch {
    // ZXing throws NotFoundException when no code is visible; handled below.
  } finally {
    URL.revokeObjectURL(url);
  }
  throw new Error("No barcode found in this image. Try a clearer photo of the barcode.");
}

/** Renders a retail-style linear barcode PNG (data URL) for a GTIN. */
export async function renderBarcodeDataUrl(gtin) {
  const JsBarcode = (await import("jsbarcode")).default;
  const canvas = document.createElement("canvas");
  const digits = String(gtin).replace(/\D/g, "");
  JsBarcode(canvas, digits, {
    format: digits.length === 13 ? "EAN13" : "CODE128",
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
