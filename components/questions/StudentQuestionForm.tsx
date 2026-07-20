"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Paperclip, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { platformService } from "@/services/platform.service";
import type { Level, Subject } from "@/types/platform";
import type { User } from "@/types/user";
import { QuestionAnswerModeDialog, type QuestionAnswerMode } from "@/components/questions/QuestionAnswerModeDialog";

export function StudentQuestionForm({
  user,
  subjects,
  levels,
}: {
  user: User;
  subjects: Subject[];
  levels: Level[];
}) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [answerMode, setAnswerMode] = useState<QuestionAnswerMode>("AI");
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const userLevel = useMemo(
    () => levels.find((level) => level.id === user.level_id),
    [levels, user.level_id]
  );

  if (!user.level_id) {
    return (
      <section className="rounded-[1.5rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
        <h3 className="text-2xl font-black text-[#071d3a]">Avant de poser une question, choisissez votre niveau scolaire pour recevoir une réponse adaptée.</h3>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-7 text-slate-500">
          Gansekou utilise votre niveau pour adapter Kouma IA, les enseignants et les ressources recommandées.
        </p>
        <Link href="/onboarding/profile" className="mt-5 inline-flex rounded-2xl bg-[#0f5f3a] px-5 py-3 font-black text-white">
          Choisir mon niveau
        </Link>
      </section>
    );
  }

  function openModeDialog() {
    if (!subjectId || question.trim().length < 3) {
      setStatus("Choisissez une matière et écrivez votre question.");
      return;
    }

    setStatus(null);
    setDialogOpen(true);
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setStatus("Envoi...");

    try {
      let question_image_url: string | undefined;
      if (image) {
        const upload = await platformService.uploads.questionImage(image);
        question_image_url = upload.file_url;
      }

      await platformService.questions.create({
        student_id: user.id,
        question_text: question.trim(),
        subject_id: subjectId,
        level_id: user.level_id || undefined,
        question_image_url,
        language: user.preferred_language || "FR",
        answer_mode: answerMode,
        requested_teacher_id: answerMode === "TEACHER" ? teacherId : null,
      });

      setQuestion("");
      setImage(null);
      setTeacherId(null);
      setDialogOpen(false);
      setStatus(answerMode === "AI" ? "Question envoyée à Kouma IA." : "Question envoyée à l'espace enseignant.");
      router.push("/questions");
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Envoi impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[1.5rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f5f3a]">Question élève</p>
          <h3 className="mt-2 text-2xl font-black text-[#071d3a]">Nouvelle question</h3>
          <p className="mt-2 text-sm font-bold text-slate-500">
            Niveau utilisé: {userLevel?.name_fr || "Votre niveau scolaire"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <select
          disabled={submitting}
          value={subjectId}
          onChange={(event) => {
            setSubjectId(event.target.value);
            setTeacherId(null);
          }}
          className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none"
        >
          <option value="">
            {user.preferred_language === "EN"
              ? "Select a subject"
              : "Choisir la matière"}
          </option>
          
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {user.preferred_language === "EN"
                ? subject.name_en
                : subject.name_fr}
            </option>))}
        </select>
        <textarea
          disabled={submitting}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="min-h-40 w-full rounded-2xl border border-slate-200 p-4 font-bold outline-none"
          placeholder="Écris ta question..."
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-500">
          <Paperclip size={18} />
          {image?.name || "Ajouter une image ou un fichier"}
          <input className="hidden" type="file" disabled={submitting} onChange={(event) => setImage(event.target.files?.[0] || null)} />
        </label>
      </div>

      <button
        type="button"
        onClick={openModeDialog}
        disabled={submitting}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0f5f3a] px-6 py-3 font-black text-white disabled:opacity-60"
      >
        <Send size={18} />
        {submitting ? "Envoi..." : "Continuer"}
      </button>

      {status && <p className="mt-3 text-sm font-bold text-slate-600">{status}</p>}

      <QuestionAnswerModeDialog
        open={dialogOpen}
        subjectId={subjectId}
        selectedMode={answerMode}
        selectedTeacherId={teacherId}
        submitting={submitting}
        onModeChange={setAnswerMode}
        onTeacherChange={setTeacherId}
        onCancel={() => setDialogOpen(false)}
        onConfirm={submit}
      />
    </section>
  );
}
