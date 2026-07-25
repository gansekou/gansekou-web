"use client";

import { GraduationCap, Send, X } from "lucide-react";
import { TeacherPickerBySubject } from "@/components/questions/TeacherPickerBySubject";


export function QuestionAnswerModeDialog({
  open,
  subjectId,
  selectedTeacherId,
  submitting,
  onTeacherChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  subjectId: string;
  selectedTeacherId?: string | null;
  submitting?: boolean;
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
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f5f3a]">
            Question à un enseignant
            </p>
            
            <h3 className="mt-2 text-2xl font-black text-[#071d3a]">
            Choisissez l'enseignant qui répondra à votre question
            </h3>
            
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
            Votre question sera envoyée directement à l'enseignant sélectionné.
            </p>
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

        
        <div className="mt-6">
          <p className="mb-3 font-black text-[#071d3a]">
            Choisir un enseignant
          </p>
        
          <TeacherPickerBySubject
            subjectId={subjectId}
            selectedTeacherId={selectedTeacherId}
            onSelect={onTeacherChange}
          />
        </div>

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
            {submitting ? "Envoi..." : "Envoyer la question"}
          </button>
        </div>
      </section>
    </div>
  );
}
