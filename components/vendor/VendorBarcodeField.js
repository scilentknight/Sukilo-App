"use client";

import { useState } from "react";
import ImageUploader from "@/components/search/ImageUploader";
import CameraCapture from "@/components/search/CameraCapture";
import { decodeBarcodeFromFile } from "@/lib/decodeBarcode";

const INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-[#2b2422] outline-none transition focus:border-[#e24b6a] focus:ring-2 focus:ring-rose-100";

/**
 * @param {{
 *   value: string,
 *   onChange: (event: import("react").ChangeEvent<HTMLInputElement>) => void,
 *   onBarcode: (code: string) => void,
 * }} props
 */
export default function VendorBarcodeField({ value, onChange, onBarcode }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const readPhoto = async (file) => {
    setStatus("reading");
    setError(null);
    try {
      const code = await decodeBarcodeFromFile(file);
      onBarcode(code);
      setStatus("idle");
    } catch (err) {
      setError(err.message || "No barcode found in this image.");
      setStatus("error");
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-800">
        Barcode (UPC, EAN, or GTIN)
        <input
          name="gtin"
          value={value}
          onChange={onChange}
          inputMode="numeric"
          placeholder="Optional. Upload a barcode photo or type the digits."
          className={INPUT_CLASS}
        />
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <ImageUploader onSelect={readPhoto} disabled={status === "reading"} />
        <CameraCapture onSelect={readPhoto} disabled={status === "reading"} />
      </div>
      {status === "reading" && (
        <p className="mt-2 text-sm font-semibold text-[#e24b6a]">Reading barcode…</p>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
