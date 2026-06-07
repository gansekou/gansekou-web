"use client";

import { useEffect, useState } from "react";
import { Loader2, UserRound } from "lucide-react";
import { ApiError } from "@/lib/api";
import { platformService } from "@/services/platform.service";

export type TeacherChoice = {
  id: string;
  nom: string;
  prenom: string;
  profile_url?: string | null;
  role?: string | null;
};

export function TeacherPickerBySubject({
  subjectId,
  selectedTeacherId,
  onSelect,
}: {
  subjectId: string;
  selectedTeacherId?: string | null;
  onSelect: (teacherId: string | null) => void;
}) {
  const [teachers, setTeachers] = useState<TeacherChoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) {
      return;
    }

    let active = true;
    platformService.teacher
      .teachersBySubject(subjectId)
      .then((items) => {
        if (!active) return;
        setError(null);
        setTeachers(items);
      })
      .catch((requestError) => {
        if (!active) return;
        setTeachers([]);
        setError(requestError instanceof ApiError ? requestError.message : "Chargement des enseignants impossible.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [subjectId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
        <Loader2 className="animate-spin" size={18} />
        Recherche des enseignants disponibles...
      </div>
    );
  }

  if (error) {
    return <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>;
  }

  if (!teachers.length) {
    return (
      <div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800">
        Aucun enseignant disponible pour cette matière pour le moment. Vous pouvez demander à Kouma IA ou envoyer la question à la file d&apos;attente enseignant.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {teachers.map((teacher) => {
        const active = selectedTeacherId === teacher.id;
        return (
          <button
            key={teacher.id}
            type="button"
            onClick={() => onSelect(active ? null : teacher.id)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
              active ? "border-[#0f5f3a] bg-[#eef8f1]" : "border-slate-200 bg-white hover:border-[#f6c445]"
            }`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-[#071d3a]">
              <UserRound size={20} />
            </span>
            <span>
              <span className="block font-black text-[#071d3a]">{teacher.prenom} {teacher.nom}</span>
              <span className="text-sm font-bold text-slate-500">Enseignant validé</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
