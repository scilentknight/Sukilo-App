"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import {
  createCategory,
  enableCategory,
  listAdminCategories,
  listAdminCountries,
} from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import DataTable from "@/components/admin/DataTable";
import Drawer from "@/components/admin/Drawer";
import StepUpDialog from "@/components/admin/StepUpDialog";
import {
  Card,
  CountryChips,
  EmptyState,
  ErrorNote,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert } from "@/components/ui";

export default function AdminCategoriesPage() {
  const [notice, setNotice] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", parentId: "" });
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [enabling, setEnabling] = useState(null);
  const [countryInput, setCountryInput] = useState("");
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [enablingBusy, setEnablingBusy] = useState(false);

  const load = useCallback(
    () =>
      Promise.all([listAdminCategories("en"), listAdminCountries()]).then(
        ([categoryList, countryList]) => ({
          items: categoryList,
          countries: countryList,
        }),
      ),
    [],
  );
  const { data, loading, error, refresh } = useAdminQuery(load);
  const items = data?.items ?? [];
  const countries = data?.countries ?? [];
  const countryCode = countryInput || countries[0]?.code || "NP";

  function openCreate() {
    setForm({ code: "", name: "", parentId: "" });
    setCreateError(null);
    setCreateOpen(true);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setCreateError(null);
    try {
      await createCategory({
        code: form.code.trim(),
        name: form.name.trim(),
        localeCode: "en",
        parentId: form.parentId || null,
      });
      setNotice(`Category "${form.name.trim()}" created.`);
      setCreateOpen(false);
      refresh();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEnable(grant) {
    if (!enabling) return;
    setEnablingBusy(true);
    setActionError(null);
    try {
      await enableCategory(enabling.category_id, countryCode.toUpperCase(), grant);
      setNotice(
        `"${enabling.name || enabling.code}" enabled in ${countryCode.toUpperCase()}.`,
      );
      setEnabling(null);
      refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setEnablingBusy(false);
    }
  }

  const columns = [
    {
      header: "Code",
      cell: (row) => (
        <span className="font-mono text-xs text-ink-700">{row.code}</span>
      ),
    },
    {
      header: "Category",
      cell: (row) => (
        <span className={row.name ? "font-medium text-ink-900" : "text-ink-400"}>
          {row.name || "No English label"}
        </span>
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
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <button
          type="button"
          onClick={() => {
            setEnabling(row);
            setActionError(null);
          }}
          className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-ink-50"
        >
          Enable
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Catalog categories"
        description="Canonical categories shared by every market."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            New category
          </Button>
        }
      />

      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      <Card>
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
          rows={items}
          rowKey={(row) => row.category_id}
          loading={loading}
          empty={
            <EmptyState
              title="No categories yet"
              description="Create the first canonical category to start the catalog."
            />
          }
        />
      </Card>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New category"
        subtitle="Creates a canonical category that starts disabled everywhere."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && <Alert type="error">{createError}</Alert>}
          <Input
            label="Code"
            value={form.code}
            onChange={(event) => setForm({ ...form, code: event.target.value })}
            placeholder="home-appliances"
            required
          />
          <Input
            label="English name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Home appliances"
            required
          />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink-700">Parent category (optional)</span>
            <select
              value={form.parentId}
              onChange={(event) => setForm({ ...form, parentId: event.target.value })}
              className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">No parent</option>
              {items.map((item) => (
                <option key={item.category_id} value={item.category_id}>
                  {item.name || item.code}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create category
            </Button>
          </div>
        </form>
      </Drawer>

      <Drawer
        open={Boolean(enabling)}
        onClose={() => setEnabling(null)}
        title="Enable category"
        subtitle={enabling ? enabling.name || enabling.code : ""}
      >
        {enabling && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Enabling makes the category available to sellers in the chosen market. This
              action needs step-up verification.
            </p>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink-700">Country code</span>
              <input
                value={countryCode}
                onChange={(event) =>
                  setCountryInput(event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 2))
                }
                list="admin-country-codes"
                maxLength={2}
                placeholder="NP"
                className="h-10 w-32 rounded-lg border border-ink-200 bg-white px-3 text-sm uppercase text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <datalist id="admin-country-codes">
                {countries.map((item) => (
                  <option key={item.country_id} value={item.code} />
                ))}
              </datalist>
            </label>
            {actionError && <ErrorNote message={actionError} />}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEnabling(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => setStepUpOpen(true)}
                disabled={countryCode.length !== 2 || enablingBusy}
              >
                Verify and enable
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {enabling && (
        <StepUpDialog
          open={stepUpOpen}
          onClose={() => setStepUpOpen(false)}
          actionClass="catalog.taxonomy.decide"
          title="Enable category"
          description="Verify your identity to enable this category in the selected market."
          confirmLabel="Enable category"
          onVerified={handleEnable}
        />
      )}
    </div>
  );
}
