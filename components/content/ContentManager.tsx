"use client";

import Link from "next/link";
import { Archive, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import {
  canArchiveContent,
  canCreateContent,
  canDeleteContent,
  canEditContent,
  canPublishContent,
} from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Level, Specialty, Subject } from "@/types/platform";
import type { User } from "@/types/user";

type ContentScope = "admin" | "teacher" | "courses" | "exercises" | "subjects";

export function ContentManager({
  user,
  contents,
  subjects,
  levels,
  scope,
  reviewOnly = false,
  basePathOverride,
  createLabel,
  createAllowed,
  title,
  reload,
}: {
  user: User;
  contents: Content[];
  subjects: Subject[];
  levels: Level[];
  specialties?: Specialty[];
  scope: ContentScope;
  reviewOnly?: boolean;
  basePathOverride?: string;
  createLabel?: string;
  createAllowed?: boolean;
  title?: string;
  reload: () => Promise<void>;
}) {
  const { t } = useI18n(user);
  const [localContents, setLocalContents] = useState<Content[] | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(reviewOnly ? "PENDING" : "");
  const [typeFilter, setTypeFilter] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentContents = localContents ?? contents;
  const basePath = basePathOverride || (scope === "admin" ? "/admin/contents" : scope === "teacher" ? "/teacher/contents" : scope === "exercises" ? "/exercises" : scope === "subjects" ? "/subjects" : "/courses");
  const subjectById = useMemo(() => new Map(subjects.map((item) => [item.id, item])), [subjects]);
  const levelById = useMemo(() => new Map(levels.map((item) => [item.id, item])), [levels]);
  const types = Array.from(new Set(currentContents.map((item) => item.content_type).filter(Boolean)));
  const statuses = ["", "PENDING", "APPROVED", "ARCHIVED"];
  const filtered = currentContents.filter((item) => {
    const label = `${item.title || ""} ${item.description || ""} ${item.content_type} ${item.tags || ""}`.toLowerCase();
    return (
      (!query || label.includes(query.toLowerCase())) &&
      (!statusFilter || item.status === statusFilter) &&
      (!typeFilter || item.content_type === typeFilter) &&
      (!subjectId || item.subject_id === subjectId) &&
      (!levelId || item.level_id === levelId) &&
      (!premiumOnly || item.is_premium)
    );
  });
  const visibleContents = filtered.slice(0, visibleCount);

  function resetVisibleCount() {
    setVisibleCount(24);
  }

  async function moderate(content: Content, action: "publish" | "archive" | "delete") {
    if (!window.confirm(t(action === "delete" ? "content.confirmDelete" : "content.confirmModeration"))) return;
    setMessage(null);
    setError(null);
    try {
      if (action === "delete") {
        await platformService.contents.remove(content.id);
        setLocalContents(currentContents.filter((item) => item.id !== content.id));
        await reload();
        setMessage(t("admin.deleted"));
        return;
      }
      const updated = action === "publish"
        ? await platformService.contents.publish(content.id)
        : await platformService.contents.archive(content.id);
      setLocalContents(currentContents.map((item) => (item.id === content.id ? updated : item)));
      await reload();
      setMessage(t("common.success"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorSave"));
    }
  }

  return (
    <section className="grid gap-5">
      <section className="rounded-[2rem] bg-[#071d3a] p-7 text-white shadow-2xl shadow-[#071d3a]/20">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{t("content.content")}</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">{title || (reviewOnly ? t("content.pendingReview") : t("content.content"))}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {scope === "admin" && <Link href="/admin/contents/review" className="rounded-full bg-white/10 px-5 py-3 font-black text-white">{t("content.pendingReview")}</Link>}
            {(createAllowed ?? canCreateContent(user)) && <Link href={`${basePath}/new`} className="ds-button-premium inline-flex items-center gap-2"><Plus size={18} />{createLabel || t("content.add")}</Link>}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
        <div className="grid gap-3 lg:grid-cols-6">
          <label className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(event) => { setQuery(event.target.value); resetVisibleCount(); }} placeholder={t("common.search")} className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-bold outline-none" />
          </label>
          <FilterSelect value={statusFilter} onChange={(value) => { setStatusFilter(value); resetVisibleCount(); }} options={statuses} labels={{ "": t("content.all"), PENDING: t("content.pendingReview"), APPROVED: t("content.published"), ARCHIVED: t("content.archived") }} />
          <FilterSelect value={typeFilter} onChange={(value) => { setTypeFilter(value); resetVisibleCount(); }} options={["", ...types]} labels={{ "": "Type" }} />
          <select value={subjectId} onChange={(event) => { setSubjectId(event.target.value); resetVisibleCount(); }} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none">
            <option value="">{t("common.subject")}</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name_fr}</option>)}
          </select>
          <button type="button" onClick={() => { setPremiumOnly((current) => !current); resetVisibleCount(); }} className={`rounded-2xl px-4 py-3 text-sm font-black ${premiumOnly ? "bg-[#f6c445] text-[#071d3a]" : "bg-slate-100 text-slate-600"}`}>Premium</button>
          <select value={levelId} onChange={(event) => { setLevelId(event.target.value); resetVisibleCount(); }} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none lg:col-span-2">
            <option value="">{t("common.level")}</option>
            {levels.map((level) => <option key={level.id} value={level.id}>{level.name_fr}</option>)}
          </select>
        </div>

        <div className="mt-6 grid gap-4">
          {visibleContents.map((content, index) => (
            <article key={`content-row-${scope}-${content.id}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-[#071d3a]">{content.title || `${content.content_type} ${content.id.slice(0, 8)}`}</h3>
                    <StatusBadge status={content.status} t={t} />
                    {content.is_premium && <span className="rounded-full bg-[#f6c445] px-3 py-1 text-xs font-black text-[#071d3a]">Premium</span>}
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-500">
                    {content.content_type} - {subjectById.get(content.subject_id)?.name_fr || "-"} - {levelById.get(content.level_id)?.name_fr || "-"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{content.created_at || "-"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`${basePath}/${content.id}`} className="inline-flex items-center gap-2 rounded-full bg-[#0f5f3a] px-4 py-2 text-sm font-black text-white"><Eye size={16} />{t("content.details")}</Link>
                  {canEditContent(user, content) && <Link href={`${basePath}/${content.id}/edit`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#071d3a] shadow-sm"><Pencil size={16} />{t("action.edit")}</Link>}
                  {canPublishContent(user) && content.status !== "APPROVED" && <button type="button" onClick={() => moderate(content, "publish")} className="rounded-full bg-[#f6c445] px-4 py-2 text-sm font-black text-[#071d3a]">{t("content.publish")}</button>}
                  {canArchiveContent(user) && content.status !== "ARCHIVED" && <button type="button" onClick={() => moderate(content, "archive")} className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-black text-[#071d3a]"><Archive size={16} />{t("content.archive")}</button>}
                  {canDeleteContent(user, content) && <button type="button" onClick={() => moderate(content, "delete")} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-700"><Trash2 size={16} />{t("action.delete")}</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
        {filtered.length > visibleContents.length && (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + 24)}
            className="mt-5 w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-[#071d3a] transition hover:bg-[#e8f5ee]"
          >
            Charger plus ({visibleContents.length}/{filtered.length})
          </button>
        )}
        {!filtered.length && <EmptyState title={t("content.empty")} message={t("content.emptyHelp")} />}
      </section>
      {message && <p className="text-sm font-black text-[#0f5f3a]">{message}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    </section>
  );
}

function FilterSelect({ value, onChange, options, labels }: { value: string; onChange: (value: string) => void; options: string[]; labels: Record<string, string> }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none">
      {options.map((option, index) => <option key={`filter-option-${option}-${index}`} value={option}>{labels[option] || option}</option>)}
    </select>
  );
}

export function StatusBadge({ status, t }: { status?: string; t: (key: string) => string }) {
  const label = status === "APPROVED" ? t("content.published") : status === "ARCHIVED" ? t("content.archived") : status === "PENDING" ? t("content.pendingReview") : status || "-";
  const color = status === "APPROVED" ? "bg-[#0f5f3a]/10 text-[#0f5f3a]" : status === "ARCHIVED" ? "bg-slate-200 text-slate-600" : "bg-[#f6c445] text-[#071d3a]";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${color}`}>{label}</span>;
}
