"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { searchByImage } from "@/lib/search";
import { formatMoney, formatVisualMatch } from "@/lib/format";
import CameraCapture from "@/components/search/CameraCapture";
import ImageUploader from "@/components/search/ImageUploader";

const SEARCH_LIMIT = 20;

/**
 * Photo search: pick or capture an image, then show visually similar products
 * from `POST /api/v1/search/image`. Only the latest search updates the UI.
 */
export default function VisualSearchPanel({ compact = false }) {
  const [status, setStatus] = useState("idle");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const searchGeneration = useRef(0);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const runSearch = useCallback(async (file) => {
    const generation = ++searchGeneration.current;
    setStatus("searching");
    setErrorMessage(null);
    setResults([]);
    try {
      const items = await searchByImage(file, { limit: SEARCH_LIMIT });
      if (generation !== searchGeneration.current) {
        return;
      }
      setResults(items);
      setStatus(items.length > 0 ? "success" : "empty");
    } catch (err) {
      if (generation !== searchGeneration.current) {
        return;
      }
      setErrorMessage(err.message || "Search failed. Try again.");
      setStatus("error");
    }
  }, []);

  const handleSelectFile = useCallback(
    (file) => {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please choose an image file.");
        setStatus("error");
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      runSearch(file);
    },
    [runSearch],
  );

  const isSearching = status === "searching";
  const previewMinH = compact ? "min-h-[160px]" : "min-h-[200px]";

  return (
    <div className="space-y-4">
      <div
        className={`flex ${previewMinH} items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img
            src={previewUrl}
            alt="Selected query"
            className={`w-full object-contain ${compact ? "max-h-[200px]" : "max-h-[280px]"}`}
          />
        ) : (
          <div className="px-6 text-center">
            <p className="text-sm font-semibold text-gray-700">Choose a product photo</p>
            <p className="mt-1 text-xs text-gray-500">Clothing, shoes, bags & accessories</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <ImageUploader onSelect={handleSelectFile} disabled={isSearching} />
        <CameraCapture onSelect={handleSelectFile} disabled={isSearching} />
      </div>

      {isSearching && (
        <p
          role="status"
          className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-[#cf3d5c]"
        >
          Finding similar styles…
        </p>
      )}

      {status === "empty" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No strong matches. Try a clearer photo of a single item.
        </p>
      )}

      {status === "error" && errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {errorMessage}
        </p>
      )}

      {status === "success" && results.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <p className="mb-3 text-sm font-bold text-gray-900">
            {results.length} similar {results.length === 1 ? "item" : "items"}
          </p>
          <ul className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
            {results.map((item) => (
              <li key={item.product_id}>
                <Link
                  href={`/product/${item.product_id}`}
                  className="block overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- API-hosted upload
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-gray-100" />
                  )}
                  <div className="p-2">
                    <p className="line-clamp-2 text-xs font-semibold text-gray-900">{item.name}</p>
                    <p className="mt-0.5 text-xs font-bold text-gray-800">
                      {formatMoney(item.price, { currency: item.currency })}
                    </p>
                    <p className="text-[10px] font-semibold text-[#ff3f6c]">
                      {formatVisualMatch(item.similarity)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
