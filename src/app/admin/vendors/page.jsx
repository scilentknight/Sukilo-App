"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Store } from "lucide-react";
import { getAdminVendor, listAdminCountries, listAdminVendors } from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import DataTable from "@/components/admin/DataTable";
import Drawer from "@/components/admin/Drawer";
import {
  Badge,
  Card,
  CountryChips,
  DetailRow,
  EmptyState,
  ErrorNote,
  PageHeader,
  Pagination,
  SearchField,
  SelectField,
  StatusBadge,
} from "@/components/admin/ui";
import { Skeleton } from "@/components/ui";
import { formatDate, humanize } from "@/lib/format";

const LIMIT = 25;
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CLOSED", label: "Closed" },
];

export default function AdminVendorsPage() {
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [offset, setOffset] = useState(0);

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const load = useCallback(
    () =>
      listAdminVendors({
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

  useEffect(() => {
    if (!selected) return undefined;
    let active = true;
    getAdminVendor(selected.vendor_id)
      .then((result) => {
        if (active) setDetail(result);
      })
      .catch((err) => {
        if (active) setDetailError(err.message);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selected]);

  function openVendor(row) {
    setSelected(row);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
  }

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
      header: "Vendor",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
            <Store size={17} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink-900">{row.display_name}</p>
            <p className="truncate text-xs text-ink-500">{row.legal_name}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (row) => <span className="text-xs text-ink-600">{humanize(row.vendor_type)}</span>,
    },
    {
      header: "Owner",
      cell: (row) => (
        <span className="text-xs text-ink-600">{row.owner_email_masked || "—"}</span>
      ),
    },
    {
      header: "Countries",
      cell: (row) => (
        <CountryChips
          codes={row.countries.map((item) => item.country_code).filter(Boolean)}
        />
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge value={row.status} />,
    },
    {
      header: "Created",
      cell: (row) => <span className="text-xs text-ink-500">{formatDate(row.created_at)}</span>,
    },
    {
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <button
          type="button"
          onClick={() => openVendor(row)}
          aria-label={`View ${row.display_name}`}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
        >
          <ChevronRight size={17} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Seller organizations and the countries they trade in."
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField
            value={searchText}
            onChange={setSearchText}
            onSubmit={submitSearch}
            placeholder="Search by vendor name…"
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
            <ErrorNote message={error} onRetry={() => refresh(true)} />
          </div>
        )}

        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          rowKey={(row) => row.vendor_id}
          loading={loading}
          empty={
            <EmptyState
              title="No vendors found"
              description="Try a different search term or filter."
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

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.display_name || "Vendor"}
        subtitle={selected?.legal_name}
      >
        {detailLoading && (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-full" />
            ))}
          </div>
        )}

        {detailError && <ErrorNote message={detailError} />}

        {detail && (
          <div className="space-y-7">
            <section>
              <dl>
                <DetailRow label="Legal name">{detail.legal_name}</DetailRow>
                <DetailRow label="Type">{humanize(detail.vendor_type)}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge value={detail.status} />
                </DetailRow>
                <DetailRow label="Owner">{detail.owner_email_masked || "—"}</DetailRow>
                <DetailRow label="Created">{formatDate(detail.created_at)}</DetailRow>
                <DetailRow label="Vendor ID">
                  <span className="font-mono text-xs">{detail.vendor_id}</span>
                </DetailRow>
              </dl>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Countries
              </h3>
              <div className="space-y-2">
                {detail.countries.length === 0 && (
                  <p className="text-sm text-ink-500">No country applications yet.</p>
                )}
                {detail.countries.map((item) => (
                  <div
                    key={item.vendor_country_id}
                    className="rounded-lg border border-ink-100 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="indigo">{item.country_code || "—"}</Badge>
                      <StatusBadge value={item.onboarding_status} />
                      <Badge tone={item.selling_enabled ? "emerald" : "slate"}>
                        Selling {item.selling_enabled ? "on" : "off"}
                      </Badge>
                      <Badge tone={item.payout_enabled ? "emerald" : "slate"}>
                        Payout {item.payout_enabled ? "on" : "off"}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-500">
                      Verification: {humanize(item.verification_status)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Stores
              </h3>
              {detail.stores.length === 0 ? (
                <p className="text-sm text-ink-500">No storefronts yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail.stores.map((store) => (
                    <div
                      key={store.store_id}
                      className="rounded-lg border border-ink-100 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink-800">
                          {store.name || store.slug}
                        </p>
                        <StatusBadge value={store.status} />
                      </div>
                      <p className="mt-1 text-xs text-ink-500">
                        {store.country_code || "—"} · {Number(store.rating).toFixed(1)} rating ·{" "}
                        {store.followers_count} followers
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Warehouses
              </h3>
              {detail.warehouses.length === 0 ? (
                <p className="text-sm text-ink-500">No warehouses yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail.warehouses.map((warehouse) => (
                    <div
                      key={warehouse.warehouse_id}
                      className="rounded-lg border border-ink-100 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink-800">
                          {warehouse.code} · {warehouse.city_text}
                        </p>
                        <StatusBadge value={warehouse.status} />
                      </div>
                      <p className="mt-1 text-xs text-ink-500">
                        {warehouse.country_code || "—"} · Fulfillment{" "}
                        {warehouse.fulfillment_enabled ? "on" : "off"} · Pickup{" "}
                        {warehouse.pickup_enabled ? "on" : "off"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Payout accounts
              </h3>
              {detail.payout_accounts.length === 0 ? (
                <p className="text-sm text-ink-500">No payout accounts yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail.payout_accounts.map((account) => (
                    <div
                      key={account.vendor_payout_account_id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-ink-100 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-800">
                          {account.account_number_masked}
                        </p>
                        <p className="text-xs text-ink-500">
                          {humanize(account.account_type)} · {account.currency_code}
                          {account.is_default ? " · default" : ""}
                        </p>
                      </div>
                      <StatusBadge value={account.verification_status} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
