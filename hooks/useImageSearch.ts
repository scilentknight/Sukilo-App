"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchByImage } from "@/lib/api/search";
import { FeatureUnavailableError } from "@/lib/api/search";
import type { ProductListItem } from "@/lib/api/types";

/**
 * Image-search UI state machine. Handles file selection, client-side
 * validation, preview generation and submission to the `searchByImage`
 * service. Because the backend has no image-search endpoint yet, a successful
 * "search" will currently surface {@link FeatureUnavailableError}; the UI
 * renders that honestly rather than faking matches.
 */

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export type ImageSearchStatus = "idle" | "ready" | "searching" | "success" | "unavailable" | "error";

export interface UseImageSearchResult {
  status: ImageSearchStatus;
  previewUrl: string | null;
  fileName: string | null;
  error: string | null;
  results: ProductListItem[];
  selectFile: (file: File) => void;
  clear: () => void;
  search: () => Promise<void>;
}

export function useImageSearch(): UseImageSearchResult {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ImageSearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProductListItem[]>([]);
  const objectUrlRef = useRef<string | null>(null);

  const revoke = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => revoke, [revoke]);

  const selectFile = useCallback(
    (next: File) => {
      if (!ALLOWED_TYPES.includes(next.type as (typeof ALLOWED_TYPES)[number])) {
        setStatus("error");
        setError("Unsupported file type. Please choose a JPG, JPEG, PNG or WEBP image.");
        return;
      }
      if (next.size > MAX_BYTES) {
        setStatus("error");
        setError("Image is too large. Please choose a file under 8MB.");
        return;
      }
      revoke();
      const url = URL.createObjectURL(next);
      objectUrlRef.current = url;
      setFile(next);
      setPreviewUrl(url);
      setResults([]);
      setError(null);
      setStatus("ready");
    },
    [revoke],
  );

  const clear = useCallback(() => {
    revoke();
    setFile(null);
    setPreviewUrl(null);
    setResults([]);
    setError(null);
    setStatus("idle");
  }, [revoke]);

  const search = useCallback(async () => {
    if (!file) return;
    setStatus("searching");
    setError(null);
    try {
      const page = await searchByImage(file);
      setResults(page.items);
      setStatus("success");
    } catch (err) {
      if (err instanceof FeatureUnavailableError) {
        setStatus("unavailable");
        setError(err.message);
        return;
      }
      setStatus("error");
      setError("Image search failed. Please try again.");
    }
  }, [file]);

  return { status, previewUrl, fileName: file?.name ?? null, error, results, selectFile, clear, search };
}
