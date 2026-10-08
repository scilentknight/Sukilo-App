"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import BarcodeScanner from "@/components/barcode/BarcodeScanner";
import {
  lookupProductFromBarcodeFile,
  startBarcodeSearch,
} from "@/lib/barcodeSearchSession";
import { searchProductByBarcode } from "@/lib/api";
import { prefersCameraCapture } from "@/lib/visualSearchSession";

/**
 * Mobile: open camera with gallery import. Desktop: open file picker.
 *
 * @param {{
 *   ariaLabel?: string,
 *   disabled?: boolean,
 *   className?: string,
 *   onOpen?: () => void,
 *   children: import("react").ReactNode,
 * }} props
 */
export default function BarcodeCaptureTrigger({
  ariaLabel = "Search by barcode",
  disabled = false,
  className,
  onOpen,
  children,
}) {
  const router = useRouter();
  const uploadRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const busy = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const openPicker = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) {
      return;
    }
    onOpen?.();
    setError(null);
    setStatus("idle");
    busy.current = false;
    if (prefersCameraCapture()) {
      setOpen(true);
      return;
    }
    uploadRef.current?.click();
  };

  const closeCamera = () => {
    setOpen(false);
    setError(null);
    setStatus("idle");
    busy.current = false;
  };

  const openProduct = (product) => {
    closeCamera();
    router.push(`/products/${product.id}`);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy.current) {
      return;
    }
    busy.current = true;
    setStatus("searching");
    setError(null);
    try {
      if (open) {
        const product = await lookupProductFromBarcodeFile(file);
        openProduct(product);
      } else {
        await startBarcodeSearch(router, file);
        busy.current = false;
      }
    } catch (err) {
      setError(err.message || "No matching product.");
      setStatus("error");
      busy.current = false;
    }
  };

  const handleLiveScan = async (code) => {
    if (!code || busy.current) {
      return;
    }
    busy.current = true;
    setStatus("searching");
    setError(null);
    try {
      const product = await searchProductByBarcode(code);
      openProduct(product);
    } catch (err) {
      setError(err.message || "No matching product.");
      setStatus("error");
      busy.current = false;
    }
  };

  const cameraSheet =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex flex-col bg-black text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Scan barcode"
          >
            <div className="absolute inset-0">
              <BarcodeScanner
                onScan={handleLiveScan}
                disabled={status === "searching"}
                unavailableMessage="Camera unavailable. Tap Import below to choose a photo."
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-10">
              <div className="relative h-44 w-full max-w-sm border border-white/35">
                <span className="absolute -left-px -top-px h-6 w-6 border-l-2 border-t-2 border-white" />
                <span className="absolute -right-px -top-px h-6 w-6 border-r-2 border-t-2 border-white" />
                <span className="absolute -bottom-px -left-px h-6 w-6 border-b-2 border-l-2 border-white" />
                <span className="absolute -bottom-px -right-px h-6 w-6 border-b-2 border-r-2 border-white" />
                <span className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-[#e24b6a]/80" />
              </div>
            </div>
            <header className="relative z-10 flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-full bg-black/40 px-3 py-2 text-sm font-bold text-white"
              >
                Cancel
              </button>
              <p className="text-sm font-extrabold tracking-wide">Scan barcode</p>
              <span className="w-16" />
            </header>
            <div className="relative z-10 mt-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
              {status === "searching" && (
                <p className="mb-3 text-center text-sm font-semibold text-white">
                  Opening product…
                </p>
              )}
              {error && (
                <p className="mb-3 rounded-2xl bg-red-950/90 px-4 py-3 text-center text-sm text-red-100">
                  {error}
                </p>
              )}
              <p className="mb-4 text-center text-xs font-semibold text-white/70">
                Align the barcode in the frame
              </p>
              <div className="flex items-center justify-center gap-10">
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  disabled={status === "searching"}
                  className="flex flex-col items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                    <ImportIcon />
                  </span>
                  <span className="text-[11px] font-bold text-white/90">Import</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={className}
        onClick={openPicker}
      >
        {children}
      </button>
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      {cameraSheet}
    </>
  );
}

/**
 * Gallery import glyph for the camera toolbar.
 *
 * @returns {import("react").JSX.Element}
 */
function ImportIcon() {
  return (
    <svg
      className="h-6 w-6 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
