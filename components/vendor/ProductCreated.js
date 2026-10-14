import Link from "next/link";
import ProductShareQr from "@/components/barcode/ProductShareQr";

/**
 * @param {{ product: Record<string, unknown>, onReset: () => void }} props
 */
export default function ProductCreated({ product, onReset }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-sm font-extrabold text-emerald-900">Product added successfully</p>
      <p className="mt-1 text-sm text-emerald-800">
        {String(product.name)} is stored, indexed for visual search, and assigned a
        GS1 Digital Link.
      </p>
      {product.gtin && (
        <ProductShareQr gtin={String(product.gtin)} productName={String(product.name)} />
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/product/${product.id}`}
          className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white"
        >
          View product
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-emerald-300 px-4 py-2 text-sm font-bold text-emerald-900"
        >
          Add another
        </button>
      </div>
    </div>
  );
}
