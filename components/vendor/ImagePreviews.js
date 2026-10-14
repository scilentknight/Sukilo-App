"use client";

import { useEffect, useState } from "react";

/**
 * @param {{ images: File[], onRemove: (index: number) => void }} props
 */
export default function ImagePreviews({ images, onRemove }) {
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));
    Promise.resolve().then(() => setPreviews(urls));
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {previews.map((url, index) => (
        <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          <img
            src={url}
            alt={`Product preview ${index + 1}`}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white"
            aria-label={`Remove image ${index + 1}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
