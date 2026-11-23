import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProductGrid from "@/components/products/ProductGrid";
import { Alert } from "@/components/ui";

export default function FeaturedProducts({
  products = [],
  loading = false,
  error = null,
}) {
  return (
    <section className="container-page pb-14 sm:pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Handpicked for you
          </p>

          <h2 className="mt-2 text-2xl font-bold text-ink-900">
            Explore our collection
          </h2>
        </div>

        <Link
          href="/products"
          className="flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      <ProductGrid products={products} isLoading={loading} columns={4} />
    </section>
  );
}
