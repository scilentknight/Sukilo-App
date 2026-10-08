import Link from "next/link";
import { formatProductPrice } from "@/lib/format";
import { getProductImageUrl } from "@/lib/catalog";

/**
 * @param {{ product: Record<string, unknown> }} props
 */
export default function CatalogProductCard({ product }) {
  const imageSrc = getProductImageUrl(product);
  const href = `/products/${product.id}`;
  const label = product.brand ? String(product.brand) : String(product.category);

  return (
    <article className="group">
      <Link
        href={href}
        className="block overflow-hidden rounded-[1.6rem] bg-white shadow-sm ring-1 ring-rose-100 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-rose-200/60"
      >
        <div className="aspect-[3/4] overflow-hidden bg-[#f6ebe6]">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={String(product.name)}
              className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">
              No image
            </div>
          )}
        </div>
        <div className="px-3.5 pb-4 pt-3">
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-[#e24b6a]">
            {label}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-[2.6rem] text-sm font-bold leading-snug text-[#2b2422]">
            {String(product.name)}
          </h3>
          <p className="mt-2 text-base font-extrabold text-[#2b2422]">
            {formatProductPrice(product.price, product.currency)}
          </p>
        </div>
      </Link>
    </article>
  );
}
