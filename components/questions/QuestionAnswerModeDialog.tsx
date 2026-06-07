"use client";

import { Bot, GraduationCap, Send, X } from "lucide-react";
import { TeacherPickerBySubject } from "@/components/questions/TeacherPickerBySubject";

export type QuestionAnswerMode = "AI" | "TEACHER";

export function QuestionAnswerModeDialog({
  open,
  subjectId,
  selectedMode,
  selectedTeacherId,
  submitting,
  onModeChange,
  onTeacherChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  subjectId: string;
  selectedMode: QuestionAnswerMode;
  selectedTeacherId?: string | null;
  submitting?: boolean;
  onModeChange: (mode: QuestionAnswerMode) => void;
  onTeacherChange: (teacherId: string | null) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#071d3a]/55 p-4 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] bg-white p-5 shadow-2xl md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f5f3a]">Réponse premium</p>
            <h3 className="mt-2 text-2xl font-black text-[#071d3a]">Comment souhaitez-vous recevoir votre réponse ?</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onModeChange("AI")}
            className={`rounded-2xl border p-4 text-left transition ${
              selectedMode === "AI" ? "border-[#0f5f3a] bg-[#eef8f1]" : "border-slate-200 hover:border-[#f6c445]"
            }`}
          >
            <Bot size={24} className="text-[#0f5f3a]" />
            <span className="mt-3 block font-black text-[#071d3a]">Demander à Kouma IA</span>
            <span className="mt-1 block text-sm font-bold leading-6 text-slate-500">
              Réponse rapide, expliquée étape par étape, adaptée à votre niveau.
            </span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange("TEACHER")}
            className={`rounded-2xl border p-4 text-left transition ${
              selectedMode === "TEACHER" ? "border-[#0f5f3a] bg-[#eef8f1]" : "border-slate-200 hover:border-[#f6c445]"
            }`}
          >
            <GraduationCap size={24} className="text-[#0f5f3a]" />
            <span className="mt-3 block font-black text-[#071d3a]">Réponse par un enseignant</span>
            <span className="mt-1 block text-sm font-bold leading-6 text-slate-500">
              Un enseignant validé de la matière vous répond dans son espace Gansekou.
            </span>
          </button>
        </div>

        {selectedMode === "TEACHER" && (
          <div className="mt-5 grid gap-3">
            <p className="font-black text-[#071d3a]">Choisir un enseignant</p>
            <TeacherPickerBySubject
              subjectId={subjectId}
              selectedTeacherId={selectedTeacherId}
              onSelect={onTeacherChange}
            />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-600">
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f5f3a] px-5 py-3 font-black text-white disabled:opacity-60"
          >
            <Send size={18} />
            {submitting ? "Envoi..." : selectedMode === "AI" ? "Demander à Kouma IA" : "Envoyer"}
          </button>
        </div>
      </section>
    </div>
  );
}
