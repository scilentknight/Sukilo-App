import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PromoBanner() {
  return (
    <section className="container-page pb-12">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-700 p-8 text-white sm:flex-row sm:items-center sm:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">
            A little extra for you
          </p>

          <h2 className="mt-3 text-2xl font-black sm:text-3xl">
            Free shipping on orders over NPR 5,000
          </h2>

          <p className="mt-3 max-w-lg text-sm text-brand-100">
            Find your next favorite and enjoy reliable delivery across Nepal.
          </p>
        </div>

        <Link
          href="/products"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-brand-700 transition hover:bg-brand-50"
        >
          Shop now <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
