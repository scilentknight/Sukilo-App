import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { CATEGORY_ICONS } from "./home.constants";

export default function CategorySection({ categories = [], loading = false }) {
  return (
    <section className="container-page py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Find your favorites
          </p>

          <h2 className="mt-2 text-2xl font-bold text-ink-900">
            Shop by category
          </h2>
        </div>

        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton aspect-square rounded-2xl" />
            ))
          : categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.name] || ShoppingBag;

              return (
                <Link
                  key={category.id || category.name}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-700 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon size={26} strokeWidth={1.7} />
                  </span>

                  <span className="text-sm font-semibold text-ink-800">
                    {category.name}
                  </span>

                  <span className="text-xs text-ink-400">
                    {category.count ?? 0} products
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
