import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui";

/** Renders a responsive product grid with loading skeletons. */
export default function ProductGrid({ products, isLoading, columns = 4 }) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  }[columns] ?? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  if (isLoading) {
    return (
      <div className={`grid ${colClass} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-ink-100">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-20 mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) return null;

  return (
    <div className={`grid ${colClass} gap-4`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

