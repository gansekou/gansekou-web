"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CrudModal } from "@/components/admin/CrudModal";
import { EmptyState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import { isAdminRole } from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { Address, PageData, School, UUID } from "@/types/platform";
import type { User } from "@/types/user";

type SchoolForm = {
  name: string;
  type: string;
  address_id: string;
  country: string;
  region: string;
  city: string;
  quarter: string;
  details: string;
};

type AddressForm = {
  country: string;
  region: string;
  city: string;
  quarter: string;
  details: string;
};

type ModalState =
  | { kind: "school"; mode: "create"; item?: undefined }
  | { kind: "school"; mode: "edit"; item: School }
  | { kind: "address"; mode: "create"; item?: undefined }
  | { kind: "address"; mode: "edit"; item: Address };

const emptyAddress = {
  country: "Cameroon",
  region: "",
  city: "",
  quarter: "",
  details: "",
};

export function AdminSchoolsManager({
  data,
  reload,
  user,
}: {
  data: PageData;
  reload: () => Promise<void>;
  user: User;
}) {
  const { t } = useI18n(user);
  const canManage = isAdminRole(user);
  const [localSchools, setLocalSchools] = useState<School[] | null>(null);
  const [localAddresses, setLocalAddresses] = useState<Address[] | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [schoolForm, setSchoolForm] = useState<SchoolForm>({
    name: "",
    type: "",
    address_id: "",
    ...emptyAddress,
  });
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dataSchools = useMemo(() => (data.schools as School[]) || [], [data.schools]);
  const dataAddresses = useMemo(() => (data.addresses as Address[]) || [], [data.addresses]);
  const schools = localSchools ?? dataSchools;
  const addresses = localAddresses ?? dataAddresses;

  const addressById = useMemo(
    () => new Map(addresses.map((address) => [address.id, address])),
    [addresses]
  );

  function addressLabel(address?: Address | null) {
    if (!address) return t("admin.noAddress");
    return [address.city, address.region, address.country].filter(Boolean).join(", ") || address.id;
  }

  function openSchool(item?: School) {
    const address = item?.address_id ? addressById.get(item.address_id) : null;
    setStatus(null);
    setError(null);
    setSchoolForm({
      name: item?.name || "",
      type: item?.type || "",
      address_id: item?.address_id || "",
      country: address?.country || "Cameroon",
      region: address?.region || "",
      city: address?.city || "",
      quarter: address?.quarter || "",
      details: address?.details || "",
    });
    setModal(item ? { kind: "school", mode: "edit", item } : { kind: "school", mode: "create" });
  }

  function openAddress(item?: Address) {
    setStatus(null);
    setError(null);
    setAddressForm({
      country: item?.country || "Cameroon",
      region: item?.region || "",
      city: item?.city || "",
      quarter: item?.quarter || "",
      details: item?.details || "",
    });
    setModal(item ? { kind: "address", mode: "edit", item } : { kind: "address", mode: "create" });
  }

  async function reloadSchools() {
    await reload();
    const [nextSchools, nextAddresses] = await Promise.all([
      platformService.schools.all(),
      platformService.schools.addresses(),
    ]);
    setLocalSchools(nextSchools as School[]);
    setLocalAddresses(nextAddresses as Address[]);
  }

  function hasAddressFields(form: SchoolForm) {
    return Boolean(form.country || form.region || form.city || form.quarter || form.details);
  }

  async function save() {
    if (!modal) return;
    setSaving(true);
    setError(null);
    try {
      if (modal.kind === "school") {
        let addressId = schoolForm.address_id || null;
        const addressPayload = {
          country: schoolForm.country || "Cameroon",
          region: schoolForm.region || null,
          city: schoolForm.city || null,
          quarter: schoolForm.quarter || null,
          details: schoolForm.details || null,
        };
        if (addressId && hasAddressFields(schoolForm)) {
          await platformService.schools.updateAddress(addressId, addressPayload);
        } else if (!addressId && hasAddressFields(schoolForm)) {
          const createdAddress = await platformService.schools.createAddress(addressPayload);
          addressId = (createdAddress as Address).id;
        }
        const payload = {
          name: schoolForm.name.trim(),
          type: schoolForm.type.trim() || null,
          address_id: addressId as UUID | null,
        };
        if (modal.mode === "edit") {
          await platformService.schools.updateSchool(modal.item.id, payload);
        } else {
          await platformService.schools.createSchool(payload);
        }
      } else {
        const payload = {
          country: addressForm.country || "Cameroon",
          region: addressForm.region || null,
          city: addressForm.city || null,
          quarter: addressForm.quarter || null,
          details: addressForm.details || null,
        };
        if (modal.mode === "edit") {
          await platformService.schools.updateAddress(modal.item.id, payload);
        } else {
          await platformService.schools.createAddress(payload);
        }
      }
      await reloadSchools();
      setStatus(t("common.success"));
      setModal(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorSave"));
    } finally {
      setSaving(false);
    }
  }

  async function removeSchool(school: School) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    setStatus(null);
    setError(null);
    try {
      await platformService.schools.deleteSchool(school.id);
      setLocalSchools(schools.filter((item) => item.id !== school.id));
      await reload();
      setStatus(t("admin.deleted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorDelete"));
    }
  }

  async function removeAddress(address: Address) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    setStatus(null);
    setError(null);
    try {
      await platformService.schools.deleteAddress(address.id);
      setLocalAddresses(addresses.filter((item) => item.id !== address.id));
      await reload();
      setStatus(t("admin.deleted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorDelete"));
    }
  }

  return (
    <section className="grid gap-5">
      <AdminBlock
        title={t("admin.schools")}
        actionLabel={t("action.addSchool")}
        canManage={canManage}
        onAdd={() => openSchool()}
      >
        {schools.map((school) => (
          <AdminRow
            key={school.id}
            title={school.name}
            subtitle={`${school.type || t("admin.school")} - ${addressLabel(addressById.get(school.address_id || ""))}`}
            canManage={canManage}
            onEdit={() => openSchool(school)}
            onDelete={() => removeSchool(school)}
          />
        ))}
        {!schools.length && (
          <EmptyState title={t("admin.emptySchools")} message={t("admin.emptySchoolsHelp")} />
        )}
      </AdminBlock>

      <AdminBlock
        title={t("admin.addresses")}
        actionLabel={t("action.addAddress")}
        canManage={canManage}
        onAdd={() => openAddress()}
      >
        {addresses.map((address) => (
          <AdminRow
            key={address.id}
            title={addressLabel(address)}
            subtitle={[address.quarter, address.details].filter(Boolean).join(" - ")}
            canManage={canManage}
            onEdit={() => openAddress(address)}
            onDelete={() => removeAddress(address)}
          />
        ))}
        {!addresses.length && (
          <EmptyState title={t("admin.emptyAddresses")} message={t("admin.emptyAddressesHelp")} />
        )}
      </AdminBlock>

      {status && <p className="text-sm font-black text-[#0f5f3a]">{status}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

      {modal?.kind === "school" && (
        <CrudModal
          title={modal.mode === "edit" ? t("admin.editSchool") : t("action.addSchool")}
          loading={saving}
          error={error}
          user={user}
          onClose={() => setModal(null)}
          onSubmit={save}
        >
          <LabeledInput label={t("admin.schoolName")} value={schoolForm.name} onChange={(value) => setSchoolForm((current) => ({ ...current, name: value }))} />
          <LabeledInput label={t("admin.schoolType")} value={schoolForm.type} onChange={(value) => setSchoolForm((current) => ({ ...current, type: value }))} />
          <label className="grid gap-2">
            <span className="text-sm font-black text-[#071d3a]">{t("admin.address")}</span>
            <select
              value={schoolForm.address_id}
              onChange={(event) => {
                const nextAddress = addressById.get(event.target.value);
                setSchoolForm((current) => ({
                  ...current,
                  address_id: event.target.value,
                  country: nextAddress?.country || current.country,
                  region: nextAddress?.region || "",
                  city: nextAddress?.city || "",
                  quarter: nextAddress?.quarter || "",
                  details: nextAddress?.details || "",
                }));
              }}
              className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]"
            >
              <option value="">{t("admin.newAddress")}</option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>{addressLabel(address)}</option>
              ))}
            </select>
          </label>
          <AddressFields form={schoolForm} t={t} onChange={(key, value) => setSchoolForm((current) => ({ ...current, [key]: value }))} />
        </CrudModal>
      )}

      {modal?.kind === "address" && (
        <CrudModal
          title={modal.mode === "edit" ? t("admin.editAddress") : t("action.addAddress")}
          loading={saving}
          error={error}
          user={user}
          onClose={() => setModal(null)}
          onSubmit={save}
        >
          <AddressFields form={addressForm} t={t} onChange={(key, value) => setAddressForm((current) => ({ ...current, [key]: value }))} />
        </CrudModal>
      )}
    </section>
  );
}

function AdminBlock({
  title,
  actionLabel,
  canManage,
  children,
  onAdd,
}: {
  title: string;
  actionLabel: string;
  canManage: boolean;
  children: ReactNode;
  onAdd: () => void;
}) {
  return (
    <section className="ds-card rounded-[1.75rem] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-black text-[#071d3a]">{title}</h3>
        {canManage && (
          <button type="button" onClick={onAdd} className="ds-button-primary inline-flex items-center gap-2">
            <Plus size={18} />
            {actionLabel}
          </button>
        )}
      </div>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function AdminRow({
  title,
  subtitle,
  canManage,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center">
      <div>
        <p className="font-black text-[#071d3a]">{title}</p>
        {subtitle && <p className="mt-1 text-sm font-bold text-slate-500">{subtitle}</p>}
      </div>
      {canManage && (
        <div className="flex gap-2">
          <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#071d3a] shadow-sm">
            <Pencil size={16} />
            {t("action.edit")}
          </button>
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-700">
            <Trash2 size={16} />
            {t("action.delete")}
          </button>
        </div>
      )}
    </div>
  );
}

function AddressFields({
  form,
  t,
  onChange,
}: {
  form: AddressForm;
  t: (key: string) => string;
  onChange: (key: keyof AddressForm, value: string) => void;
}) {
  return (
    <>
      <LabeledInput label={t("admin.country")} value={form.country} onChange={(value) => onChange("country", value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledInput label={t("admin.region")} value={form.region} onChange={(value) => onChange("region", value)} />
        <LabeledInput label={t("admin.city")} value={form.city} onChange={(value) => onChange("city", value)} />
      </div>
      <LabeledInput label={t("admin.quarter")} value={form.quarter} onChange={(value) => onChange("quarter", value)} />
      <LabeledInput label={t("admin.details")} value={form.details} onChange={(value) => onChange("details", value)} />
    </>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#071d3a]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]"
      />
    </label>
  );
}
