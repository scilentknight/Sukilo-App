import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";

/**
 * @param {{ results: Array<Record<string, unknown>>, countLabel?: string }} props
 */
export default function SearchResults({ results, countLabel }) {
  if (!results.length) {
    return null;
  }

  return (
    <section>
      <p className="mb-4 text-sm font-semibold text-stone-500">
        {countLabel ?? `${results.length} items ranked by visual match`}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {results.map((product) => (
          <Link
            key={product.product_id}
            href={`/products/${product.product_id}`}
            className="block"
          >
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </section>
  );
}
