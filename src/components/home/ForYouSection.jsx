import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkle } from "lucide-react";
import { listProducts } from "@/services/product.service";
const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

function normalizeProduct(raw) {
  const price = Number(pick(raw.price, raw.sellingPrice, raw.salePrice, 0));
  const oldPrice = Number(
    pick(raw.oldPrice, raw.originalPrice, raw.compareAtPrice, raw.mrp, 0),
  );

  let discount = Number(
    pick(raw.discount, raw.discountPercent, raw.discountPercentage, 0),
  );
  if (!discount && oldPrice > price && price > 0) {
    discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  // images: [{ image_url, is_primary }] -> use the primary one, else the first
  const imgs = Array.isArray(raw.images) ? raw.images : [];
  const primary = imgs.find((i) => i?.is_primary) ?? imgs[0];
  const img = pick(
    primary?.image_url,
    primary?.url,
    primary,
    raw.image_url,
    raw.image,
    raw.thumbnail,
  );
  const stockQty = pick(raw.stock, raw.quantity, raw.stockQuantity);

  return {
    id: pick(raw.id, raw._id),
    brand: pick(raw.brand?.name, raw.brand),
    name: pick(raw.name, raw.title, ""),
    price,
    oldPrice: oldPrice > price ? oldPrice : 0,
    discount,
    category: pick(raw.category?.name, raw.category, ""),
    inStock: pick(
      raw.inStock,
      raw.in_stock,
      stockQty !== undefined ? Number(stockQty) > 0 : true,
    ),
    image: typeof img === "string" ? img : "",
    currency: raw.currency,
  };
}

function extractList(res) {
  if (Array.isArray(res)) return res;
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  return d?.products ?? d?.items ?? d?.results ?? [];
}

const SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
const money = (n, currency) => {
  const value = Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  if (!currency || currency === "NPR") return `Rs. ${value}`;
  return `${SYMBOLS[currency] ?? currency + " "}${value}`;
};

/* ------------------------------ Card ------------------------------ */
function ProductCard({ p }) {
  return (
    <a
      href={`/products/${p.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow duration-200 "
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-gray-100">
        {p.image && (
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {p.discount > 0 && (
          <span className="absolute left-[9px] top-[9px] rounded bg-[#bf3a0c] px-2 py-[5px] text-[15px] font-semibold leading-none text-white">
            -{p.discount}%
          </span>
        )}
        <Sparkle
          size={14}
          className="absolute bottom-2 right-2 fill-white/70 text-white/70"
        />
      </div>

      <div className="flex flex-1 flex-col px-[15px] pb-[14px] pt-[14px]">
        {p.brand && (
          <div className="mb-[3px] text-[15px] leading-5 text-gray-500">
            {p.brand}
          </div>
        )}

        <h3 className="line-clamp-2 text-[17px] font-medium leading-[23px] text-gray-900 transition-colors group-hover:text-[#6b2d8f]">
          {p.name}
        </h3>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold leading-7 text-gray-900">
              {money(p.price, p.currency)}
            </span>
            {p.oldPrice > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {money(p.oldPrice, p.currency)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 text-[15px] text-gray-500">
            <span className="truncate">{p.category}</span>
            <span
              className={`flex shrink-0 items-center gap-1 whitespace-nowrap ${p.inStock ? "text-green-600" : "text-red-600"}`}
            >
              <span
                className={`h-[7px] w-[7px] rounded-full ${p.inStock ? "bg-green-500" : "bg-red-500"}`}
              />
              {p.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-square bg-gray-200" />
      <div className="space-y-3 p-[15px]">
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-5 w-full rounded bg-gray-200" />
        <div className="h-5 w-2/3 rounded bg-gray-200" />
        <div className="h-6 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
      </div>
    </div>
  );
}

/* ----------------------------- Section ----------------------------- */
const INITIAL_COUNT = 8;
const LOAD_MORE_COUNT = 4;

// Fallback pagination params. If the API returns a `next` URL, its query string is used instead.
const buildParams = ({ offset, limit }) => ({ limit, offset });

const paramsFromNext = (next) => {
  try {
    return Object.fromEntries(new URL(next, "http://x").searchParams);
  } catch {
    return null;
  }
};

export default function ForYouSection({ viewAllHref = "/products" }) {
  const [items, setItems] = useState([]); // everything fetched so far
  const [shown, setShown] = useState(INITIAL_COUNT); // how many cards are visible
  const [serverMore, setServerMore] = useState(false); // backend may have more
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const nextParams = useRef(null);

  // Fetch one batch; returns { fresh, more } and merges into `items`
  async function fetchBatch(known, limit) {
    const params =
      nextParams.current ?? buildParams({ offset: known.length, limit });
    const res = await listProducts(params);
    const list = extractList(res).map(normalizeProduct);
    const d = res?.data && !Array.isArray(res.data) ? res.data : res;

    const seen = new Set(known.map((p) => p.id));
    const fresh = list.filter((p) => !seen.has(p.id));
    const total = known.length + fresh.length;

    nextParams.current = d?.next ? paramsFromNext(d.next) : null;

    let more;
    if (fresh.length === 0)
      more = false; // API gave nothing new -> stop
    else if (typeof d?.count === "number") more = total < d.count;
    else if (d?.next !== undefined) more = Boolean(d.next);
    else more = list.length >= limit;

    return { fresh, more };
  }

  // Page load: first 8
  useEffect(() => {
    let cancelled = false;
    fetchBatch([], INITIAL_COUNT)
      .then(({ fresh, more }) => {
        if (cancelled) return;
        setItems(fresh);
        setServerMore(more);
        setStatus("success");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click: reveal 4 more (from what's already fetched, or fetch from the server)
  async function handleLoadMore() {
    if (loadingMore) return;
    setMoreError(false);

    const target = shown + LOAD_MORE_COUNT;
    if (items.length >= target || !serverMore) {
      setShown(target);
      return;
    }

    setLoadingMore(true);
    try {
      const { fresh, more } = await fetchBatch(items, LOAD_MORE_COUNT);
      setItems((prev) => [...prev, ...fresh]);
      setServerMore(more);
      setShown(target);
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  const visible = items.slice(0, shown);
  const hasMore = shown < items.length || serverMore;

  return (
    <section className="bg-[#f8f9fc] px-6 py-8 font-sans">
      <div className="mx-auto max-w-[1650px]">
        <div className="mb-9 flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-bold leading-tight text-gray-900">
              For You
            </h2>
            <p className="mt-1 text-xl text-gray-600">
              Products picked just for you
            </p>
          </div>
          <a
            href={viewAllHref}
            className="mt-3 flex items-center gap-2 text-lg font-medium text-[#6b2d8f] hover:underline"
          >
            View All <ArrowRight size={18} />
          </a>
        </div>

        {status === "error" && (
          <p className="py-10 text-center text-gray-600">
            Couldn't load products. Please refresh and try again.
          </p>
        )}
        {status === "success" && items.length === 0 && (
          <p className="py-10 text-center text-gray-600">
            No products to show right now.
          </p>
        )}

        {status === "loading" && (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: INITIAL_COUNT }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {status === "success" && items.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {visible.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
              {loadingMore &&
                Array.from({ length: LOAD_MORE_COUNT }).map((_, i) => (
                  <SkeletonCard key={`s${i}`} />
                ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-lg border border-[#6b2d8f] bg-white px-8 py-3 text-base font-medium text-[#6b2d8f] transition-colors hover:bg-[#6b2d8f] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b2d8f] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:hover:text-[#6b2d8f]"
                >
                  {loadingMore ? "Loading..." : "Load More Products"}
                </button>
                {moreError && (
                  <p className="text-sm text-red-600">
                    Couldn't load more products. Please try again.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
