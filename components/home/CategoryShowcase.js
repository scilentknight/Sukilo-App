import { getProductImageUrl } from "@/lib/catalog";

/**
 * @param {{
 *   categories: Array<{ name: string, count: number }>,
 *   products: Array<Record<string, unknown>>,
 *   onSelect: (category: string) => void,
 * }} props
 */
export default function CategoryShowcase({ categories, products, onSelect }) {
  const featured = categories.slice(0, 6).map((category) => {
    const product = products.find((item) => item.category === category.name);
    return {
      ...category,
      imageUrl: product ? getProductImageUrl(product) : null,
    };
  });

  if (!featured.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-[#e24b6a]">Explore more</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#2b2422] sm:text-3xl">
            Shop by category
          </h2>
        </div>
        <a href="#catalog" className="text-sm font-bold text-[#e24b6a] hover:underline">
          View all products
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {featured.map((category) => (
          <button
            key={category.name}
            type="button"
            onClick={() => onSelect(category.name)}
            className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#2b2422] text-left shadow-lg shadow-gray-200"
          >
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 to-orange-50 text-2xl font-extrabold text-[#e24b6a]">
                {category.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-white">
              <span className="block text-lg font-extrabold">{category.name}</span>
              <span className="mt-0.5 block text-xs font-semibold text-white/75">
                {category.count} products
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold">
                Shop category
                <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
