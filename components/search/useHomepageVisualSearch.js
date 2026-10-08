"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchProductsByImage } from "@/lib/api";
import { filterStrongVisualMatches } from "@/lib/visualMatch";
import { takeVisualSearchFile } from "@/lib/visualSearchSession";

const SEARCH_LIMIT = 20;

export function useHomepageVisualSearch() {
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

  const searchFile = useCallback(async (file) => {
    if (!file?.type?.startsWith("image/")) {
      setErrorMessage("Please choose an image file.");
      setStatus("error");
      return;
    }
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
    const generation = ++searchGeneration.current;
    setStatus("searching");
    setErrorMessage(null);
    setResults([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const data = await searchProductsByImage(file, { limit: SEARCH_LIMIT });
      if (generation !== searchGeneration.current) {
        return;
      }
      const items = filterStrongVisualMatches(data?.results ?? []);
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

  const clearSearch = useCallback(() => {
    searchGeneration.current += 1;
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setResults([]);
    setErrorMessage(null);
    setStatus("idle");
  }, []);

  useEffect(() => {
    const pending = takeVisualSearchFile();
    if (!pending) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      searchFile(pending);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [searchFile]);

  return {
    status,
    previewUrl,
    results,
    errorMessage,
    searchFile,
    clearSearch,
    isActive: status !== "idle",
  };
}
