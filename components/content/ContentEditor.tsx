"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import { canCreateContent, canEditContent, isAdminRole } from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Level, Specialty, Subject } from "@/types/platform";
import type { User } from "@/types/user";

const inputClass = "rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]";

export function ContentEditor({
  user,
  content,
  subjects,
  levels,
  specialties,
  defaultType = "COURS",
  scope,
  lockedType,
  redirectBasePath,
  reload,
}: {
  user: User;
  content: Content | null;
  subjects: Subject[];
  levels: Level[];
  specialties: Specialty[];
  defaultType?: string;
  scope: "admin" | "teacher" | "courses" | "exercises" | "subjects";
  lockedType?: string;
  redirectBasePath?: string;
  reload: () => Promise<void>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n(user);
  const canSubmit = content ? canEditContent(user, content) : canCreateContent(user);
  const [form, setForm] = useState({
    title: content?.title || "",
    description: content?.description || "",
    subject_id: content?.subject_id || searchParams.get("subject_id") || "",
    level_id: content?.level_id || searchParams.get("level_id") || "",
    specialty_id: content?.specialty_id || "",
    content_type: lockedType || content?.content_type || defaultType,
    file_url: content?.file_url || "",
    thumbnail_url: content?.thumbnail_url || "",
    status: content?.status || "PENDING",
    is_premium: Boolean(content?.is_premium),
    is_available_offline: Boolean(content?.is_available_offline),
    difficulty_level: content?.difficulty_level || "",
    estimated_duration_minutes: content?.estimated_duration_minutes ? String(content.estimated_duration_minutes) : "",
    tags: content?.tags || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!canSubmit) return;
    setStatus(null);
    setError(null);
    if (!form.subject_id || !form.level_id || !form.content_type) {
      setError(t("content.validation"));
      return;
    }

    setSaving(true);
    try {
      let fileUrl = form.file_url || null;
      let thumbnailUrl = form.thumbnail_url || null;
      if (file) {
        const upload =
          form.content_type === "VIDEO"
            ? await platformService.uploads.contentVideo(file)
            : form.content_type === "AUDIO"
              ? await platformService.uploads.contentAudio(file)
              : await platformService.uploads.contentFile(file);
        fileUrl = upload.file_url;
      }
      if (thumbnail) thumbnailUrl = (await platformService.uploads.contentThumbnail(thumbnail)).file_url;

      const payload = {
        author_id: content?.author_id || user.id,
        subject_id: form.subject_id,
        level_id: form.level_id,
        specialty_id: form.specialty_id || null,
        content_type: lockedType || form.content_type,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
        status: isAdminRole(user) ? form.status : "PENDING",
        is_premium: form.is_premium,
        is_available_offline: form.is_available_offline,
        version: content?.version || 1,
        title: form.title || null,
        description: form.description || null,
        difficulty_level: form.difficulty_level || null,
        estimated_duration_minutes: form.estimated_duration_minutes ? Number(form.estimated_duration_minutes) : null,
        tags: form.tags || null,
      };

      const saved = content
        ? await platformService.contents.update(content.id, payload)
        : await platformService.contents.create(payload);

      if (form.title.trim()) {
        await platformService.contents.createTranslation({
          content_id: saved.id,
          language: "FR",
          title: form.title.trim(),
          description: form.description.trim() || undefined,
        }).catch(() => undefined);
      }

      await reload();
      setStatus(t("common.success"));
      const basePath = redirectBasePath || (scope === "admin" ? "/admin/contents" : scope === "teacher" ? "/teacher/contents" : scope === "exercises" ? "/exercises" : scope === "subjects" ? "/subjects" : "/courses");
      router.push(`${basePath}/${saved.id}`);
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
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#b88a00]">{t("content.content")}</p>
      <h3 className="mt-2 text-3xl font-black text-[#071d3a]">{content ? t("content.edit") : t("content.add")}</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label={t("content.title")}><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClass} /></Field>
        <Field label={t("content.type")}>
          {lockedType ? (
            <input value={lockedType} readOnly className={`${inputClass} bg-slate-50`} />
          ) : (
            <select value={form.content_type} onChange={(event) => setForm((current) => ({ ...current, content_type: event.target.value }))} className={inputClass}>{["COURS", "EXERCICE", "SUJET"].map((type, index) => <option key={`content-type-${type}-${index}`}>{type}</option>)}</select>
          )}
        </Field>
        <Field label={t("common.level")}><select value={form.level_id} onChange={(event) => setForm((current) => ({ ...current, level_id: event.target.value }))} className={inputClass}><option value="">{t("common.level")}</option>{levels.map((level) => <option key={level.id} value={level.id}>{level.name_fr}</option>)}</select></Field>
        <Field label={t("common.subject")}><select value={form.subject_id} onChange={(event) => setForm((current) => ({ ...current, subject_id: event.target.value }))} className={inputClass}><option value="">{t("common.subject")}</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name_fr}</option>)}</select></Field>
        <Field label={t("subject.specialty")}><select value={form.specialty_id} onChange={(event) => setForm((current) => ({ ...current, specialty_id: event.target.value }))} className={inputClass}><option value="">{t("subject.noSpecialty")}</option>{specialties.map((specialty) => <option key={specialty.id} value={specialty.id}>{specialty.name_fr}</option>)}</select></Field>
        <Field label={t("content.difficulty")}><input value={form.difficulty_level} onChange={(event) => setForm((current) => ({ ...current, difficulty_level: event.target.value }))} className={inputClass} /></Field>
        <Field label={t("content.duration")}><input type="number" value={form.estimated_duration_minutes} onChange={(event) => setForm((current) => ({ ...current, estimated_duration_minutes: event.target.value }))} className={inputClass} /></Field>
        <Field label={t("content.tags")}><input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} className={inputClass} /></Field>
        {isAdminRole(user) && <Field label={t("common.status")}><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className={inputClass}><option value="PENDING">{t("content.pendingReview")}</option><option value="APPROVED">{t("content.published")}</option><option value="ARCHIVED">{t("content.archived")}</option></select></Field>}
      </div>
      <Field label={t("content.description")}><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className={`${inputClass} min-h-32`} /></Field>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <UploadField label={t("content.mainFile")} file={file} onChange={setFile} accept={form.content_type === "VIDEO" ? "video/*" : form.content_type === "AUDIO" ? "audio/*" : undefined} />
        <UploadField label={t("content.thumbnail")} file={thumbnail} onChange={setThumbnail} accept="image/*" />
      </div>
      <div className="mt-5 flex flex-wrap gap-4">
        <Check label="Premium" checked={form.is_premium} onChange={(value) => setForm((current) => ({ ...current, is_premium: value }))} />
        <Check label={t("content.offline")} checked={form.is_available_offline} onChange={(value) => setForm((current) => ({ ...current, is_available_offline: value }))} />
      </div>
      <button onClick={submit} disabled={saving} className="mt-6 rounded-full bg-[#0f5f3a] px-6 py-3 font-black text-white disabled:opacity-60">{saving ? t("common.loading") : t("action.save")}</button>
      {status && <p className="mt-4 text-sm font-black text-[#0f5f3a]">{status}</p>}
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 grid gap-2 text-sm font-black text-[#071d3a]">{label}{children}</label>;
}

function UploadField({ label, file, accept, onChange }: { label: string; file: File | null; accept?: string; onChange: (file: File | null) => void }) {
  return <label className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-500">{file?.name || label}<input className="hidden" type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0] || null)} /></label>;
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}
