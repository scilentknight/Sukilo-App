"use client";

import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/ui/icons";
import { buildProductHref } from "@/lib/search-params";
import { cn } from "@/lib/cn";

/**
 * Category filter. The API filters by one exact category name, so this is a
 * single-select list driven by `/api/v1/products/categories`. The URL stays the
 * single source of truth and results remain shareable.
 */
export function ProductFiltersPanel({ categories, parsed, onNavigate }) {
  const router = useRouter();

  const select = (category) => {
    router.push(buildProductHref({ search: parsed.search, category }), { scroll: false });
    onNavigate?.();
  };

  if (!categories) {
    return <p className="px-2 py-3 text-xs text-ink-400">Categories are unavailable right now.</p>;
  }

  return (
    <section className="py-3">
      <h3 className="mb-2 text-sm font-semibold text-ink-900">Category</h3>
      {categories.length === 0 ? (
        <p className="px-2 text-xs text-ink-400">No categories yet.</p>
      ) : (
        <ul className="max-h-[28rem] space-y-0.5 overflow-y-auto pr-1">
          <FacetOption label="All categories" checked={!parsed.category} onSelect={() => select()} />
          {categories.map((item) => (
            <FacetOption
              key={item.name}
              label={item.name}
              count={item.count}
              checked={parsed.category === item.name}
              onSelect={() => select(parsed.category === item.name ? undefined : item.name)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function FacetOption({ label, count, checked, onSelect }) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={checked}
        className={cn(
          "focus-ring flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
          checked ? "text-brand-700" : "text-ink-600 hover:bg-ink-50",
        )}
      >
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
            checked ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300",
          )}
        >
          {checked ? <CheckIcon className="h-3 w-3" /> : null}
        </span>
        <span className="flex-1 truncate">{label}</span>
        {typeof count === "number" ? <span className="text-xs text-ink-400">{count}</span> : null}
      </button>
    </li>
  );
}
