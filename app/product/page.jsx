import { Suspense } from "react";
import Link from "next/link";
import { ProductFiltersPanel } from "@/components/filters/ProductFiltersPanel";
import { ResultsView } from "@/components/filters/ResultsView";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { PackageIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { listCategories, listProducts } from "@/lib/products";
import { parseProductParams, toProductQuery } from "@/lib/search-params";

// The listing is entirely searchParams-driven, so it is rendered per request.
// Individual data fetches use short revalidate windows for caching.
export async function generateMetadata({ searchParams }) {
  const descriptor = describeFilters(parseProductParams(await searchParams));
  const title = descriptor ? `${descriptor} — Shop online` : "All products";
  const description = descriptor
    ? `Browse ${descriptor.toLowerCase()} from Sukilo sellers.`
    : "Browse products from Sukilo sellers. Filter by category or search by name and brand.";

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function ProductPage({ searchParams }) {
  const parsed = parseProductParams(await searchParams);
  const query = toProductQuery(parsed);

  const [productsResult, categories] = await Promise.all([
    listProducts(query, { next: { revalidate: 60 } })
      .then((data) => ({ ok: true, data }))
      .catch(() => ({ ok: false, data: null })),
    listCategories({ next: { revalidate: 300 } }).catch(() => null),
  ]);

  const heading = describeFilters(parsed) ?? "All products";

  return (
    <div className="container-page py-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-ink-400">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="focus-ring rounded hover:text-ink-700">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-ink-700" aria-current="page">
            {heading}
          </li>
        </ol>
      </nav>

      <h1 className="sr-only">{heading}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr] xl:grid-cols-[18rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-xl border border-ink-200 bg-white p-4">
            <h2 className="mb-1 text-base font-semibold text-ink-900">Filters</h2>
            <ProductFiltersPanel categories={categories} parsed={parsed} />
          </div>
        </aside>

        <div className="min-w-0">
          {!productsResult.ok ? (
            <ErrorState
              title="Unable to load products"
              message="We couldn't reach the marketplace. Please check your connection and try again."
            />
          ) : productsResult.data.items.length === 0 ? (
            <div className="space-y-4">
              <Suspense fallback={null}>
                <ResultsView
                  products={[]}
                  total={productsResult.data.total}
                  limit={query.limit}
                  parsed={parsed}
                  categories={categories}
                />
              </Suspense>
              <EmptyState
                icon={<PackageIcon className="h-6 w-6" />}
                title="No products found"
                message={
                  parsed.search
                    ? `We couldn't find anything for “${parsed.search}”. Try a different search or category.`
                    : parsed.page > 1
                      ? "There are no more products on this page."
                      : "No products match the selected filters yet."
                }
                action={
                  <ButtonLink href="/product" variant="outline" size="sm">
                    Clear filters
                  </ButtonLink>
                }
              />
            </div>
          ) : (
            <Suspense fallback={<ProductGridSkeleton count={12} />}>
              <ResultsView
                products={productsResult.data.items}
                total={productsResult.data.total}
                limit={productsResult.data.limit}
                parsed={parsed}
                categories={categories}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

/** Human-readable description of the active filters (used for the H1/title). */
function describeFilters({ search, category }) {
  if (search && category) return `“${search}” in ${category}`;
  if (search) return `Search results for “${search}”`;
  if (category) return category;
  return null;
}
