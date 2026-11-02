"use client";

import { useCallback, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { listPermissions, listRoles } from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import DataTable from "@/components/admin/DataTable";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorNote,
  PageHeader,
  SearchField,
} from "@/components/admin/ui";
import { Skeleton } from "@/components/ui";
import { humanize } from "@/lib/format";

export default function AdminAccessPage() {
  const [search, setSearch] = useState("");

  const load = useCallback(
    () =>
      Promise.all([listRoles(), listPermissions()]).then(
        ([roleList, permissionList]) => ({
          roles: roleList,
          permissions: permissionList,
        }),
      ),
    [],
  );
  const { data, loading, error, refresh } = useAdminQuery(load);
  const roles = data?.roles ?? [];
  const permissions = useMemo(() => data?.permissions ?? [], [data]);

  const filteredPermissions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return permissions;
    return permissions.filter(
      (permission) =>
        permission.code.toLowerCase().includes(term) ||
        permission.description.toLowerCase().includes(term),
    );
  }, [permissions, search]);

  const columns = [
    {
      header: "Role",
      cell: (row) => (
        <div>
          <p className="font-medium text-ink-900">{row.name}</p>
          <p className="font-mono text-[11px] text-ink-400">{row.code}</p>
        </div>
      ),
    },
    {
      header: "Scope",
      cell: (row) => <Badge tone="indigo">{humanize(row.scope_type)}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Access & roles"
        description="Role definitions and the permission catalog used by the API."
      />

      {error && (
        <div className="mb-4">
          <ErrorNote
            message={error}
            onRetry={() => refresh(true)}
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Roles"
            description={`${roles.length} role definitions`}
            action={
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <ShieldCheck size={16} />
              </span>
            }
          />
          <DataTable
            columns={columns}
            rows={roles}
            rowKey={(row) => row.role_id}
            loading={loading}
            skeletonRows={5}
            empty={<EmptyState title="No roles" description="Role definitions are seeded by migrations." />}
          />
        </Card>

        <Card>
          <CardHeader
            title="Permissions"
            description={`${permissions.length} permission codes`}
          />
          <div className="border-b border-ink-100 px-4 py-3">
            <SearchField
              value={search}
              onChange={setSearch}
              onSubmit={() => {}}
              placeholder="Filter permissions…"
            />
          </div>
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredPermissions.length === 0 ? (
            <EmptyState
              title="No matching permissions"
              description="Try a different search term."
            />
          ) : (
            <ul className="max-h-[520px] divide-y divide-ink-100 overflow-y-auto">
              {filteredPermissions.map((permission) => (
                <li key={permission.permission_id} className="px-4 py-2.5">
                  <p className="font-mono text-xs font-semibold text-ink-800">
                    {permission.code}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">{permission.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
