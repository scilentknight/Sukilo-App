"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import {
  approveApplication,
  listAdminApplications,
  listAdminCountries,
  rejectApplication,
  requestApplicationInfo,
} from "@/lib/admin";
import useAdminQuery from "@/lib/useAdminQuery";
import DataTable from "@/components/admin/DataTable";
import Drawer from "@/components/admin/Drawer";
import StepUpDialog from "@/components/admin/StepUpDialog";
import {
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
import Button from "@/components/ui/Button";
import { formatDate, humanize } from "@/lib/format";

const LIMIT = 25;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "REVIEW", label: "In review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DRAFT", label: "Draft" },
];

const ACTIONS = {
  approve: {
    label: "Approve",
    actionClass: "vendor.application.approve",
    confirmLabel: "Approve",
    description: "Verify your identity to approve this seller application.",
  },
  reject: {
    label: "Reject",
    actionClass: "vendor.application.reject",
    confirmLabel: "Reject",
    description: "Verify your identity to reject this seller application.",
  },
  "request-info": {
    label: "Request info",
    actionClass: "vendor.application.review",
    confirmLabel: "Send request",
    description: "Verify your identity to return this application to the seller.",
  },
};

export default function AdminApplicationsPage() {
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [notice, setNotice] = useState(null);

  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState(null);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState(null);
  const [applying, setApplying] = useState(false);

  const load = useCallback(
    () =>
      listAdminApplications({
        q: query || undefined,
        countryCode: country || undefined,
        status: status || undefined,
        limit: LIMIT,
        offset,
      }),
    [query, country, status, offset],
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

  function openApplication(row) {
    setSelected(row);
    setReason("");
    setActionError(null);
  }

  function closeDrawer() {
    setSelected(null);
    setDecision(null);
    setReason("");
    setActionError(null);
  }

  function startDecision(nextDecision) {
    setActionError(null);
    if (nextDecision !== "approve" && !reason.trim()) {
      setActionError("Add a short reason before continuing.");
      return;
    }
    setDecision(nextDecision);
  }

  async function handleVerified(grant) {
    if (!selected || !decision) return;
    setApplying(true);
    setActionError(null);
    try {
      if (decision === "approve") {
        await approveApplication(selected.vendor_country_id, grant);
      } else if (decision === "reject") {
        await rejectApplication(selected.vendor_country_id, reason.trim(), grant);
      } else {
        await requestApplicationInfo(selected.vendor_country_id, reason.trim(), grant);
      }
      setNotice(`${ACTIONS[decision].label} completed for ${selected.display_name}.`);
      closeDrawer();
      refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setApplying(false);
    }
  }

  const countryOptions = [
    { value: "", label: "All countries" },
    ...countries.map((item) => ({ value: item.code, label: item.code })),
  ];

  const columns = [
    {
      header: "Applicant",
      cell: (row) => (
        <div>
          <p className="font-medium text-ink-900">{row.display_name}</p>
          <p className="text-xs text-ink-500">{row.legal_name}</p>
        </div>
      ),
    },
    {
      header: "Country",
      cell: (row) =>
        row.country_code ? <Badge tone="indigo">{row.country_code}</Badge> : "—",
    },
    {
      header: "Owner",
      cell: (row) => (
        <span className="text-xs text-ink-600">{row.owner_email_masked || "—"}</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge value={row.onboarding_status} />,
    },
    {
      header: "Documents",
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-ink-600">
          <FileText size={14} />
          {row.documents.length}
        </span>
      ),
    },
    {
      header: "Submitted",
      cell: (row) => <span className="text-xs text-ink-500">{formatDate(row.created_at)}</span>,
    },
    {
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <button
          type="button"
          onClick={() => openApplication(row)}
          aria-label={`Review ${row.display_name}`}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
        >
          <ChevronRight size={17} />
        </button>
      ),
    },
  ];

  const pending = selected && ["SUBMITTED", "REVIEW"].includes(selected.onboarding_status);

  return (
    <div>
      <PageHeader
        title="Seller applications"
        description="Review seller applications and decide which markets they can sell in."
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
        <div className="flex flex-col gap-3 border-b border-ink-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField
            value={searchText}
            onChange={setSearchText}
            onSubmit={submitSearch}
            placeholder="Search by seller name…"
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
              value={status}
              onChange={(value) => {
                setStatus(value);
                setOffset(0);
              }}
              options={STATUS_OPTIONS}
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
          rowKey={(row) => row.vendor_country_id}
          loading={loading}
          empty={
            <EmptyState
              title="No applications found"
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
        onClose={closeDrawer}
        title={selected?.display_name || "Application"}
        subtitle={selected?.legal_name}
        footer={
          pending ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => startDecision("request-info")}
                disabled={applying}
              >
                Request info
              </Button>
              <Button
                variant="danger"
                onClick={() => startDecision("reject")}
                disabled={applying}
              >
                Reject
              </Button>
              <Button onClick={() => startDecision("approve")} disabled={applying}>
                Approve
              </Button>
            </div>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-6">
            <dl>
              <DetailRow label="Status">
                <StatusBadge value={selected.onboarding_status} />
              </DetailRow>
              <DetailRow label="Vendor status">
                <StatusBadge value={selected.vendor_status} />
              </DetailRow>
              <DetailRow label="Type">{humanize(selected.vendor_type)}</DetailRow>
              <DetailRow label="Country">{selected.country_code || "—"}</DetailRow>
              <DetailRow label="Owner">{selected.owner_email_masked || "—"}</DetailRow>
              <DetailRow label="Selling enabled">
                {selected.selling_enabled ? "Yes" : "No"}
              </DetailRow>
              <DetailRow label="Payout enabled">
                {selected.payout_enabled ? "Yes" : "No"}
              </DetailRow>
              <DetailRow label="Submitted">{formatDate(selected.created_at)}</DetailRow>
            </dl>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Documents
              </h3>
              {selected.documents.length === 0 ? (
                <p className="text-sm text-ink-500">No documents uploaded.</p>
              ) : (
                <ul className="space-y-2">
                  {selected.documents.map((document) => (
                    <li
                      key={document.vendor_document_id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2.5"
                    >
                      <span className="flex items-center gap-2 text-sm text-ink-800">
                        <FileText size={15} className="text-ink-400" />
                        {humanize(document.document_type)}
                      </span>
                      <StatusBadge value={document.verification_status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {pending && (
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Review note
                </h3>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Required when rejecting or requesting more information."
                  className="w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <p className="mt-1 text-xs text-ink-400">{reason.length}/500</p>
              </section>
            )}

            {actionError && <ErrorNote message={actionError} />}
          </div>
        )}
      </Drawer>

      {selected && decision && (
        <StepUpDialog
          open
          onClose={() => setDecision(null)}
          actionClass={ACTIONS[decision].actionClass}
          title={`${ACTIONS[decision].label} application`}
          description={ACTIONS[decision].description}
          confirmLabel={ACTIONS[decision].confirmLabel}
          onVerified={handleVerified}
        />
      )}
    </div>
  );
}
