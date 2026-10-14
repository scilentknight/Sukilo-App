"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addressSchema } from "@/schemas/account";
import { FormMessage } from "./AccountShell";

const ADDRESS_TYPES = [
  { value: "HOME", label: "Home" },
  { value: "OFFICE", label: "Office" },
  { value: "OTHER", label: "Other" },
];

const OPTIONAL_FIELDS = ["address_line_2", "landmark", "city_text", "postal_code"];

function toFormValues(address) {
  return {
    recipient_name: address?.recipient_name ?? "",
    phone: address?.phone_e164 ?? "",
    address_line_1: address?.address_line_1 ?? "",
    address_line_2: address?.address_line_2 ?? "",
    landmark: address?.landmark ?? "",
    city_text: address?.city_text ?? "",
    postal_code: address?.postal_code ?? "",
    address_type: address?.address_type ?? "HOME",
    is_shipping: address?.is_shipping ?? true,
    is_billing: address?.is_billing ?? true,
  };
}

/** Blank optional fields are sent as null so the API clears them. */
function toPayload(values, address) {
  const payload = { ...values };
  for (const field of OPTIONAL_FIELDS) payload[field] = values[field] ? values[field] : null;
  payload.is_default_shipping = address?.is_default_shipping ?? false;
  payload.is_default_billing = address?.is_default_billing ?? false;
  return payload;
}

/** Create or edit one address. `onSave(payload)` performs the API call. */
export function AddressForm({ address, onSave, onCancel }) {
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(addressSchema), defaultValues: toFormValues(address) });

  const submit = async (values) => {
    setError(null);
    try {
      await onSave(toPayload(values, address));
    } catch (err) {
      setError(err?.message || "Could not save this address.");
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
      <Input label="Recipient name" autoComplete="name" error={errors.recipient_name?.message} {...register("recipient_name")} />
      <Input label="Phone" type="tel" autoComplete="tel" placeholder="+9779812345678" error={errors.phone?.message} {...register("phone")} />
      <div className="sm:col-span-2">
        <Input label="Address" autoComplete="address-line1" error={errors.address_line_1?.message} {...register("address_line_1")} />
      </div>
      <div className="sm:col-span-2">
        <Input label="Apartment, floor (optional)" autoComplete="address-line2" error={errors.address_line_2?.message} {...register("address_line_2")} />
      </div>
      <Input label="Landmark (optional)" error={errors.landmark?.message} {...register("landmark")} />
      <Input label="City (optional)" autoComplete="address-level2" error={errors.city_text?.message} {...register("city_text")} />
      <Input label="Postal code (optional)" autoComplete="postal-code" error={errors.postal_code?.message} {...register("postal_code")} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="address_type" className="text-sm font-medium leading-5 text-gray-700">
          Type
        </label>
        <select
          id="address_type"
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm"
          {...register("address_type")}
        >
          {ADDRESS_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="flex flex-col gap-2 sm:col-span-2">
        <legend className="text-sm font-medium text-gray-700">Use this address for</legend>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" {...register("is_shipping")} /> Shipping
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" {...register("is_billing")} /> Billing
        </label>
        {errors.is_billing?.message ? <p className="text-xs text-red-600">{errors.is_billing.message}</p> : null}
      </fieldset>
      <div className="space-y-3 sm:col-span-2">
        <FormMessage error={error} />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            {address ? "Save changes" : "Add address"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
