"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MarketplaceHeader from "@/components/layout/MarketplaceHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ImageUploader from "@/components/search/ImageUploader";
import CameraCapture from "@/components/search/CameraCapture";
import { lookupProductFromBarcodeFile } from "@/lib/barcodeSearchSession";
import { startVisualSearchOnHome } from "@/lib/visualSearchSession";

export default function BarcodeSearchPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  const lookupFile = useCallback(
    async (file) => {
      if (!file || inFlight.current) {
        return;
      }
      inFlight.current = true;
      setStatus("searching");
      setError(null);
      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return URL.createObjectURL(file);
      });
      try {
        const product = await lookupProductFromBarcodeFile(file);
        router.push(`/products/${product.id}`);
      } catch (err) {
        setError(err.message || "No matching product.");
        setStatus("error");
        inFlight.current = false;
      }
    },
    [router]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <>
      <MarketplaceHeader
        categories={[]}
        activeCategory={null}
        onCategoryChange={() => router.push("/")}
        searchQuery={searchInput}
        onSearchQueryChange={setSearchInput}
        onSearchSubmit={() => {
          const query = searchInput.trim();
          router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
        }}
        onVisualFileSelect={(file) => startVisualSearchOnHome(router, file)}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2b2422] sm:text-4xl">
            Barcode search
          </h1>
          <p className="mt-2 text-stone-500">
            Upload a barcode photo on desktop, or take one on your phone. Sukilo opens the matching product.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50">
          <div className="flex min-h-[200px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected barcode"
                className="max-h-[280px] w-full object-contain"
              />
            ) : (
              <div className="px-6 text-center">
                <p className="text-sm font-semibold text-gray-700">Drop a barcode photo here</p>
                <p className="mt-1 text-xs text-gray-500">UPC, EAN, or product QR</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <ImageUploader onSelect={lookupFile} disabled={status === "searching"} />
            <CameraCapture onSelect={lookupFile} disabled={status === "searching"} />
          </div>
          {status === "searching" && (
            <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-[#cf3d5c]">
              Reading barcode…
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
