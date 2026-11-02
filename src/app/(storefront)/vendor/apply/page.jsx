"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  addVendorDocument,
  createVendorApplication,
  submitVendorApplication,
  updateVendorApplication,
} from "@/lib/vendor";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Alert, LoadingSpinner } from "@/components/ui";

// Development markets expose one fixed SELLER_TERMS policy version.
const SELLER_TERMS_VERSION = "dev-1";
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

const VENDOR_TYPES = {
  COMPANY: {
    label: "Registered company",
    documentType: "REGISTRATION",
    documentLabel: "company registration certificate",
  },
  SOLE_TRADER: {
    label: "Sole trader",
    documentType: "REGISTRATION",
    documentLabel: "business registration certificate",
  },
  INDIVIDUAL: {
    label: "Individual seller",
    documentType: "OWNER_ID",
    documentLabel: "government-issued photo ID",
  },
};

const STAGE_LABELS = {
  saving: "Saving your business details…",
  uploading: "Uploading your document…",
  submitting: "Submitting your application…",
};

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VendorApplyPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    countryCode: "NP",
    legalName: "",
    displayName: "",
    vendorType: "COMPANY",
  });
  const [file, setFile] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [stage, setStage] = useState(null);
  const [result, setResult] = useState(null);

  // Keeps the draft between retries so we never create a duplicate application.
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login?next=%2Fvendor%2Fapply");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <LoadingSpinner message="Loading seller application…" />;
  }

  const vendorType = VENDOR_TYPES[form.vendorType];
  const busy = stage !== null;

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    if (name === "vendorType" && draft) {
      setDraft({ ...draft, documentUploaded: false });
    }
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setErrors((current) => ({ ...current, file: undefined }));
    if (draft) setDraft({ ...draft, documentUploaded: false });
  }

  function validate() {
    const next = {};
    if (!form.legalName.trim()) next.legalName = "Enter the legal business name.";
    if (!form.displayName.trim()) next.displayName = "Enter the store name.";
    if (!/^[a-zA-Z]{2}$/.test(form.countryCode.trim()))
      next.countryCode = "Use a 2-letter country code, e.g. NP.";
    if (!file) next.file = `Attach your ${vendorType.documentLabel}.`;
    else if (file.size > MAX_DOCUMENT_BYTES)
      next.file = "The file must be 10 MB or smaller.";
    if (!accepted) next.accepted = "Accept the seller terms to continue.";
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setServerError(null);
    setStage("saving");

    try {
      let application = draft;
      const details = {
        legal_name: form.legalName.trim(),
        display_name: form.displayName.trim(),
        vendor_type: form.vendorType,
      };

      if (!application) {
        const created = await createVendorApplication({
          country_code: form.countryCode.trim().toUpperCase(),
          ...details,
        });
        application = {
          id: created.vendor_country_id,
          version: created.version,
          documentUploaded: false,
        };
      } else {
        const updated = await updateVendorApplication(application.id, {
          expected_version: application.version,
          ...details,
        });
        application = { ...application, version: updated.version };
      }
      setDraft(application);

      if (!application.documentUploaded) {
        setStage("uploading");
        await addVendorDocument(application.id, {
          document_type: vendorType.documentType,
          content_base64: await readFileAsBase64(file),
          media_type: file.type || "application/octet-stream",
        });
        application = { ...application, documentUploaded: true };
        setDraft(application);
      }

      setStage("submitting");
      setResult(await submitVendorApplication(application.id, SELLER_TERMS_VERSION));
    } catch (error) {
      setServerError(error.message || "Could not submit your application.");
    } finally {
      setStage(null);
    }
  }

  if (result) {
    return (
      <div className="container-page py-12 max-w-2xl">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 text-2xl font-bold text-ink-800">
            Application submitted
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            <span className="font-semibold text-ink-700">{result.display_name}</span>{" "}
            is now waiting for review. Our team will check your details and
            document before enabling selling.
          </p>

          <dl className="mx-auto mt-6 grid max-w-sm gap-3 text-left">
            <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
              <dt className="text-xs text-ink-500">Status</dt>
              <dd className="text-sm font-semibold text-amber-700">
                {result.onboarding_status}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
              <dt className="text-xs text-ink-500">Country</dt>
              <dd className="text-sm font-semibold text-ink-800">
                {form.countryCode.toUpperCase()}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
              <dt className="text-xs text-ink-500">Documents</dt>
              <dd className="text-sm font-semibold text-ink-800">
                {result.documents?.length ?? 0} uploaded
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/account"
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Go to my account
            </Link>
            <Link
              href="/products"
              className="rounded-lg border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 max-w-3xl">
      <Link
        href="/account"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← Back to account
      </Link>

      <header className="mt-3 mb-6">
        <h1 className="text-2xl font-bold text-ink-800">Become a seller</h1>
        <p className="mt-1 text-sm text-ink-500">
          Apply for a vendor account. We review every application before it can
          sell in a market.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {serverError && <Alert type="error">{serverError}</Alert>}

        {/* Step 1 — business details */}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ink-800">
            1. Business details
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Use the name that should appear on your invoices and documents.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Legal business name"
              value={form.legalName}
              onChange={(event) => setField("legalName", event.target.value)}
              placeholder="Scilent Knight Pvt. Ltd."
              error={errors.legalName}
              maxLength={200}
              required
            />
            <Input
              label="Store name"
              value={form.displayName}
              onChange={(event) => setField("displayName", event.target.value)}
              placeholder="Scilent Store"
              error={errors.displayName}
              maxLength={160}
              required
            />

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink-700">
                Seller type
              </span>
              <select
                value={form.vendorType}
                onChange={(event) => setField("vendorType", event.target.value)}
                className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {Object.entries(VENDOR_TYPES).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="Selling country code"
              value={form.countryCode}
              onChange={(event) =>
                setField(
                  "countryCode",
                  event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 2),
                )
              }
              placeholder="NP"
              maxLength={2}
              error={errors.countryCode}
              disabled={Boolean(draft)}
              required
            />
          </div>
          {draft && (
            <p className="mt-3 text-xs text-ink-500">
              The country is fixed once an application has started.
            </p>
          )}
        </section>

        {/* Step 2 — document */}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ink-800">
            2. Verification document
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Upload your {vendorType.documentLabel}. PDF or image, up to 10 MB.
          </p>

          <label className={`mt-4 flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${errors.file ? "border-rose-300 bg-rose-50" : "border-ink-200 bg-ink-50 hover:border-brand-300 hover:bg-brand-50/40"}`}>
            <FileText className="mx-auto h-7 w-7 text-ink-400" />
            <span className="text-sm font-medium text-ink-700">
              {file ? file.name : "Choose a file"}
            </span>
            <span className="text-xs text-ink-500">
              {file
                ? formatFileSize(file.size)
                : `${vendorType.documentType.replace("_", " ")} · PDF or image`}
            </span>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
          {errors.file && (
            <p className="mt-2 text-xs text-rose-600">{errors.file}</p>
          )}
        </section>

        {/* Step 3 — agreement */}
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ink-800">3. Agreement</h2>
          <label className="mt-3 flex items-start gap-3 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => {
                setAccepted(event.target.checked);
                setErrors((current) => ({ ...current, accepted: undefined }));
              }}
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              I confirm the information is accurate and I accept the Sukilo
              seller terms. I understand selling is enabled only after the
              application is approved and my store is activated.
            </span>
          </label>
          {errors.accepted && (
            <p className="mt-2 text-xs text-rose-600">{errors.accepted}</p>
          )}
        </section>

        <div>
          <Button
            type="submit"
            size="lg"
            loading={busy}
            className="w-full"
          >
            Submit application
          </Button>
          {stage && (
            <p className="mt-2 text-center text-xs text-ink-500">
              {STAGE_LABELS[stage]}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
