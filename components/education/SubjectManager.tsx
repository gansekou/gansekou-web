"use client";

import Link from "next/link";
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import {
  canCreateSubjectEducation,
  canDeleteSubjectEducation,
  canEditSubjectEducation,
} from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { Level, Specialty, Subject } from "@/types/platform";
import type { User } from "@/types/user";

export function SubjectManager({
  user,
  subjects,
  levels,
  specialties,
  reload,
}: {
  user: User;
  subjects: Subject[];
  levels: Level[];
  specialties: Specialty[];
  reload: () => Promise<void>;
}) {
  const { language, t } = useI18n(user);
  const [query, setQuery] = useState("");
  const [levelId, setLevelId] = useState("");
  const [localSubjects, setLocalSubjects] = useState<Subject[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentSubjects = localSubjects ?? subjects;
  const canCreate = canCreateSubjectEducation(user);
  const canEdit = canEditSubjectEducation(user);
  const canDelete = canDeleteSubjectEducation(user);

  const levelById = useMemo(() => new Map(levels.map((level) => [level.id, level])), [levels]);
  const specialtyById = useMemo(
    () => new Map(specialties.map((specialty) => [specialty.id, specialty])),
    [specialties]
  );
  const filtered = currentSubjects.filter((subject) => {
    const label = `${subject.name_fr} ${subject.name_en}`.toLowerCase();
    return (
      (!query || label.includes(query.toLowerCase())) &&
      (!levelId || subject.level_id === levelId)
    );
  });

  async function remove(subject: Subject) {
    if (!window.confirm(t("subject.confirmDelete"))) return;
    setStatus(null);
    setError(null);
    try {
      await platformService.education.deleteSubject(subject.id);
      setLocalSubjects(currentSubjects.filter((item) => item.id !== subject.id));
      await reload();
      setStatus(t("admin.deleted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorDelete"));
    }
  }

  return (
    <section className="grid gap-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#071d3a] p-7 text-white shadow-2xl shadow-[#071d3a]/20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">
              {t("subject.subjects")}
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">{t("subject.subjects")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              {t("subject.structureHelp")}
            </p>
          </div>
          {canCreate && (
            <Link href="/subjects/new" className="ds-button-premium inline-flex items-center gap-2">
              <Plus size={18} />
              {t("subject.add")}
            </Link>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
        <div className="grid gap-3 md:grid-cols-[1fr_280px]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("common.search")}
              className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#0f5f3a]"
            />
          </label>
          <select
            value={levelId}
            onChange={(event) => setLevelId(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#0f5f3a]"
          >
            <option value="">{t("subject.linkedLevel")}</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {language === "EN" ? level.name_en : level.name_fr}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((subject) => {
            const level = levelById.get(subject.level_id);
            const specialty = subject.specialty_id ? specialtyById.get(subject.specialty_id) : null;
            return (
              <article key={subject.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#071d3a]">
                      {language === "EN" ? subject.name_en : subject.name_fr}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-500">
                      {language === "EN" ? subject.name_fr : subject.name_en}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f6c445] px-3 py-1 text-xs font-black text-[#071d3a]">
                    {t("subject.coefficient")} {subject.coefficient}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#0f5f3a]">
                    {level ? (language === "EN" ? level.name_en : level.name_fr) : t("admin.noCycle")}
                  </span>
                  {specialty && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                      {language === "EN" ? specialty.name_en : specialty.name_fr}
                    </span>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/subjects/${subject.id}`} className="inline-flex items-center gap-2 rounded-full bg-[#0f5f3a] px-4 py-2 text-sm font-black text-white">
                    <BookOpen size={16} />
                    {t("subject.view")}
                  </Link>
                  {canEdit && (
                    <Link href={`/subjects/${subject.id}/edit`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#071d3a] shadow-sm">
                      <Pencil size={16} />
                      {t("action.edit")}
                    </Link>
                  )}
                  {canDelete && (
                    <button type="button" onClick={() => remove(subject)} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-700">
                      <Trash2 size={16} />
                      {t("action.delete")}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {!filtered.length && (
          <EmptyState title={t("subject.empty")} message={t("subject.emptyHelp")} />
        )}
      </section>

      {status && <p className="text-sm font-black text-[#0f5f3a]">{status}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    </section>
  );
}
