"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useCountry } from "@/context/CountryContext";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/lib/account";
import { getCountry } from "@/config/locales";
import { AccountShell, AccountSkeleton, FormMessage, Section } from "./AccountShell";
import { AddressForm } from "./AddressForm";
import { useAccountResource } from "./useAccountResource";

const STALE = "This address was changed elsewhere, so the latest version has been loaded. Please try again.";

/** Country-scoped address book backed by `/api/v1/me/addresses`. */
export function AddressBook() {
  const { countryCode } = useCountry();
  const load = useCallback(() => listAddresses(countryCode), [countryCode]);
  const addresses = useAccountResource(load);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState(null);

  const run = async (key, action) => {
    if (busy) return;
    setBusy(key);
    setActionError(null);
    try {
      await action();
      await addresses.reload();
    } catch (error) {
      if (error.status === 409) {
        setActionError(STALE);
        await addresses.reload();
      } else {
        setActionError(error.message);
      }
    } finally {
      setBusy(null);
    }
  };

  const onSave = async (payload) => {
    try {
      if (editing === "new") await createAddress(countryCode, payload);
      else await updateAddress(countryCode, editing.address_id, payload, editing.version);
    } catch (error) {
      if (error.status === 409) {
        setEditing(null);
        setActionError(STALE);
        await addresses.reload();
        return;
      }
      throw error;
    }
    setEditing(null);
    await addresses.reload();
  };

  const list = addresses.data ?? [];
  const addButton =
    addresses.state === "ready" && !editing ? (
      <Button type="button" onClick={() => setEditing("new")}>
        Add address
      </Button>
    ) : null;

  return (
    <AccountShell title="Addresses" actions={addButton}>
      <p className="text-sm text-ink-500">
        Showing addresses for {getCountry(countryCode).name}. Change the country in the header to manage another market.
      </p>
      <FormMessage error={actionError} />

      {editing ? (
        <Section title={editing === "new" ? "New address" : "Edit address"}>
          <AddressForm
            key={editing === "new" ? "new" : editing.address_id}
            address={editing === "new" ? null : editing}
            onSave={onSave}
            onCancel={() => setEditing(null)}
          />
        </Section>
      ) : null}

      {addresses.state === "loading" ? <AccountSkeleton /> : null}
      {addresses.state === "error" ? (
        <ErrorState title="Unable to load your addresses" message={addresses.error} onRetry={addresses.reload} />
      ) : null}
      {addresses.state === "ready" && list.length === 0 && !editing ? (
        <EmptyState title="No saved addresses" message="Add an address to speed up checkout." />
      ) : null}

      {addresses.state === "ready" && list.length > 0 ? (
        <ul className="space-y-3">
          {list.map((address) => (
            <AddressCard
              key={address.address_id}
              address={address}
              busy={busy}
              onEdit={() => setEditing(address)}
              onDefault={(kind) =>
                run(`${kind}:${address.address_id}`, () => setDefaultAddress(countryCode, address.address_id, kind))
              }
              onDelete={() =>
                run(`delete:${address.address_id}`, () => deleteAddress(countryCode, address.address_id, address.version))
              }
            />
          ))}
        </ul>
      ) : null}
    </AccountShell>
  );
}

function AddressCard({ address, busy, onEdit, onDefault, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const id = address.address_id;
  const lines = [address.address_line_1, address.address_line_2, address.landmark, address.city_text, address.postal_code]
    .filter(Boolean)
    .join(", ");

  return (
    <li className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-ink-900">{address.recipient_name}</p>
        <Badge>{address.address_type.toLowerCase()}</Badge>
        {address.is_default_shipping ? <Badge tone="success">Default shipping</Badge> : null}
        {address.is_default_billing ? <Badge tone="success">Default billing</Badge> : null}
      </div>
      <p className="mt-1 text-sm text-ink-600">{lines}</p>
      <p className="text-sm text-ink-500">{address.phone_e164}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onEdit} disabled={Boolean(busy)}>
          Edit
        </Button>
        {address.is_shipping && !address.is_default_shipping ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDefault("SHIPPING")}
            isLoading={busy === `SHIPPING:${id}`}
            disabled={Boolean(busy)}
          >
            Make default shipping
          </Button>
        ) : null}
        {address.is_billing && !address.is_default_billing ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDefault("BILLING")}
            isLoading={busy === `BILLING:${id}`}
            disabled={Boolean(busy)}
          >
            Make default billing
          </Button>
        ) : null}
        {confirmDelete ? (
          <>
            <Button type="button" size="sm" variant="danger" onClick={onDelete} isLoading={busy === `delete:${id}`} disabled={Boolean(busy)}>
              Confirm delete
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)} disabled={Boolean(busy)}>
              Keep
            </Button>
          </>
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(true)} disabled={Boolean(busy)}>
            Delete
          </Button>
        )}
      </div>
    </li>
  );
}
