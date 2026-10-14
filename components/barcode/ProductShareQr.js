"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { buildDigitalLink } from "@/lib/gs1";
import { renderBarcodeDataUrl } from "@/lib/barcode";

/**
 * @param {{ gtin: string, productName: string, className?: string }} props
 */
export default function ProductShareQr({ gtin, productName, className = "" }) {
  const [barcodeUrl, setBarcodeUrl] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const link = buildDigitalLink(gtin);

  useEffect(() => {
    let ignore = false;
    renderBarcodeDataUrl(gtin)
      .then((url) => {
        if (!ignore) {
          setBarcodeUrl(url);
        }
      })
      .catch(() => {
        if (!ignore) {
          setBarcodeUrl(null);
        }
      });
    QRCode.toDataURL(link, { width: 160, margin: 1, color: { dark: "#2b2422" } })
      .then((url) => {
        if (!ignore) {
          setQrUrl(url);
        }
      })
      .catch(() => {
        if (!ignore) {
          setQrUrl(null);
        }
      });
    return () => {
      ignore = true;
    };
  }, [gtin, link]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const downloadImage = (dataUrl, filename) => {
    if (!dataUrl) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = filename;
    anchor.click();
  };

  return (
    <div className={className}>
      <div className="rounded-2xl bg-stone-50 px-4 py-5">
        {barcodeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- generated data URL
          <img
            src={barcodeUrl}
            alt={`Barcode for ${productName}`}
            className="mx-auto h-auto w-full max-w-[280px]"
          />
        ) : (
          <p className="py-8 text-center text-sm text-stone-400">Preparing barcode…</p>
        )}
      </div>
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-stone-100 px-4 py-3">
        {qrUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- generated data URL
          <img
            src={qrUrl}
            alt="Product Digital Link QR code"
            className="h-20 w-20 shrink-0 rounded-lg"
          />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-lg bg-stone-100" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#e24b6a]">
            Phone QR
          </p>
          <p className="mt-1 text-sm leading-5 text-stone-500">
            Opens {productName} in the browser.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="rounded-full bg-[#2b2422] px-3 py-2.5 text-xs font-bold text-white sm:text-sm"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={() => downloadImage(barcodeUrl, `${gtin}-barcode.png`)}
          disabled={!barcodeUrl}
          className="rounded-full border border-stone-200 px-3 py-2.5 text-xs font-bold text-[#2b2422] disabled:opacity-40 sm:text-sm"
        >
          Barcode
        </button>
        <button
          type="button"
          onClick={() => downloadImage(qrUrl, `${gtin}-qr.png`)}
          disabled={!qrUrl}
          className="rounded-full border border-stone-200 px-3 py-2.5 text-xs font-bold text-[#2b2422] disabled:opacity-40 sm:text-sm"
        >
          QR
        </button>
      </div>
    </div>
  );
}
