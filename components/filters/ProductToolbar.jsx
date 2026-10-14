"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GridIcon, ListIcon, SlidersIcon, CloseIcon } from "@/components/ui/icons";
import { ProductFiltersPanel } from "@/components/filters/ProductFiltersPanel";
import { buildProductHref } from "@/lib/search-params";
import { useLocale } from "@/context/LocaleContext";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Listing toolbar: result count, view toggle, active filter chips and the
 * mobile filter drawer. Results are always newest first (the API's order).
 */
export function ProductToolbar({ total, parsed, categories, view, onViewChange }) {
  const { t, language } = useLocale();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2.5 sm:px-4">
        <p className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900">{formatNumber(total, language)}</span>{" "}
          {t("results")}
          <span className="text-ink-400"> · Newest first</span>
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersIcon className="h-4 w-4" />
            {t("filters")}
          </Button>

          <div className="hidden items-center rounded-lg border border-ink-200 p-0.5 sm:flex">
            <ViewButton
              label="Grid view"
              active={view === "grid"}
              onClick={() => onViewChange("grid")}
            >
              <GridIcon className="h-4 w-4" />
            </ViewButton>
            <ViewButton
              label="List view"
              active={view === "list"}
              onClick={() => onViewChange("list")}
            >
              <ListIcon className="h-4 w-4" />
            </ViewButton>
          </div>
        </div>
      </div>

      <ActiveFilterChips parsed={parsed} />

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/50"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[90%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <h2 className="text-base font-semibold text-ink-900">{t("filters")}</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <ProductFiltersPanel
                categories={categories}
                parsed={parsed}
                onNavigate={() => setMobileFiltersOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ViewButton({ label, active, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "focus-ring flex h-8 w-8 items-center justify-center rounded-md",
        active ? "bg-ink-100 text-ink-900" : "text-ink-400 hover:text-ink-700",
      )}
    >
      {children}
    </button>
  );
}

/** Removable chips summarising the active search and category. */
function ActiveFilterChips({ parsed }) {
  const router = useRouter();
  const go = (state) => router.push(buildProductHref(state), { scroll: false });

  const chips = [];
  if (parsed.search) {
    chips.push({
      label: `“${parsed.search}”`,
      onRemove: () => go({ category: parsed.category }),
    });
  }
  if (parsed.category) {
    chips.push({ label: parsed.category, onRemove: () => go({ search: parsed.search }) });
  }
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1 rounded-full bg-ink-100 py-1 pl-3 pr-1 text-xs text-ink-700"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove filter ${chip.label}`}
            className="focus-ring flex h-5 w-5 items-center justify-center rounded-full hover:bg-ink-200"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => go({})}
        className="focus-ring rounded-full px-2 text-xs font-medium text-brand-700 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
