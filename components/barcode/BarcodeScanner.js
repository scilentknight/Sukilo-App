"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * @param {{ onScan: (value: string) => void, disabled?: boolean, unavailableMessage?: string }} props
 */
export default function BarcodeScanner({
  onScan,
  disabled = false,
  unavailableMessage = "Camera unavailable. Align a barcode in good light, or enter the code.",
}) {
  const reactId = useId().replace(/:/g, "");
  const hostId = `sukilo-barcode-reader-${reactId}`;
  const onScanRef = useRef(onScan);
  const [cameraMessage, setCameraMessage] = useState("Starting camera…");

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (disabled) {
      return undefined;
    }
    let cancelled = false;
    let scanner;
    let running = false;

    async function stopScanner() {
      if (!scanner) {
        return;
      }
      try {
        if (running) {
          await scanner.stop();
        }
      } catch {
        // Start never completed, or React unmounted during start.
      }
      try {
        await scanner.clear();
      } catch {
        // Host node may already be gone.
      }
      running = false;
    }

    async function startCamera() {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
        "html5-qrcode"
      );
      if (cancelled || !document.getElementById(hostId)) {
        return;
      }
      scanner = new Html5Qrcode(hostId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
        ],
        verbose: false,
      });
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (decodedText) {
              onScanRef.current(decodedText);
            }
          },
          () => {}
        );
        running = true;
        if (cancelled) {
          await stopScanner();
          return;
        }
        setCameraMessage("");
      } catch {
        if (!cancelled) {
          setCameraMessage(unavailableMessage);
        }
      }
    }

    const startPromise = startCamera();
    return () => {
      cancelled = true;
      void startPromise.finally(() => stopScanner());
    };
  }, [disabled, hostId, unavailableMessage]);

  return (
    <div className="relative h-full min-h-full w-full">
      <div
        id={hostId}
        className="h-full min-h-full w-full overflow-hidden bg-black [&_video]:h-full [&_video]:min-h-full [&_video]:w-full [&_video]:object-cover [&_#qr-shaded-region]:hidden"
      />
      {cameraMessage && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black p-6 text-center text-sm text-white/80">
          {cameraMessage}
        </p>
      )}
    </div>
  );
}
