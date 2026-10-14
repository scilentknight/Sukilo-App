"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Barcode scanning via the device camera using @zxing/browser (a maintained,
 * framework-agnostic port of the ZXing library). The library is imported
 * dynamically so it never enters the initial bundle.
 *
 * The scanned code is surfaced to the caller, which then calls the
 * `searchByBarcode` service abstraction.
 */

export function useBarcodeScanner(options = {}) {
  const { onDetected } = options;
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  // ZXing's controls object; typed loosely because it is loaded dynamically.
  const controlsRef = useRef(null);
  const detectedRef = useRef(onDetected);

  useEffect(() => {
    detectedRef.current = onDetected;
  }, [onDetected]);

  const supported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia;

  const stop = useCallback(() => {
    try {
      controlsRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    controlsRef.current = null;
    // Ensure any lingering camera tracks are released.
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (!supported) {
      setStatus("unsupported");
      setError("Camera/barcode scanning is not supported on this device.");
      return;
    }
    if (!videoRef.current) {
      setStatus("error");
      setError("Scanner view is not ready yet.");
      return;
    }

    setError(null);
    setStatus("starting");

    try {
      const [browser, library] = await Promise.all([
        import("@zxing/browser"),
        import("@zxing/library"),
      ]);
      const reader = new browser.BrowserMultiFormatReader(
        library.DecodeHintType ? new Map([[library.DecodeHintType.TRY_HARDER, true]]) : undefined,
      );

      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result) {
          const code = result.getText();
          detectedRef.current?.(code);
          // Stop after the first successful detection.
          stop();
        }
      });
      controlsRef.current = controls;
      setStatus("scanning");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
        setError("Camera permission denied. Allow camera access and try again.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setStatus("error");
        setError("No usable camera was found on this device.");
      } else {
        setStatus("error");
        setError("Unable to start the barcode scanner. You can enter the code manually.");
      }
    }
  }, [supported, stop]);

  useEffect(() => stop, [stop]);

  return { supported, status, error, videoRef, start, stop };
}
