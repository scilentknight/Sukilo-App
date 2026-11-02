"use client";

import { useCallback, useState } from "react";
import { ChevronRight, Mail, Phone } from "lucide-react";
import { listAdminCustomers } from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import DataTable from "@/components/admin/DataTable";
import Drawer from "@/components/admin/Drawer";
import {
  Avatar,
  Badge,
  Card,
  DetailRow,
  EmptyState,
  ErrorNote,
  PageHeader,
  Pagination,
  SearchField,
  SelectField,
  StatusBadge,
} from "@/components/admin/ui";
import { formatDate, formatDateTime } from "@/lib/format";

const LIMIT = 25;
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CLOSED", label: "Closed" },
];

export default function AdminCustomersPage() {
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(null);

  const load = useCallback(
    () =>
      listAdminCustomers({
        q: query || undefined,
        status: status || undefined,
        limit: LIMIT,
        offset,
      }),
    [query, status, offset],
  );
  const { data, loading, error, refresh } = useAdminQuery(load);

  function submitSearch() {
    setOffset(0);
    setQuery(searchText.trim());
  }

  const columns = [
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.email_masked} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink-900">
              {row.email_masked || "No email"}
            </p>
            <p className="truncate text-xs text-ink-500">{row.phone_masked || "No phone"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge value={row.status} />,
    },
    {
      header: "Verification",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge tone={row.email_verified ? "emerald" : "slate"}>Email</Badge>
          <Badge tone={row.phone_verified ? "emerald" : "slate"}>Phone</Badge>
        </div>
      ),
    },
    {
      header: "Vendor",
      cell: (row) => (
        <span className={row.vendor_name ? "text-ink-800" : "text-ink-400"}>
          {row.vendor_name || "—"}
        </span>
      ),
    },
    {
      header: "Joined",
      cell: (row) => <span className="text-xs text-ink-500">{formatDate(row.created_at)}</span>,
    },
    {
      header: "Last login",
      cell: (row) => (
        <span className="text-xs text-ink-500">{formatDateTime(row.last_login_at)}</span>
      ),
    },
    {
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <button
          type="button"
          onClick={() => setSelected(row)}
          aria-label={`View ${row.email_masked || "customer"}`}
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
        title="Customers"
        description="Accounts registered on the marketplace. Contact details stay masked."
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField
            value={searchText}
            onChange={setSearchText}
            onSubmit={submitSearch}
            placeholder="Search by email or phone…"
            className="w-full lg:max-w-sm"
          />
          <SelectField
            value={status}
            onChange={(value) => {
              setStatus(value);
              setOffset(0);
            }}
            options={STATUS_OPTIONS}
          />
        </div>

        {error && (
          <div className="p-4">
            <ErrorNote message={error} onRetry={() => refresh(true)} />
          </div>
        )}

        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          rowKey={(row) => row.user_id}
          loading={loading}
          empty={
            <EmptyState
              title="No customers found"
              description="Try a different search term or status filter."
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
        title={selected?.email_masked || "Customer"}
        subtitle={selected?.phone_masked || "Account details"}
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Avatar name={selected.email_masked} size="lg" />
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {selected.email_masked || "No email"}
                </p>
                <div className="mt-1">
                  <StatusBadge value={selected.status} />
                </div>
              </div>
            </div>

            <dl>
              <DetailRow label="Phone">{selected.phone_masked || "—"}</DetailRow>
              <DetailRow label="Email verified">
                {selected.email_verified ? "Yes" : "No"}
              </DetailRow>
              <DetailRow label="Phone verified">
                {selected.phone_verified ? "Yes" : "No"}
              </DetailRow>
              <DetailRow label="Vendor">
                {selected.vendor_name || (selected.is_vendor ? "Yes" : "No")}
              </DetailRow>
              <DetailRow label="Joined">{formatDateTime(selected.created_at)}</DetailRow>
              <DetailRow label="Last login">
                {formatDateTime(selected.last_login_at)}
              </DetailRow>
              <DetailRow label="User ID">
                <span className="font-mono text-xs">{selected.user_id}</span>
              </DetailRow>
            </dl>

            <div className="rounded-lg bg-ink-50 px-4 py-3 text-xs text-ink-500">
              <p className="flex items-center gap-1.5">
                <Mail size={14} /> Email addresses are masked in the admin panel.
              </p>
              <p className="mt-1 flex items-center gap-1.5">
                <Phone size={14} /> Phone numbers are masked for privacy.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
