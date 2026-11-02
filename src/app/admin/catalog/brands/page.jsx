"use client";

import { useCallback } from "react";
import { BadgeCheck } from "lucide-react";
import { listAdminBrands } from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import DataTable from "@/components/admin/DataTable";
import {
  Card,
  CountryChips,
  EmptyState,
  ErrorNote,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";

export default function AdminBrandsPage() {
  const load = useCallback(() => listAdminBrands(), []);
  const { data, loading, error, refresh } = useAdminQuery(load);
  const items = data ?? [];

  const columns = [
    {
      header: "Brand",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <BadgeCheck size={16} />
          </span>
          <span className="font-medium text-ink-900">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge value={row.status} />,
    },
    {
      header: "Enabled in",
      cell: (row) => <CountryChips codes={row.enabled_countries} />,
    },
    {
      header: "Brand ID",
      cell: (row) => (
        <span className="font-mono text-xs text-ink-500">{row.brand_id}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Catalog brands"
        description="Shared brand records. Sellers propose new brands through brand requests."
      />

      <div className="mb-4 rounded-lg border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-900">
        Brand requests are reviewed from the vendor workspace. This page is read-only.
      </div>

      <Card>
        {error && (
          <div className="p-4">
            <ErrorNote message={error} onRetry={() => refresh(true)} />
          </div>
        )}
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(row) => row.brand_id}
          loading={loading}
          empty={
            <EmptyState
              title="No brands yet"
              description="Brands appear here once sellers submit or admins create them."
            />
          }
        />
      </Card>
    </div>
  );
}
