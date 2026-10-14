import { Suspense } from "react";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts, LATEST_PRODUCTS_QUERY } from "@/components/home/FeaturedProducts";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { TrustBenefits } from "@/components/home/TrustBenefits";
import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { listCategories, listProducts } from "@/lib/products";
import { ArrowRightIcon } from "@/components/ui/icons";

// Catalog data changes frequently; revalidate the shell every few minutes.
export const revalidate = 300;

export default async function HomePage() {
  const [categories, latest] = await Promise.all([
    safe(() => listCategories({ next: { revalidate: 300 } }), []),
    safe(
      () => listProducts(LATEST_PRODUCTS_QUERY, { next: { revalidate: 300 } }).then((r) => r.items),
      [],
    ),
  ]);

  return (
    <div className="container-page space-y-12 py-6 sm:py-8">
      <Hero products={latest} />

      <FeaturedCategories categories={categories} />

      <Suspense fallback={<SectionSkeleton title="New arrivals" />}>
        <FeaturedProducts />
      </Suspense>

      <TrustBenefits />

      <Suspense fallback={null}>
        <RecentlyViewed />
      </Suspense>

      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Ready to explore the marketplace?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-brand-100">
          Browse every product, or find one instantly with a photo or a barcode.
        </p>
        <Link
          href="/product"
          className="focus-ring mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Shop all products
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function SectionSkeleton({ title }) {
  return (
    <section>
      <SectionHeading title={title} />
      <ProductGridSkeleton count={8} />
    </section>
  );
}

/** Awaits `fn`, returning `fallback` if it throws (keeps the page resilient). */
async function safe(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
