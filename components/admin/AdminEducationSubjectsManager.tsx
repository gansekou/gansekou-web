"use client";

import { CheckCircle2, CircleSlash, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CrudModal } from "@/components/admin/CrudModal";
import { EmptyState } from "@/components/app/StateViews";
import { ApiError } from "@/lib/api";
import { canManageEducation } from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { EducationCycle, Level, PageData, Quiz, Specialty, Subject, UUID } from "@/types/platform";
import type { Question } from "@/types/question";
import type { User } from "@/types/user";

type SubjectForm = {
  code: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  icon: string;
  color: string;
  cycle_id: string;
  level_id: string;
  specialty_id: string;
  is_active: boolean;
};

type ModalState =
  | { mode: "create"; item?: undefined }
  | { mode: "edit"; item: Subject };

const pageSize = 10;

export function AdminEducationSubjectsManager({
  data,
  reload,
  user,
}: {
  data: PageData;
  reload: () => Promise<void>;
  user: User;
}) {
  const canManage = canManageEducation(user);
  const [localSubjects, setLocalSubjects] = useState<Subject[] | null>(null);
  const [query, setQuery] = useState("");
  const [cycleId, setCycleId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [form, setForm] = useState<SubjectForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dataSubjects = useMemo(() => (data.subjects as Subject[]) || [], [data.subjects]);
  const cycles = useMemo(() => (data.cycles as EducationCycle[]) || [], [data.cycles]);
  const levels = useMemo(() => (data.levels as Level[]) || [], [data.levels]);
  const specialties = useMemo(() => (data.specialties as Specialty[]) || [], [data.specialties]);
  const contents = useMemo(() => (data.contents as Content[]) || [], [data.contents]);
  const quizzes = useMemo(() => (data.quizzes as Quiz[]) || [], [data.quizzes]);
  const questions = useMemo(() => (data.questions as Question[]) || [], [data.questions]);
  const subjects = localSubjects ?? dataSubjects;

  const cycleById = useMemo(() => new Map(cycles.map((cycle) => [cycle.id, cycle])), [cycles]);
  const levelById = useMemo(() => new Map(levels.map((level) => [level.id, level])), [levels]);
  const specialtyById = useMemo(() => new Map(specialties.map((specialty) => [specialty.id, specialty])), [specialties]);
  const dependenciesBySubject = useMemo(() => {
    const counts = new Map<string, number>();
    for (const content of contents) increment(counts, content.subject_id);
    for (const quiz of quizzes) increment(counts, quiz.subject_id);
    for (const question of questions) increment(counts, question.subject_id || undefined);
    return counts;
  }, [contents, questions, quizzes]);

  const visibleLevels = useMemo(
    () => levels.filter((level) => !form.cycle_id || level.cycle_id === form.cycle_id),
    [form.cycle_id, levels]
  );

  const filtered = subjects.filter((subject) => {
    const level = levelById.get(subject.level_id);
    const haystack = [
      subject.code,
      subject.name_fr,
      subject.name_en,
      subject.description_fr,
      subject.description_en,
      level?.name_fr,
      level?.name_en,
    ].filter(Boolean).join(" ").toLowerCase();
    const active = subject.is_active !== false;
    return (
      (!query || haystack.includes(query.toLowerCase())) &&
      (!cycleId || level?.cycle_id === cycleId) &&
      (!levelId || subject.level_id === levelId) &&
      (!specialtyId || subject.specialty_id === specialtyId) &&
      (!statusFilter || (statusFilter === "active" ? active : !active))
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedSubjects = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function setField<K extends keyof SubjectForm>(key: K, value: SubjectForm[K]) {
    setForm((current) => {
      if (key === "cycle_id") {
        return { ...current, cycle_id: String(value), level_id: "" };
      }
      return { ...current, [key]: value };
    });
  }

  function openSubject(item?: Subject) {
    const level = item ? levelById.get(item.level_id) : null;
    setError(null);
    setStatus(null);
    setForm({
      code: item?.code || buildCode(item?.name_fr || ""),
      name_fr: item?.name_fr || "",
      name_en: item?.name_en || "",
      description_fr: item?.description_fr || "",
      description_en: item?.description_en || "",
      icon: item?.icon || "",
      color: item?.color || "#0f5f3a",
      cycle_id: level?.cycle_id || cycles[0]?.id || "",
      level_id: item?.level_id || "",
      specialty_id: item?.specialty_id || "",
      is_active: item?.is_active !== false,
    });
    setModal(item ? { mode: "edit", item } : { mode: "create" });
  }

  async function refreshSubjects(message: string) {
    await reload();
    setLocalSubjects(await platformService.education.subjects());
    setStatus(message);
  }

  async function save() {
    if (!modal) return;
    if (!form.code.trim() || !form.name_fr.trim() || !form.name_en.trim() || !form.level_id) {
      setError("Code, nom francais, nom anglais et niveau sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = subjectPayload(form);
      if (modal.mode === "edit") {
        await platformService.education.updateSubject(modal.item.id, payload);
      } else {
        await platformService.education.createSubject(payload);
      }
      await refreshSubjects("Matiere enregistree.");
      setModal(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer cette matiere.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(subject: Subject) {
    setStatus(null);
    setError(null);
    try {
      await platformService.education.updateSubject(subject.id, {
        level_id: subject.level_id,
        specialty_id: subject.specialty_id || null,
        code: subject.code || buildCode(subject.name_fr),
        name_fr: subject.name_fr,
        name_en: subject.name_en,
        description_fr: subject.description_fr || null,
        description_en: subject.description_en || null,
        icon: subject.icon || null,
        color: subject.color || null,
        is_active: subject.is_active === false,
        coefficient: subject.coefficient || 1,
      });
      await refreshSubjects(subject.is_active === false ? "Matiere activee." : "Matiere desactivee.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de modifier le statut.");
    }
  }

  async function removeSubject(subject: Subject) {
    const dependencies = dependenciesBySubject.get(subject.id) || 0;
    if (dependencies > 0) {
      setError("Suppression impossible: cette matiere est deja utilisee.");
      return;
    }
    if (!window.confirm("Confirmer la suppression de cette matiere ?")) return;
    setStatus(null);
    setError(null);
    try {
      await platformService.education.deleteSubject(subject.id);
      setLocalSubjects(subjects.filter((item) => item.id !== subject.id));
      await reload();
      setStatus("Matiere supprimee.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Suppression impossible pour cette matiere.");
    }
  }

  return (
    <section className="grid gap-5">
      <section className="ds-card rounded-[1.75rem] p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#b88a00]">Administration / Education</p>
            <h2 className="mt-2 text-3xl font-black text-[#071d3a]">Matieres</h2>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-500">
              Gere le catalogue des disciplines utilisees par les contenus, quiz, questions eleves et enseignants.
            </p>
          </div>
          {canManage && (
            <button type="button" onClick={() => openSubject()} className="ds-button-primary inline-flex items-center gap-2">
              <Plus size={18} />
              Ajouter une matiere
            </button>
          )}
        </div>
      </section>

      <section className="ds-card rounded-[1.75rem] p-6">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Rechercher par code, nom ou description"
              className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#0f5f3a]"
            />
          </label>
          <Filter value={cycleId} onChange={(value) => { setCycleId(value); setPage(1); }} label="Cycle" options={cycles.map((cycle) => [cycle.id, cycle.name_fr])} />
          <Filter value={levelId} onChange={(value) => { setLevelId(value); setPage(1); }} label="Niveau" options={levels.map((level) => [level.id, level.name_fr])} />
          <Filter value={specialtyId} onChange={(value) => { setSpecialtyId(value); setPage(1); }} label="Specialite" options={specialties.map((specialty) => [specialty.id, specialty.name_fr])} />
          <Filter value={statusFilter} onChange={(value) => { setStatusFilter(value); setPage(1); }} label="Statut" options={[["active", "Actif"], ["inactive", "Inactif"]]} />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
          <div className="hidden grid-cols-[1fr_1.4fr_1.4fr_1fr_1fr_1fr_0.8fr_1fr_1.2fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500 xl:grid">
            <span>Code</span>
            <span>Nom francais</span>
            <span>Nom anglais</span>
            <span>Niveau</span>
            <span>Cycle</span>
            <span>Specialite</span>
            <span>Statut</span>
            <span>Creation</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {pagedSubjects.map((subject) => {
              const level = levelById.get(subject.level_id);
              const cycle = level?.cycle_id ? cycleById.get(level.cycle_id) : null;
              const specialty = subject.specialty_id ? specialtyById.get(subject.specialty_id) : null;
              const active = subject.is_active !== false;
              const dependencies = dependenciesBySubject.get(subject.id) || 0;
              return (
                <article key={subject.id} className="grid gap-4 px-4 py-4 xl:grid-cols-[1fr_1.4fr_1.4fr_1fr_1fr_1fr_0.8fr_1fr_1.2fr] xl:items-center">
                  <Cell label="Code"><SubjectCode subject={subject} /></Cell>
                  <Cell label="Nom francais">{subject.name_fr}</Cell>
                  <Cell label="Nom anglais">{subject.name_en}</Cell>
                  <Cell label="Niveau">{level?.name_fr || "-"}</Cell>
                  <Cell label="Cycle">{cycle?.name_fr || "-"}</Cell>
                  <Cell label="Specialite">{specialty?.name_fr || "-"}</Cell>
                  <Cell label="Statut"><StatusBadge active={active} /></Cell>
                  <Cell label="Creation">{formatDate(subject.created_at)}</Cell>
                  <div className="flex flex-wrap gap-2">
                    {canManage && (
                      <>
                        <button type="button" onClick={() => openSubject(subject)} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-[#071d3a] shadow-sm">
                          <Pencil size={14} />
                          Modifier
                        </button>
                        <button type="button" onClick={() => toggleActive(subject)} className="inline-flex items-center gap-2 rounded-full bg-[#f6c445]/20 px-3 py-2 text-xs font-black text-[#071d3a]">
                          {active ? <CircleSlash size={14} /> : <CheckCircle2 size={14} />}
                          {active ? "Desactiver" : "Activer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSubject(subject)}
                          disabled={dependencies > 0}
                          title={dependencies > 0 ? "Cette matiere a des dependances" : "Supprimer"}
                          className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {!pagedSubjects.length && <EmptyState title="Aucune matiere" message="Aucune matiere ne correspond aux filtres actuels." />}

        <div className="mt-5 flex flex-col gap-3 text-sm font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{filtered.length} matiere{filtered.length > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1} className="rounded-full bg-slate-100 px-4 py-2 font-black text-[#071d3a] disabled:opacity-50">
              Precedent
            </button>
            <span>Page {currentPage} / {pageCount}</span>
            <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage >= pageCount} className="rounded-full bg-slate-100 px-4 py-2 font-black text-[#071d3a] disabled:opacity-50">
              Suivant
            </button>
          </div>
        </div>
      </section>

      {status && <p className="text-sm font-black text-[#0f5f3a]">{status}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

      {modal && (
        <CrudModal
          title={modal.mode === "edit" ? "Modifier la matiere" : "Ajouter une matiere"}
          loading={saving}
          error={error}
          user={user}
          onClose={() => setModal(null)}
          onSubmit={save}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label="Code" value={form.code} onChange={(value) => setField("code", value.toUpperCase())} />
            <LabeledInput label="Icone" value={form.icon} onChange={(value) => setField("icon", value)} placeholder="BookOpen" />
            <LabeledInput label="Nom francais" value={form.name_fr} onChange={(value) => setField("name_fr", value)} />
            <LabeledInput label="Nom anglais" value={form.name_en} onChange={(value) => setField("name_en", value)} />
            <LabeledInput label="Description francaise" value={form.description_fr} onChange={(value) => setField("description_fr", value)} />
            <LabeledInput label="Description anglaise" value={form.description_en} onChange={(value) => setField("description_en", value)} />
            <label className="grid gap-2">
              <span className="text-sm font-black text-[#071d3a]">Couleur</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <input type="color" value={form.color || "#0f5f3a"} onChange={(event) => setField("color", event.target.value)} className="size-9 rounded border-0 bg-transparent p-0" />
                <input value={form.color} onChange={(event) => setField("color", event.target.value)} className="min-w-0 flex-1 font-bold outline-none" />
              </div>
            </label>
            <SelectField label="Cycle" value={form.cycle_id} onChange={(value) => setField("cycle_id", value)} options={cycles.map((cycle) => [cycle.id, cycle.name_fr])} />
            <SelectField label="Niveau" value={form.level_id} onChange={(value) => setField("level_id", value)} options={visibleLevels.map((level) => [level.id, level.name_fr])} />
            <SelectField label="Specialite" value={form.specialty_id} onChange={(value) => setField("specialty_id", value)} options={specialties.map((specialty) => [specialty.id, specialty.name_fr])} />
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <span className="font-black text-[#071d3a]">Actif</span>
              <input type="checkbox" checked={form.is_active} onChange={(event) => setField("is_active", event.target.checked)} className="size-5 accent-[#0f5f3a]" />
            </label>
          </div>
        </CrudModal>
      )}
    </section>
  );
}

function emptyForm(): SubjectForm {
  return {
    code: "",
    name_fr: "",
    name_en: "",
    description_fr: "",
    description_en: "",
    icon: "",
    color: "#0f5f3a",
    cycle_id: "",
    level_id: "",
    specialty_id: "",
    is_active: true,
  };
}

function subjectPayload(form: SubjectForm) {
  return {
    level_id: form.level_id as UUID,
    specialty_id: (form.specialty_id || null) as UUID | null,
    code: form.code.trim(),
    name_fr: form.name_fr.trim(),
    name_en: form.name_en.trim(),
    description_fr: form.description_fr.trim() || null,
    description_en: form.description_en.trim() || null,
    icon: form.icon.trim() || null,
    color: form.color.trim() || null,
    is_active: form.is_active,
    coefficient: 1,
  };
}

function increment(counts: Map<string, number>, id?: string | null) {
  if (!id) return;
  counts.set(id, (counts.get(id) || 0) + 1);
}

function SubjectCode({ subject }: { subject: Subject }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-3 rounded-full" style={{ backgroundColor: subject.color || "#0f5f3a" }} />
      <span className="font-black text-[#071d3a]">{subject.code || buildCode(subject.name_fr)}</span>
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${active ? "bg-[#0f5f3a]/10 text-[#0f5f3a]" : "bg-slate-100 text-slate-500"}`}>
      {active ? "Actif" : "Inactif"}
    </span>
  );
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-black uppercase tracking-[0.12em] text-slate-400 xl:hidden">{label}</p>
      <div className="truncate text-sm font-bold text-slate-600">{children}</div>
    </div>
  );
}

function Filter({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: Array<[string, string]>;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#0f5f3a]">
      <option value="">{label}</option>
      {options.map(([id, name]) => <option key={`${label}-${id}`} value={id}>{name}</option>)}
    </select>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#071d3a]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]">
        <option value="">Aucun</option>
        {options.map(([id, name]) => <option key={`${label}-${id}`} value={id}>{name}</option>)}
      </select>
    </label>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#071d3a]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]"
      />
    </label>
  );
}

function buildCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20)
    .toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
