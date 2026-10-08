import { Suspense } from "react";
import CategoryCatalogPage from "@/components/category/CategoryCatalogPage";

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-stone-500">
          Loading category…
        </div>
      }
    >
      <CategoryCatalogPage />
    </Suspense>
  );
}
