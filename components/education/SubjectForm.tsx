"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { EmptyState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import {
  canCreateSubjectEducation,
  canEditSubjectEducation,
} from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { Level, Specialty, Subject } from "@/types/platform";
import type { User } from "@/types/user";

export function SubjectForm({
  user,
  subject,
  levels,
  specialties,
  reload,
}: {
  user: User;
  subject?: Subject | null;
  levels: Level[];
  specialties: Specialty[];
  reload: () => Promise<void>;
}) {
  const router = useRouter();
  const { language, t } = useI18n(user);
  const canSubmit = subject ? canEditSubjectEducation(user) : canCreateSubjectEducation(user);
  const [form, setForm] = useState({
    name_fr: subject?.name_fr || "",
    name_en: subject?.name_en || "",
    level_id: subject?.level_id || "",
    specialty_id: subject?.specialty_id || "",
    coefficient: String(subject?.coefficient || 1),
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setStatus(null);
    setError(null);
    if (!form.name_fr.trim() || !form.name_en.trim() || !form.level_id) {
      setError(t("subject.validation"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        level_id: form.level_id,
        specialty_id: form.specialty_id || null,
        name_fr: form.name_fr.trim(),
        name_en: form.name_en.trim(),
        coefficient: Number(form.coefficient) || 1,
      };
      const saved = subject
        ? await platformService.education.updateSubject(subject.id, payload)
        : await platformService.education.createSubject(payload);
      await reload();
      setStatus(t("common.success"));
      router.push(`/subjects/${saved.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorSave"));
    } finally {
      setSaving(false);
    }
  }

  if (!canSubmit) {
    return <EmptyState title={t("subject.notAllowed")} message={t("subject.notAllowedHelp")} />;
  }

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#b88a00]">
        {t("subject.subjects")}
      </p>
      <h3 className="mt-2 text-3xl font-black text-[#071d3a]">
        {subject ? t("subject.edit") : t("subject.add")}
      </h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label={t("subject.frenchName")}>
          <input value={form.name_fr} onChange={(event) => setForm((current) => ({ ...current, name_fr: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]" />
        </Field>
        <Field label={t("subject.englishName")}>
          <input value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]" />
        </Field>
        <Field label={t("subject.linkedLevel")}>
          <select value={form.level_id} onChange={(event) => setForm((current) => ({ ...current, level_id: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]">
            <option value="">{t("subject.linkedLevel")}</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {language === "EN" ? level.name_en : level.name_fr}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-black text-[#071d3a]">{t("specialty.optional")}</span>
            <Link href="/admin/education" className="text-sm font-black text-[#0f5f3a] hover:underline">
              {t("specialty.manage")}
            </Link>
          </div>
          <select value={form.specialty_id} onChange={(event) => setForm((current) => ({ ...current, specialty_id: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]">
            <option value="">{specialties.length ? t("subject.noSpecialty") : t("specialty.noneAvailable")}</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {language === "EN" ? specialty.name_en : specialty.name_fr}
              </option>
            ))}
          </select>
        </div>
        <Field label={t("subject.coefficient")}>
          <input type="number" min="1" value={form.coefficient} onChange={(event) => setForm((current) => ({ ...current, coefficient: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]" />
        </Field>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={submit} disabled={saving} className="ds-button-primary disabled:opacity-60">
          {saving ? t("common.loading") : t("action.save")}
        </button>
        <button type="button" onClick={() => router.push("/subjects")} disabled={saving} className="rounded-full bg-slate-100 px-6 py-3 font-black text-[#071d3a] disabled:opacity-60">
          {t("action.cancel")}
        </button>
      </div>
      {status && <p className="mt-4 text-sm font-black text-[#0f5f3a]">{status}</p>}
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#071d3a]">
      {label}
      {children}
    </label>
  );
}
