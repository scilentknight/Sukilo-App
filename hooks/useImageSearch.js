"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchByImage } from "@/lib/search";

/**
 * Image-search UI state machine: file selection, client-side validation,
 * preview and submission to `POST /api/v1/search/image`. Limits mirror the
 * backend (JPG/PNG/WEBP, `MAX_UPLOAD_MB` = 10 by default).
 */

export const IMAGE_SEARCH_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

export function useImageSearch() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const objectUrlRef = useRef(null);

  const revoke = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => revoke, [revoke]);

  const selectFile = useCallback(
    (next) => {
      if (!IMAGE_SEARCH_TYPES.includes(next.type)) {
        setStatus("error");
        setError("Unsupported file type. Please choose a JPG, JPEG, PNG or WEBP image.");
        return;
      }
      if (next.size > MAX_BYTES) {
        setStatus("error");
        setError("Image is too large. Please choose a file under 10 MB.");
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
    if (!file || status === "searching") return;
    setStatus("searching");
    setError(null);
    try {
      setResults(await searchByImage(file));
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Image search failed. Please try again.");
    }
  }, [file, status]);

  return {
    status,
    previewUrl,
    fileName: file?.name ?? null,
    error,
    results,
    selectFile,
    clear,
    search,
  };
}
