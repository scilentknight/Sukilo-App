"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent } from "lucide-react";
import { listAdminCountries, listAdminOffers } from "@/lib/admin";
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
import { formatDateTime, formatMoney } from "@/lib/format";

const LIMIT = 25;
const PUBLICATION_OPTIONS = [
  { value: "", label: "All publications" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
];

export default function AdminOffersPage() {
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [publication, setPublication] = useState("");
  const [countries, setCountries] = useState([]);
  const [offset, setOffset] = useState(0);

  const load = useCallback(
    () =>
      listAdminOffers({
        q: query || undefined,
        countryCode: country || undefined,
        publicationStatus: publication || undefined,
        limit: LIMIT,
        offset,
      }),
    [query, country, publication, offset],
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
      header: "Offer",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
            <BadgePercent size={17} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink-900">{row.seller_sku}</p>
            <p className="truncate text-xs text-ink-500">{row.vendor_name}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Product",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-ink-800">
            {row.product_name || "Untitled product"}
          </p>
          <p className="truncate text-xs text-ink-400">{row.store_slug}</p>
        </div>
      ),
    },
    {
      header: "Country",
      cell: (row) =>
        row.country_code ? <Badge tone="indigo">{row.country_code}</Badge> : "—",
    },
    {
      header: "Offer status",
      cell: (row) => <StatusBadge value={row.status} />,
    },
    {
      header: "Publication",
      cell: (row) => <StatusBadge value={row.publication_status} />,
    },
    {
      header: "Price",
      cell: (row) => (
        <span className="font-medium text-ink-900">
          {formatMoney(row.list_price, row.currency_code)}
        </span>
      ),
    },
    {
      header: "Updated",
      cell: (row) => (
        <span className="text-xs text-ink-500">{formatDateTime(row.updated_at)}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Seller offers"
        description="Prices and publication state for every seller offer in each market."
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField
            value={searchText}
            onChange={setSearchText}
            onSubmit={submitSearch}
            placeholder="Search by SKU or seller…"
            className="w-full lg:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-3">
            <SelectField
              value={country}
              onChange={(value) => {
                setCountry(value);
                setOffset(0);
              }}
              options={countryOptions}
            />
            <SelectField
              value={publication}
              onChange={(value) => {
                setPublication(value);
                setOffset(0);
              }}
              options={PUBLICATION_OPTIONS}
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
          rowKey={(row) => row.offer_id}
          loading={loading}
          empty={
            <EmptyState
              title="No offers found"
              description="Seller offers appear here once they price a catalog SKU."
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
