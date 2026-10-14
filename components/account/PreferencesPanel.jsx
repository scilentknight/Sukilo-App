"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useCountry } from "@/context/CountryContext";
import { useLocale } from "@/context/LocaleContext";
import { COUNTRIES, CURRENCIES, getCountry, getLanguage } from "@/config/locales";
import { getPreferences, listConsents, recordConsent, savePreferences } from "@/lib/account";
import { formatDate } from "@/lib/format";
import { AccountShell, AccountSkeleton, FormMessage, Section } from "./AccountShell";
import { useAccountResource } from "./useAccountResource";

const CONSENTS = [
  { type: "TERMS", label: "Terms of service", optional: false },
  { type: "PRIVACY", label: "Privacy policy", optional: false },
  { type: "MARKETING_EMAIL", label: "Marketing emails", optional: true },
  { type: "MARKETING_SMS", label: "Marketing text messages", optional: true },
  { type: "ANALYTICS", label: "Analytics", optional: true },
];

const SELECT = "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm";

/** Market preferences (`/me/preferences`) and consent records (`/me/consents`). */
export function PreferencesPanel() {
  const { countryCode } = useCountry();
  const load = useCallback(async () => {
    const [preferences, consents] = await Promise.all([getPreferences(), listConsents({ countryCode })]);
    return { preferences, consents: consents.items };
  }, [countryCode]);
  const resource = useAccountResource(load);
  const [formKey, setFormKey] = useState(0);
  const [marketMessage, setMarketMessage] = useState({ error: null, success: null });

  const onStale = async () => {
    await resource.reload();
    setFormKey((key) => key + 1);
  };

  return (
    <AccountShell title="Preferences">
      {resource.state === "loading" ? <AccountSkeleton /> : null}
      {resource.state === "error" ? (
        <ErrorState title="Unable to load your preferences" message={resource.error} onRetry={resource.reload} />
      ) : null}
      {resource.state === "ready" ? (
        <>
          <MarketForm
            key={formKey}
            preferences={resource.data.preferences}
            message={marketMessage}
            setMessage={setMarketMessage}
            onSaved={(preferences) => resource.setData((prev) => ({ ...prev, preferences }))}
            onStale={onStale}
          />
          <ConsentSection
            countryCode={countryCode}
            consents={resource.data.consents}
            onChanged={resource.reload}
          />
        </>
      ) : null}
    </AccountShell>
  );
}

function MarketForm({ preferences, message, setMessage, onSaved, onStale }) {
  const site = useCountry();
  const { language } = useLocale();
  const [values, setValues] = useState(() => ({
    countryCode: preferences?.country_code ?? site.countryCode,
    localeCode: preferences?.locale_code ?? language,
    currencyCode: preferences?.currency_code ?? site.currencyCode,
  }));
  const [saving, setSaving] = useState(false);
  const languages = getCountry(values.countryCode).languages;

  const onCountry = (code) => {
    const country = getCountry(code);
    setValues({
      countryCode: code,
      localeCode: country.languages.includes(values.localeCode) ? values.localeCode : country.defaultLanguage,
      currencyCode: country.currency,
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage({ error: null, success: null });
    try {
      const saved = await savePreferences({ ...values, expectedVersion: preferences?.version });
      onSaved(saved);
      setMessage({ error: null, success: "Preferences saved." });
    } catch (error) {
      if (error.status === 409) {
        setMessage({ error: "Your preferences changed on another device. The latest values are shown.", success: null });
        onStale();
      } else {
        setMessage({ error: error.message, success: null });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section
      title="Shopping market"
      description={
        preferences ? "Your saved country, language and currency." : "Not saved yet. The values below come from this browser."
      }
    >
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Country" id="pref-country">
          <select id="pref-country" className={SELECT} value={values.countryCode} onChange={(e) => onCountry(e.target.value)}>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Language" id="pref-language">
          <select
            id="pref-language"
            className={SELECT}
            value={values.localeCode}
            onChange={(e) => setValues((prev) => ({ ...prev, localeCode: e.target.value }))}
          >
            {languages.map((code) => (
              <option key={code} value={code}>
                {getLanguage(code).englishLabel}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Currency" id="pref-currency">
          <select
            id="pref-currency"
            className={SELECT}
            value={values.currencyCode}
            onChange={(e) => setValues((prev) => ({ ...prev, currencyCode: e.target.value }))}
          >
            {Object.values(CURRENCIES).map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} · {currency.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="space-y-3 sm:col-span-3">
          <FormMessage {...message} />
          <Button type="submit" isLoading={saving}>
            Save preferences
          </Button>
        </div>
      </form>
    </Section>
  );
}

function Field({ label, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium leading-5 text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function ConsentSection({ countryCode, consents, onChanged }) {
  const { language } = useLocale();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const current = new Map(consents.map((record) => [record.consent_type, record]));

  const onRecord = async (consentType, granted) => {
    if (busy) return;
    setBusy(consentType);
    setError(null);
    try {
      await recordConsent({ countryCode, consentType, granted });
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Section
      title="Consents"
      description={`Recorded for ${getCountry(countryCode).name}. Every change is kept as evidence.`}
    >
      <div className="mt-2">
        <FormMessage error={error} />
      </div>
      <ul className="mt-2 divide-y divide-ink-100">
        {CONSENTS.map(({ type, label, optional }) => {
          const record = current.get(type);
          const granted = record?.granted === true;
          return (
            <li key={type} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-800">{label}</p>
                <p className="text-xs text-ink-400">
                  {record
                    ? `${granted ? "Given" : "Withdrawn"} ${formatDate(record.recorded_at, language)} · policy ${record.policy_version}`
                    : "Not recorded"}
                </p>
              </div>
              {optional || !granted ? (
                <Button
                  type="button"
                  size="sm"
                  variant={granted ? "outline" : "primary"}
                  onClick={() => onRecord(type, !granted)}
                  isLoading={busy === type}
                  disabled={Boolean(busy)}
                >
                  {granted ? "Withdraw" : optional ? "Allow" : "Accept"}
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
      <ConsentHistory countryCode={countryCode} language={language} />
    </Section>
  );
}

function ConsentHistory({ countryCode, language }) {
  const [history, setHistory] = useState({ open: false, items: [], cursor: null, loading: false, error: null });

  const loadPage = async (cursor) => {
    setHistory((prev) => ({ ...prev, open: true, loading: true, error: null }));
    try {
      const page = await listConsents({ countryCode, history: true, limit: 10, cursor });
      setHistory((prev) => ({
        open: true,
        items: cursor ? [...prev.items, ...page.items] : page.items,
        cursor: page.next_cursor,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setHistory((prev) => ({ ...prev, loading: false, error: error.message }));
    }
  };

  if (!history.open) {
    return (
      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => loadPage(null)}>
        Show consent history
      </Button>
    );
  }

  return (
    <div className="mt-4 border-t border-ink-100 pt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">History</h3>
      <FormMessage error={history.error} />
      {history.items.length === 0 && !history.loading && !history.error ? (
        <p className="mt-2 text-sm text-ink-500">No consent changes recorded yet.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm text-ink-600">
          {history.items.map((record) => (
            <li key={record.consent_id}>
              {formatDate(record.recorded_at, language, { dateStyle: "medium", timeStyle: "short" })} ·{" "}
              {record.consent_type.replace("_", " ").toLowerCase()} {record.granted ? "given" : "withdrawn"}
            </li>
          ))}
        </ul>
      )}
      {history.cursor || history.loading ? (
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => loadPage(history.cursor)} isLoading={history.loading}>
          Load more
        </Button>
      ) : null}
    </div>
  );
}
