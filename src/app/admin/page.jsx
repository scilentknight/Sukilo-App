"use client";

import { useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  ClipboardCheck,
  Globe2,
  PackageSearch,
  Store,
  Tags,
  Users,
} from "lucide-react";
import { getAdminOverview, listAdminCountries } from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorNote,
  LinkButton,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/admin/ui";
import { Skeleton } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default function AdminDashboardPage() {
  const load = useCallback(
    () =>
      Promise.all([getAdminOverview(), listAdminCountries()]).then(
        ([overviewData, countryData]) => ({
          overview: overviewData,
          countries: countryData,
        }),
      ),
    [],
  );
  const { data, loading, error, refresh } = useAdminQuery(load);
  const overview = data?.overview;
  const countries = data?.countries ?? [];

  return (
    <div>
      <PageHeader
        title="Marketplace overview"
        description="Customers, sellers, and catalog activity across every market."
        actions={<LinkButton href="/admin/applications">Review queue</LinkButton>}
      />

      {error && (
        <div className="mb-6">
          <ErrorNote message={error} onRetry={() => refresh(true)} />
        </div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        overview && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Customers"
                value={overview.customers.total}
                hint={`${overview.customers.active} active · ${overview.customers.pending} pending`}
                icon={Users}
              />
              <StatCard
                label="Vendors"
                value={overview.vendors.total}
                hint={`${overview.vendors.active} active`}
                icon={Store}
                tone="emerald"
              />
              <StatCard
                label="Applications"
                value={overview.applications.total}
                hint={`${overview.applications.pending} awaiting review`}
                icon={ClipboardCheck}
                tone="amber"
              />
              <StatCard
                label="Catalog products"
                value={overview.catalog_products.total}
                hint={`${overview.catalog_products.active} active`}
                icon={PackageSearch}
                tone="sky"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SmallMetric label="Categories" value={overview.categories} icon={Tags} />
              <SmallMetric label="Brands" value={overview.brands} icon={BadgeCheck} />
              <SmallMetric label="Offers" value={overview.offers} icon={BadgePercent} />
              <SmallMetric
                label="Published offers"
                value={overview.published_offers}
                icon={Globe2}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader
                  title="Pending applications"
                  description="Seller country applications waiting for a decision."
                  action={
                    <Link
                      href="/admin/applications"
                      className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      View all
                      <ArrowRight size={14} />
                    </Link>
                  }
                />
                {overview.pending_applications.length === 0 ? (
                  <EmptyState
                    title="Nothing waiting"
                    description="Every seller application has been reviewed."
                  />
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {overview.pending_applications.slice(0, 6).map((item) => (
                      <li
                        key={item.vendor_country_id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink-800">
                            {item.display_name}
                          </p>
                          <p className="truncate text-xs text-ink-500">
                            {item.legal_name} · {formatDate(item.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.country_code && <Badge tone="indigo">{item.country_code}</Badge>}
                          <StatusBadge value={item.onboarding_status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card>
                <CardHeader
                  title="Market coverage"
                  description="Data recorded per country."
                />
                {countries.length === 0 ? (
                  <EmptyState
                    title="No market data"
                    description="Countries appear here once sellers or catalog records use them."
                  />
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {countries.slice(0, 8).map((country) => (
                      <li key={country.country_id} className="px-5 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-ink-800">
                            {country.code}
                          </span>
                          <span className="text-xs text-ink-500">
                            {country.applications} applications
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-500">
                          {country.enabled_categories} categories · {country.published_offers}{" "}
                          published offers
                        </p>
                        {country.pending_applications > 0 && (
                          <p className="mt-1 text-xs font-medium text-amber-600">
                            {country.pending_applications} awaiting review
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function SmallMetric({ label, value, icon: Icon }) {
  return (
    <Card className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        <p className="mt-1 text-xl font-semibold text-ink-900">{value}</p>
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-50 text-ink-400">
        <Icon size={18} />
      </span>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
