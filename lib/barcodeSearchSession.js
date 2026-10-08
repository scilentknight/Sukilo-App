import { searchProductByBarcode } from "@/lib/api";
import { decodeBarcodeFromFile } from "@/lib/decodeBarcode";

/**
 * Decode a barcode photo and return the matching catalog product.
 *
 * @param {File} file
 * @returns {Promise<Record<string, unknown>>}
 */
export async function lookupProductFromBarcodeFile(file) {
  const code = await decodeBarcodeFromFile(file);
  return searchProductByBarcode(code);
}

/**
 * Read a barcode photo and open the matching product, same direct flow as photo search.
 *
 * @param {{ push: (href: string) => void }} router
 * @param {File} file
 * @returns {Promise<void>}
 */
export async function startBarcodeSearch(router, file) {
  try {
    const product = await lookupProductFromBarcodeFile(file);
    router.push(`/products/${product.id}`);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No matching product for this barcode.";
    window.alert(message);
  }
}
