"use client";

import Link from "next/link";
import { Dropdown } from "@/components/ui/Dropdown";
import { ChevronRightIcon, GridIcon } from "@/components/ui/icons";
import { useLocale } from "@/context/LocaleContext";
import { categoryHref } from "@/lib/search-params";

/**
 * Desktop category menu. Uses the shared accessible Dropdown so outside
 * click / Escape handling is consistent with the other header menus.
 */
export function CategoryMegaMenu({ categories }) {
  const { t } = useLocale();

  return (
    <Dropdown
      ariaLabel={t("all_categories")}
      icon={<GridIcon className="h-4 w-4" />}
      label={t("all_categories")}
      triggerClassName="bg-brand-600 text-white hover:bg-brand-700 hover:text-white"
      panelClassName="w-[min(48rem,90vw)] p-4"
    >
      {() =>
        categories.length === 0 ? (
          <p className="px-1 text-sm text-ink-500">Categories are unavailable right now.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-3">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  href={categoryHref(category.name)}
                  className="focus-ring flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-50 hover:text-brand-700"
                >
                  <span className="truncate">{category.name}</span>
                  <span className="flex items-center gap-1 text-xs text-ink-400">
                    {category.count}
                    <ChevronRightIcon className="h-3.5 w-3.5 text-ink-300" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )
      }
    </Dropdown>
  );
}
