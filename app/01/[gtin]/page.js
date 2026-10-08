"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductByGtin } from "@/lib/api";

export default function DigitalLinkPage() {
  const params = useParams();
  const router = useRouter();
  const gtin = String(params.gtin ?? "");
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const product = await getProductByGtin(gtin);
        if (!ignore) {
          router.replace(`/products/${product.id}`);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "No product matches this Digital Link.");
        }
      }
    }
    if (gtin) {
      load();
    }
    return () => {
      ignore = true;
    };
  }, [gtin, router]);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-sm font-semibold text-stone-500">
        {error || "Opening product from GS1 Digital Link…"}
      </p>
    </main>
  );
}
