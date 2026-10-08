/**
 * Read a UPC, EAN, or QR value from an uploaded or captured image.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function decodeBarcodeFromFile(file) {
  const { Html5Qrcode } = await import("html5-qrcode");
  const hostId = "sukilo-barcode-file-reader";
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    host.className = "hidden";
    document.body.appendChild(host);
  }
  const scanner = new Html5Qrcode(hostId, { verbose: false });
  try {
    const decoded = await scanner.scanFile(file, false);
    const value = String(decoded || "").trim();
    if (!value) {
      throw new Error("No barcode found in this image.");
    }
    return value;
  } catch (err) {
    if (err instanceof Error && err.message === "No barcode found in this image.") {
      throw err;
    }
    throw new Error("No barcode found in this image. Try a clearer photo of the barcode.");
  } finally {
    try {
      await scanner.clear();
    } catch {
      // Host can be reused for the next lookup.
    }
  }
}
