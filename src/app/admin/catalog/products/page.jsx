"use client";

import { useCallback, useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { listAdminCatalogProducts, listAdminCountries } from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import DataTable from "@/components/admin/DataTable";
import {
  Badge,
  Card,
  EmptyState,
  ErrorNote,
  PageHeader,
  Pagination,
  SearchField,
  SelectField,
  StatusBadge,
} from "@/components/admin/ui";
import { formatDate, statusTone } from "@/lib/format";

const LIMIT = 25;
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "RETIRED", label: "Retired" },
];

export default function AdminCatalogProductsPage() {
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [offset, setOffset] = useState(0);

  const load = useCallback(
    () =>
      listAdminCatalogProducts({
        q: query || undefined,
        status: status || undefined,
        countryCode: country || undefined,
        limit: LIMIT,
        offset,
      }),
    [query, status, country, offset],
  );
  const { data, loading, error, refresh } = useAdminQuery(load);

  useEffect(() => {
    listAdminCountries()
      .then(setCountries)
      .catch(() => {});
  }, []);

  function submitSearch() {
    setOffset(0);
    setQuery(searchText.trim());
  }

  const countryOptions = [
    { value: "", label: "All countries" },
    ...countries.map((item) => ({ value: item.code, label: item.code })),
  ];

  const columns = [
    {
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
            <PackageSearch size={17} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink-900">
              {row.name || "Untitled product"}
            </p>
            <p className="truncate font-mono text-[11px] text-ink-400">{row.product_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      cell: (row) => (
        <div>
          <p className="text-sm text-ink-800">{row.category_name || row.category_code}</p>
          <p className="font-mono text-[11px] text-ink-400">{row.category_code}</p>
        </div>
      ),
    },
    {
      header: "Brand",
      cell: (row) => <span className="text-sm text-ink-700">{row.brand_name}</span>,
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge value={row.status} />,
    },
    {
      header: "SKUs / Offers",
      cell: (row) => (
        <span className="text-xs text-ink-600">
          {row.sku_count} / {row.offer_count}
        </span>
      ),
    },
    {
      header: "Countries",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.countries.slice(0, 3).map((item) => (
            <Badge key={item.country_id} tone={statusTone(item.moderation_status)}>
              {item.country_code || "??"}
            </Badge>
          ))}
          {row.countries.length > 3 && (
            <span className="self-center text-[11px] text-ink-400">
              +{row.countries.length - 3}
            </span>
          )}
          {row.countries.length === 0 && <span className="text-ink-400">—</span>}
        </div>
      ),
    },
    {
      header: "Created",
      cell: (row) => (
        <div>
          <p className="text-xs text-ink-500">{formatDate(row.created_at)}</p>
          <p className="truncate text-[11px] text-ink-400">
            {row.created_by_email_masked || ""}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Catalog products"
        description="Shared products in the normalized catalog, independent of any storefront."
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField
            value={searchText}
            onChange={setSearchText}
            onSubmit={submitSearch}
            placeholder="Search by product name…"
            className="w-full lg:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-3">
            <SelectField
              value={status}
              onChange={(value) => {
                setStatus(value);
                setOffset(0);
              }}
              options={STATUS_OPTIONS}
            />
            <SelectField
              value={country}
              onChange={(value) => {
                setCountry(value);
                setOffset(0);
              }}
              options={countryOptions}
            />
          </div>
        </div>

        {error && (
          <div className="p-4">
            <ErrorNote
              message={error}
              onRetry={() => refresh(true)}
            />
          </div>
        )}

        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          rowKey={(row) => row.product_id}
          loading={loading}
          empty={
            <EmptyState
              title="No catalog products"
              description="Products created by sellers appear here after they submit to the catalog."
            />
          }
        />

        <Pagination
          total={data?.total ?? 0}
          limit={LIMIT}
          offset={offset}
          onChange={setOffset}
        />
      </Card>
    </div>
  );
}
