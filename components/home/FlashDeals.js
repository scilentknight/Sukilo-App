import CatalogProductCard from "@/components/products/CatalogProductCard";

/**
 * @param {{ products: Array<Record<string, unknown>> }} props
 */
export default function FlashDeals({ products }) {
  const deals = products.slice(0, 5);
  if (!deals.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-rose-100">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#e24b6a]">
                Today&apos;s edit
              </p>
              <h2 className="mt-0.5 text-2xl font-extrabold text-[#2b2422]">
                Flash picks
              </h2>
            </div>
            <span className="hidden rounded-full bg-[#2b2422] px-3 py-1.5 text-xs font-bold text-white sm:inline">
              Ends tonight
            </span>
          </div>
          <a href="#catalog" className="text-sm font-bold text-[#e24b6a] hover:underline">
            Shop all
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-5">
          {deals.map((product) => (
            <CatalogProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
