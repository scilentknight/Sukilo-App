"use client";

import ProductShareQr from "@/components/barcode/ProductShareQr";

/**
 * @param {{ gtin: string, productName: string, onClose: () => void }} props
 */
export default function ShareQrDialog({ gtin, productName, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-barcode-title"
        className="w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#e24b6a]">
              Share
            </p>
            <h2 id="share-barcode-title" className="mt-1 text-xl font-extrabold text-[#2b2422]">
              Product barcode
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Linear barcode for scanners. QR for phones.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-bold text-stone-600 hover:bg-stone-200"
          >
            Close
          </button>
        </div>
        <div className="px-5 pb-5 pt-4">
          <ProductShareQr gtin={gtin} productName={productName} />
        </div>
      </div>
    </div>
  );
}
