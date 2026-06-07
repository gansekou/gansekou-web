"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Edit3, Lock, Play, ShieldAlert, Trash2 } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import { canDeleteQuiz, canEditQuiz, canPlayQuiz } from "@/lib/permissions";
import { educationService } from "@/services/education.service";
import { quizService } from "@/services/quiz.service";
import type { Level, Subject } from "@/types/education";
import type { Quiz } from "@/types/quiz";
import type { User } from "@/types/user";

export function QuizDetailPage({ user, quizId }: { user: User; quizId: string }) {
  const { language, t } = useI18n(user);
  const router = useRouter();
  const labels = useMemo(() => pageLabels(language), [language]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [quizData, subjectData, levelData] = await Promise.all([
          quizService.getById(quizId),
          educationService.subjects(),
          educationService.levels(),
        ]);
        if (!cancelled) {
          setQuiz(quizData);
          setSubjects(subjectData);
          setLevels(levelData);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : labels.loadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [labels.loadError, quizId]);

  if (loading) return <LoadingState label={labels.loading} />;
  if (error) return <ErrorState message={error} />;
  if (!quiz) return <ErrorState title={labels.notFound} message={labels.notFoundHelp} />;

  const subject = subjects.find((item) => item.id === quiz.subject_id);
  const level = levels.find((item) => item.id === quiz.level_id);
  const canEdit = canEditQuiz(user, quiz);
  const canDelete = canDeleteQuiz(user, quiz);
  const canPlay = canPlayQuiz(user, quiz);
  const questions = quiz.questions || [];
  const playableQuestions = questions.length;
  const currentQuiz = quiz;

  async function deleteQuiz() {
    const confirmed = window.confirm(labels.confirmDelete);
    if (!confirmed) return;
    try {
      await quizService.remove(currentQuiz.id);
      router.replace("/quizzes");
    } catch (deleteError) {
      setError(deleteError instanceof ApiError ? deleteError.message : labels.deleteError);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="premium-surface rounded-[1.75rem] p-6 text-white">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f6c445]">{quiz.quiz_type}</p>
            <h1 className="mt-3 text-3xl font-black md:text-5xl">{quiz.title}</h1>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-7 text-white/75">{quiz.description || labels.noDescription}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canPlay && (
              <Link href={`/quizzes/${quiz.id}/play`} className={`ds-button-premium ${!playableQuestions ? "pointer-events-none opacity-60" : ""}`}>
                <Play size={18} />
                {t("quiz.startQuiz")}
              </Link>
            )}
            {canEdit && (
              <Link href={`/quizzes/${quiz.id}/edit`} className="ds-button-primary bg-white text-[#071d3a]">
                <Edit3 size={18} />
                {t("quiz.editQuiz")}
              </Link>
            )}
          </div>
        </div>
      </section>

      {!playableQuestions && (
        <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm font-bold leading-6 text-amber-800">
          <ShieldAlert className="mr-2 inline" size={18} />
          {labels.noQuestions}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <Info label={labels.subject} value={subject ? (language === "EN" ? subject.name_en : subject.name_fr) : "-"} />
        <Info label={labels.level} value={level ? (language === "EN" ? level.name_en : level.name_fr) : "-"} />
      </section>

      <section className="ds-card rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <h2 className="text-xl font-black text-[#071d3a]">{t("quiz.questions")}</h2>
          <div className="flex flex-wrap gap-2">
            {quiz.is_premium && <span className="rounded-full bg-[#fff7df] px-3 py-1 text-xs font-black text-[#071d3a]"><Lock size={13} className="inline" /> Premium</span>}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{quiz.status || "PUBLISHED"}</span>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {questions.slice(0, 12).map((question, index) => (
            <div key={`quiz-question-preview-${question.id}-${index}`} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-black text-[#071d3a]">{index + 1}. {question.question_text}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {(question.choices || []).map((choice, choiceIndex) => (
                  <span key={`quiz-choice-preview-${question.id}-${choice.id}-${choiceIndex}`} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-500">
                    {choice.choice_text}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {!questions.length && <p className="text-sm font-bold text-slate-500">{labels.noPreview}</p>}
        </div>
      </section>

      {canDelete && (
        <button type="button" onClick={deleteQuiz} className="inline-flex w-fit items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
          <Trash2 size={18} />
          {labels.deleteQuiz}
        </button>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="ds-card rounded-[1.5rem] p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black text-[#071d3a]">{value}</p>
    </div>
  );
}

function pageLabels(language: string) {
  const fr = language !== "EN";
  return {
    loading: fr ? "Chargement du quiz..." : "Loading quiz...",
    loadError: fr ? "Chargement impossible." : "Unable to load.",
    notFound: fr ? "Quiz introuvable" : "Quiz not found",
    notFoundHelp: fr ? "Aucun quiz n'a ete retourne pour cet identifiant." : "No quiz was returned for this id.",
    noDescription: fr ? "Aucune description." : "No description.",
    subject: fr ? "Matiere" : "Subject",
    level: fr ? "Niveau" : "Level",
    noPreview: fr ? "Les questions apparaitront ici des qu'elles seront ajoutees." : "Questions will appear here as soon as they are added.",
    noQuestions: fr ? "Ce quiz ne contient pas encore de questions." : "This quiz has no questions yet.",
    confirmDelete: fr ? "Supprimer ce quiz et ses questions ?" : "Delete this quiz and its questions?",
    deleteError: fr ? "Suppression impossible." : "Unable to delete.",
    deleteQuiz: fr ? "Supprimer le quiz" : "Delete quiz",
  };
}
