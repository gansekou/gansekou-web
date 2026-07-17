"use client";

import Link from "next/link";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CrudModal } from "@/components/admin/CrudModal";
import { EmptyState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import { canManageEducation } from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { EducationCycle, Level, PageData, Specialty, Subject, UUID } from "@/types/platform";
import type { User } from "@/types/user";

type CycleForm = {
  name_fr: string;
  name_en: string;
};

type LevelForm = CycleForm & {
  cycle_id: string;
  order_index: string;
};

type SpecialtyForm = CycleForm & {
  description_fr: string;
  description_en: string;
};

type ModalState =
  | { kind: "cycle"; mode: "create"; item?: undefined }
  | { kind: "cycle"; mode: "edit"; item: EducationCycle }
  | { kind: "level"; mode: "create"; item?: undefined }
  | { kind: "level"; mode: "edit"; item: Level }
  | { kind: "specialty"; mode: "create"; item?: undefined }
  | { kind: "specialty"; mode: "edit"; item: Specialty };

export function AdminEducationManager({
  data,
  reload,
  user,
}: {
  data: PageData;
  reload: () => Promise<void>;
  user: User;
}) {
  const { t } = useI18n(user);
  const canManage = canManageEducation(user);
  const [localCycles, setLocalCycles] = useState<EducationCycle[] | null>(null);
  const [localLevels, setLocalLevels] = useState<Level[] | null>(null);
  const [localSpecialties, setLocalSpecialties] = useState<Specialty[] | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [cycleForm, setCycleForm] = useState<CycleForm>({ name_fr: "", name_en: "" });
  const [levelForm, setLevelForm] = useState<LevelForm>({
    cycle_id: "",
    name_fr: "",
    name_en: "",
    order_index: "1",
  });
  const [specialtyForm, setSpecialtyForm] = useState<SpecialtyForm>({
    name_fr: "",
    name_en: "",
    description_fr: "",
    description_en: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dataCycles = useMemo(() => (data.cycles as EducationCycle[]) || [], [data.cycles]);
  const dataLevels = useMemo(() => (data.levels as Level[]) || [], [data.levels]);
  const dataSpecialties = useMemo(() => (data.specialties as Specialty[]) || [], [data.specialties]);
  const dataSubjects = useMemo(() => (data.subjects as Subject[]) || [], [data.subjects]);
  const cycles = localCycles ?? dataCycles;
  const levels = localLevels ?? dataLevels;
  const specialties = localSpecialties ?? dataSpecialties;

  const cycleById = useMemo(
    () => new Map(cycles.map((cycle) => [cycle.id, cycle])),
    [cycles]
  );

  function openCycle(item?: EducationCycle) {
    setError(null);
    setStatus(null);
    setCycleForm({
      name_fr: item?.name_fr || "",
      name_en: item?.name_en || "",
    });
    setModal(item ? { kind: "cycle", mode: "edit", item } : { kind: "cycle", mode: "create" });
  }

  function openLevel(item?: Level) {
    setError(null);
    setStatus(null);
    setLevelForm({
      cycle_id: item?.cycle_id || cycles[0]?.id || "",
      name_fr: item?.name_fr || "",
      name_en: item?.name_en || "",
      order_index: String(item?.order_index ?? levels.length + 1),
    });
    setModal(item ? { kind: "level", mode: "edit", item } : { kind: "level", mode: "create" });
  }

  function openSpecialty(item?: Specialty) {
    setError(null);
    setStatus(null);
    setSpecialtyForm({
      name_fr: item?.name_fr || "",
      name_en: item?.name_en || "",
      description_fr: item?.description_fr || "",
      description_en: item?.description_en || "",
    });
    setModal(item ? { kind: "specialty", mode: "edit", item } : { kind: "specialty", mode: "create" });
  }

  async function refresh(message: string) {
    await reload();
    if (modal?.kind === "cycle") {
      setLocalCycles(await platformService.education.cycles());
    } else if (modal?.kind === "level") {
      setLocalLevels(await platformService.education.levels());
    } else {
      setLocalSpecialties(await platformService.education.specialties());
    }
    setStatus(message);
  }

  async function save() {
    if (!modal) return;
    setSaving(true);
    setError(null);
    try {
      if (modal.kind === "cycle") {
        const payload = {
          name_fr: cycleForm.name_fr.trim(),
          name_en: cycleForm.name_en.trim(),
        };
        if (modal.mode === "edit") {
          await platformService.education.updateCycle(modal.item.id, payload);
        } else {
          await platformService.education.createCycle(payload);
        }
        await refresh(t("common.success"));
      } else if (modal.kind === "level") {
        const payload = {
          cycle_id: (levelForm.cycle_id || null) as UUID | null,
          name_fr: levelForm.name_fr.trim(),
          name_en: levelForm.name_en.trim(),
          order_index: Number(levelForm.order_index || 0),
        };
        if (modal.mode === "edit") {
          await platformService.education.updateLevel(modal.item.id, payload);
        } else {
          await platformService.education.createLevel(payload);
        }
        await refresh(t("common.success"));
      } else {
        const payload = {
          name_fr: specialtyForm.name_fr.trim(),
          name_en: specialtyForm.name_en.trim(),
          description_fr: specialtyForm.description_fr.trim() || null,
          description_en: specialtyForm.description_en.trim() || null,
        };
        if (modal.mode === "edit") {
          await platformService.education.updateSpecialty(modal.item.id, payload);
        } else {
          await platformService.education.createSpecialty(payload);
        }
        await refresh(t("common.success"));
      }
      setModal(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorSave"));
    } finally {
      setSaving(false);
    }
  }

  async function removeCycle(cycle: EducationCycle) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    setStatus(null);
    setError(null);
    try {
      await platformService.education.deleteCycle(cycle.id);
      setLocalCycles(cycles.filter((item) => item.id !== cycle.id));
      await reload();
      setStatus(t("admin.deleted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorDelete"));
    }
  }

  async function removeLevel(level: Level) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    setStatus(null);
    setError(null);
    try {
      await platformService.education.deleteLevel(level.id);
      setLocalLevels(levels.filter((item) => item.id !== level.id));
      await reload();
      setStatus(t("admin.deleted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorDelete"));
    }
  }

  async function removeSpecialty(specialty: Specialty) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    setStatus(null);
    setError(null);
    try {
      await platformService.education.deleteSpecialty(specialty.id);
      setLocalSpecialties(specialties.filter((item) => item.id !== specialty.id));
      await reload();
      setStatus(t("admin.deleted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorDelete"));
    }
  }

  return (
    <section className="grid gap-5">
      <AdminBlock
        title={t("admin.cycles")}
        actionLabel={t("action.addCycle")}
        canManage={canManage}
        onAdd={() => openCycle()}
      >
        {cycles.map((cycle) => (
          <AdminRow
            key={cycle.id}
            title={cycle.name_fr}
            subtitle={cycle.name_en}
            canManage={canManage}
            onEdit={() => openCycle(cycle)}
            onDelete={() => removeCycle(cycle)}
          />
        ))}
        {!cycles.length && (
          <EmptyState title={t("admin.emptyCycles")} message={t("admin.emptyCyclesHelp")} />
        )}
      </AdminBlock>

      <AdminBlock
        title={t("admin.levels")}
        actionLabel={t("action.addLevel")}
        canManage={canManage}
        onAdd={() => openLevel()}
      >
        {levels.map((level) => (
          <AdminRow
            key={level.id}
            title={level.name_fr}
            subtitle={`${level.name_en} - ${cycleById.get(level.cycle_id || "")?.name_fr || t("admin.noCycle")} - ${level.order_index}`}
            canManage={canManage}
            onEdit={() => openLevel(level)}
            onDelete={() => removeLevel(level)}
          />
        ))}
        {!levels.length && (
          <EmptyState title={t("admin.emptyLevels")} message={t("admin.emptyLevelsHelp")} />
        )}
      </AdminBlock>

      <AdminBlock
        title={t("specialty.specialties")}
        actionLabel={t("specialty.add")}
        canManage={canManage}
        onAdd={() => openSpecialty()}
      >
        {specialties.map((specialty) => (
          <AdminRow
            key={specialty.id}
            title={specialty.name_fr}
            subtitle={[specialty.name_en, specialty.description_fr].filter(Boolean).join(" - ")}
            canManage={canManage}
            onEdit={() => openSpecialty(specialty)}
            onDelete={() => removeSpecialty(specialty)}
          />
        ))}
        {!specialties.length && (
          <EmptyState title={t("specialty.empty")} message={t("specialty.emptyHelp")} />
        )}
      </AdminBlock>

      <section className="ds-card rounded-[1.75rem] p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-black text-[#071d3a]">Matieres</h3>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {dataSubjects.length} matiere{dataSubjects.length > 1 ? "s" : ""} configuree{dataSubjects.length > 1 ? "s" : ""} pour les contenus, quiz et questions.
            </p>
          </div>
          <Link href="/admin/education/subjects" className="ds-button-primary inline-flex items-center gap-2">
            <BookOpen size={18} />
            Gerer les matieres
          </Link>
        </div>
      </section>

      {status && <p className="text-sm font-black text-[#0f5f3a]">{status}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

      {modal?.kind === "cycle" && (
        <CrudModal
          title={modal.mode === "edit" ? t("admin.editCycle") : t("action.addCycle")}
          loading={saving}
          error={error}
          user={user}
          onClose={() => setModal(null)}
          onSubmit={save}
        >
          <LabeledInput label={t("admin.frenchName")} value={cycleForm.name_fr} onChange={(value) => setCycleForm((current) => ({ ...current, name_fr: value }))} />
          <LabeledInput label={t("admin.englishName")} value={cycleForm.name_en} onChange={(value) => setCycleForm((current) => ({ ...current, name_en: value }))} />
        </CrudModal>
      )}

      {modal?.kind === "level" && (
        <CrudModal
          title={modal.mode === "edit" ? t("admin.editLevel") : t("action.addLevel")}
          loading={saving}
          error={error}
          user={user}
          onClose={() => setModal(null)}
          onSubmit={save}
        >
          <label className="grid gap-2">
            <span className="text-sm font-black text-[#071d3a]">{t("admin.cycle")}</span>
            <select
              value={levelForm.cycle_id}
              onChange={(event) => setLevelForm((current) => ({ ...current, cycle_id: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]"
            >
              <option value="">{t("admin.noCycle")}</option>
              {cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>{cycle.name_fr}</option>
              ))}
            </select>
          </label>
          <LabeledInput label={t("admin.frenchName")} value={levelForm.name_fr} onChange={(value) => setLevelForm((current) => ({ ...current, name_fr: value }))} />
          <LabeledInput label={t("admin.englishName")} value={levelForm.name_en} onChange={(value) => setLevelForm((current) => ({ ...current, name_en: value }))} />
          <LabeledInput type="number" label={t("admin.orderIndex")} value={levelForm.order_index} onChange={(value) => setLevelForm((current) => ({ ...current, order_index: value }))} />
        </CrudModal>
      )}

      {modal?.kind === "specialty" && (
        <CrudModal
          title={modal.mode === "edit" ? t("specialty.edit") : t("specialty.add")}
          loading={saving}
          error={error}
          user={user}
          onClose={() => setModal(null)}
          onSubmit={save}
        >
          <LabeledInput label={t("admin.frenchName")} value={specialtyForm.name_fr} onChange={(value) => setSpecialtyForm((current) => ({ ...current, name_fr: value }))} />
          <LabeledInput label={t("admin.englishName")} value={specialtyForm.name_en} onChange={(value) => setSpecialtyForm((current) => ({ ...current, name_en: value }))} />
          <LabeledInput label={t("specialty.descriptionFr")} value={specialtyForm.description_fr} onChange={(value) => setSpecialtyForm((current) => ({ ...current, description_fr: value }))} />
          <LabeledInput label={t("specialty.descriptionEn")} value={specialtyForm.description_en} onChange={(value) => setSpecialtyForm((current) => ({ ...current, description_en: value }))} />
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

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#071d3a]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]"
      />
    </label>
  );
}
