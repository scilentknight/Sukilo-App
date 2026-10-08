"use client";

import { useRef, useState } from "react";

/**
 * Offer Upload or Take photo, then pass the chosen file to onSelect.
 *
 * @param {{
 *   onSelect: (file: File) => void,
 *   title?: string,
 *   ariaLabel?: string,
 *   disabled?: boolean,
 *   className?: string,
 *   children: import("react").ReactNode,
 * }} props
 */
export default function MediaSourcePicker({
  onSelect,
  title = "Barcode search",
  ariaLabel = "Search by barcode",
  disabled = false,
  className,
  children,
}) {
  const [open, setOpen] = useState(false);
  const uploadRef = useRef(null);
  const cameraRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setOpen(false);
      onSelect(file);
    }
    event.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-source-title"
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-stone-100 px-5 py-4">
              <p id="media-source-title" className="text-base font-extrabold text-[#2b2422]">
                {title}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Upload a saved photo, or take a new one with the camera.
              </p>
            </div>
            <div className="grid gap-2 p-4">
              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className="rounded-2xl bg-[#2b2422] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#e24b6a]"
              >
                Upload image
              </button>
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="rounded-2xl border border-rose-200 px-4 py-3.5 text-sm font-bold text-[#2b2422] hover:bg-rose-50"
              >
                Take photo
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-stone-500 hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
