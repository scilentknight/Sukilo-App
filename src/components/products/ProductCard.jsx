import Link from "next/link";
import Image from "next/image";
import { resolveAssetUrl } from "@/lib/api";

/** Single product card for grids. */
export default function ProductCard({ product }) {
  const primaryImage =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const imgSrc = primaryImage
    ? resolveAssetUrl(primaryImage.image_url)
    : null;

  const price =
    typeof product.price === "number"
      ? product.price.toFixed(2)
      : parseFloat(product.price || 0).toFixed(2);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-white rounded-xl border border-ink-100 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-ink-50 overflow-hidden">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={imgSrc.startsWith("http")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {product.brand && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-0.5 rounded-full text-ink-600 border border-ink-100">
            {product.brand}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-ink-400 uppercase tracking-wide truncate">
          {product.category}
        </p>
        <h3 className="text-sm font-medium text-ink-800 line-clamp-2 leading-snug group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          <span className="text-base font-bold text-ink-900">
            {product.currency} {price}
          </span>
        </div>
      </div>
    </Link>
  );
}

