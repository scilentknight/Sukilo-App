import { Suspense } from "react";
import MarketplaceHome from "@/components/home/MarketplaceHome";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-gray-600">
          Loading shop…
        </div>
      }
    >
      <MarketplaceHome />
    </Suspense>
  );
}
