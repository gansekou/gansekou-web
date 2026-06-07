"use client";

import type { Language } from "@/types/i18n";
import type { Subject } from "@/types/education";
import { TeacherProofUpload } from "@/components/onboarding/TeacherProofUpload";

export function TeacherApplicationStep({
  subjects,
  language,
  selectedSubjectIds,
  file,
  message,
  labels,
  onSubjectsChange,
  onFileChange,
  onMessageChange,
}: {
  subjects: Subject[];
  language: Language;
  selectedSubjectIds: string[];
  file: File | null;
  message: string;
  labels: {
    subjects: string;
    proof: string;
    notice: string;
    message: string;
  };
  onSubjectsChange: (subjectIds: string[]) => void;
  onFileChange: (file: File | null) => void;
  onMessageChange: (message: string) => void;
}) {
  function toggleSubject(subjectId: string) {
    onSubjectsChange(
      selectedSubjectIds.includes(subjectId)
        ? selectedSubjectIds.filter((id) => id !== subjectId)
        : [...selectedSubjectIds, subjectId]
    );
  }

  return (
    <div className="grid gap-5">
      <div>
        <p className="font-black text-[#071d3a]">{labels.subjects}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {subjects.map((subject) => {
            const checked = selectedSubjectIds.includes(subject.id);
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => toggleSubject(subject.id)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                  checked
                    ? "border-[#0f5f3a] bg-[#e8f5ef] text-[#082f1f]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {language === "EN" ? subject.name_en : subject.name_fr}
              </button>
            );
          })}
        </div>
      </div>
      <TeacherProofUpload file={file} label={labels.proof} notice={labels.notice} onChange={onFileChange} />
      <textarea
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        className="min-h-28 rounded-2xl border border-slate-200 p-4 font-bold outline-none focus:border-[#0f5f3a]"
        placeholder={labels.message}
      />
    </div>
  );
}
