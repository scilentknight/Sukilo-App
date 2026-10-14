import Link from "next/link";
import { SectionHeading } from "./SectionHeading";
import { categoryHref } from "@/lib/search-params";

/** Category tiles from `/api/v1/products/categories`, most stocked first. */
export function FeaturedCategories({ categories }) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categories-heading">
      <SectionHeading
        title="Shop by category"
        subtitle="Browse our most popular departments"
        href="/product"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.slice(0, 10).map((category) => (
          <Link
            key={category.name}
            href={categoryHref(category.name)}
            className="focus-ring group flex flex-col justify-between rounded-xl border border-ink-200 bg-gradient-to-br from-ink-50 to-white p-4 transition-shadow hover:shadow-md"
          >
            <p className="line-clamp-2 text-sm font-semibold text-ink-900 group-hover:text-brand-700">
              {category.name}
            </p>
            <p className="mt-3 text-xs text-ink-400">
              {category.count} {category.count === 1 ? "product" : "products"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
