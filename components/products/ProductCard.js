import { formatProductPrice, formatVisualMatch } from "@/lib/format";
import { getApiBaseUrl } from "@/lib/api";

/**
 * @param {{ product: { product_id: number, name: string, brand?: string | null, category: string, price: string | number, currency: string, image_url: string, similarity: number } }} props
 */
export default function ProductCard({ product }) {
  const imageSrc = product.image_url.startsWith("http")
    ? product.image_url
    : `${getApiBaseUrl()}${product.image_url}`;
  const matchLabel = formatVisualMatch(product.similarity);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-sm border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full bg-gray-100">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <span
          className="absolute left-2 top-2 rounded-sm bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#ff3f6c] shadow-sm"
        >
          {matchLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        {product.brand ? (
          <p className="truncate text-xs font-bold uppercase tracking-wide text-gray-500">
            {product.brand}
          </p>
        ) : (
          <p className="truncate text-xs font-bold uppercase tracking-wide text-gray-400">
            {product.category}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
          {product.name}
        </h3>
        <p className="mt-1 text-base font-extrabold text-gray-900">
          {formatProductPrice(product.price, product.currency)}
        </p>
      </div>
    </article>
  );
}
