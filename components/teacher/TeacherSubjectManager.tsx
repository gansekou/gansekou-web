"use client";

import { useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { platformService } from "@/services/platform.service";
import type { Subject, TeacherSubject } from "@/types/platform";

export function TeacherSubjectManager({
  teacherSubjects,
  subjects,
  reload,
}: {
  teacherSubjects: TeacherSubject[];
  subjects: Subject[];
  reload: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>(() => teacherSubjects.map((item) => item.subject_id));
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const linkedSubjects = subjects.filter((subject) => selectedSet.has(subject.id));
  const availableSubjects = subjects.filter((subject) => !selectedSet.has(subject.id));

  function toggle(subjectId: string) {
    setSelected((current) =>
      current.includes(subjectId)
        ? current.filter((item) => item !== subjectId)
        : [...current, subjectId]
    );
  }

  async function save() {
    setSaving(true);
    setStatus("Enregistrement...");
    try {
      await platformService.teacher.updateMySubjects(selected);
      setOpen(false);
      setStatus("Matières enseignées mises à jour.");
      await reload();
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Mise à jour impossible.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ds-card rounded-[1.5rem] p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-[#071d3a]">Mes matières</h3>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-500">
            Ces matières filtrent vos questions élèves, contenus, quiz et statistiques.
          </p>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-2xl bg-[#0f5f3a] px-5 py-3 font-black text-white">
          <Plus size={18} />
          Ajouter une matière
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {linkedSubjects.map((subject) => (
          <div key={subject.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="font-black text-[#071d3a]">{subject.name_fr}</p>
              <p className="text-sm font-bold text-slate-500">Utilisée pour vos questions, contenus et quiz.</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(subject.id)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600"
              aria-label="Supprimer la matière"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {!linkedSubjects.length && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
          Ajoutez vos premières matières pour recevoir les questions correspondantes.
        </div>
      )}

      {open && (
        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="font-black text-[#071d3a]">Sélectionner une ou plusieurs matières</p>
          <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
            {[...linkedSubjects, ...availableSubjects].map((subject) => (
              <label key={subject.id} className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={selectedSet.has(subject.id)}
                  onChange={() => toggle(subject.id)}
                  className="h-4 w-4 accent-[#0f5f3a]"
                />
                {subject.name_fr}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#071d3a] px-5 py-3 font-black text-white disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      )}

      {status && <p className="mt-3 text-sm font-bold text-slate-600">{status}</p>}
    </section>
  );
}
