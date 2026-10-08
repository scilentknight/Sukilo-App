"use client";

import { useRef } from "react";
import Button from "@/components/ui/Button";

/**
 * @param {{ onSelect: (file: File) => void, disabled?: boolean }} props
 */
export default function ImageUploader({ onSelect, disabled = false }) {
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect(file);
    }
    event.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Upload Image
      </Button>
    </>
  );
}
