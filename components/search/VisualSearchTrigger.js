"use client";

import { useRef } from "react";
import { prefersCameraCapture } from "@/lib/visualSearchSession";

/**
 * @param {{
 *   onSelect: (file: File) => void,
 *   disabled?: boolean,
 *   className?: string,
 *   children: import("react").ReactNode,
 *   ariaLabel?: string,
 * }} props
 */
export default function VisualSearchTrigger({
  onSelect,
  disabled = false,
  className,
  children,
  ariaLabel = "Search by photo",
}) {
  const inputRef = useRef(null);

  const applyCaptureMode = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    if (prefersCameraCapture()) {
      input.setAttribute("capture", "environment");
    } else {
      input.removeAttribute("capture");
    }
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect(file);
    }
    event.target.value = "";
  };

  return (
    <label
      className={`relative z-20 inline-flex cursor-pointer items-center justify-center ${className ?? ""}`}
      onPointerDown={applyCaptureMode}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={handleChange}
        aria-label={ariaLabel}
        className="absolute inset-0 z-30 cursor-pointer opacity-0"
      />
      {children}
    </label>
  );
}
