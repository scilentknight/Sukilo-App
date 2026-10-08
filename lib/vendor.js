import { isPlausibleBarcode } from "@/lib/gs1";

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Validate vendor product form values before upload.
 *
 * @param {{ name: string, category: string, price: string, currency: string }} values
 * @param {File[]} images
 * @returns {string | null}
 */
export function validateVendorProduct(values, images) {
  if (!values.name.trim() || !values.category.trim()) {
    return "Product name and category are required.";
  }
  if (!values.price || Number(values.price) <= 0) {
    return "Price must be greater than zero.";
  }
  if (values.currency.trim().length !== 3) {
    return "Currency must use a three-letter code.";
  }
  if (images.length < 1 || images.length > MAX_IMAGES) {
    return "Add between 1 and 5 product images.";
  }
  if (images.some((image) => !image.type.startsWith("image/"))) {
    return "Every selected file must be an image.";
  }
  if (images.some((image) => image.size > MAX_IMAGE_BYTES)) {
    return "Each image must be 10 MB or smaller.";
  }
  if (!isPlausibleBarcode(values.gtin ?? "")) {
    return "Barcode must be a 12, 13, or 14 digit UPC, EAN, or GTIN.";
  }
  return null;
}

/**
 * Convert product form values and files to API multipart data.
 *
 * @param {Record<string, string>} values
 * @param {File[]} images
 * @returns {FormData}
 */
export function buildProductFormData(values, images) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    const normalized = value.trim();
    if (normalized) {
      formData.append(key, normalized);
    }
  });
  images.forEach((image) => formData.append("images", image));
  return formData;
}
