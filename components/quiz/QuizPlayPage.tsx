"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock3, Flame, Timer, XCircle } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/app/StateViews";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import { canPlayQuiz } from "@/lib/permissions";
import { quizService } from "@/services/quiz.service";
import type { Quiz, QuizQuestion } from "@/types/quiz";
import type { User } from "@/types/user";

export function QuizPlayPage({ user, quizId }: { user: User; quizId: string }) {
  const { language, t } = useI18n(user);
  const router = useRouter();
  const labels = useMemo(() => pageLabels(language), [language]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"TRAINING" | "EXAM" | "SPEED">("TRAINING");
  const [feedback, setFeedback] = useState<Record<string, "correct" | "wrong">>({});
  const [visualFeedback, setVisualFeedback] = useState<"correct" | "wrong" | null>(null);
  const deferredAnswers = useDeferredValue(answers);

  const draftKey = `gansekou_quiz_answers_${quizId}`;
  const totalSeconds = (quiz?.estimated_duration_minutes || 10) * 60;
  const effectiveTotalSeconds = mode === "SPEED" ? Math.max(60, Math.floor(totalSeconds * 0.55)) : totalSeconds;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const quizData = await quizService.getById(quizId);
        if (!cancelled) {
          setQuiz(quizData);
          const saved = window.localStorage.getItem(draftKey);
          if (saved) setAnswers(JSON.parse(saved) as Record<string, string>);
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
  }, [draftKey, labels.loadError, quizId]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify(deferredAnswers));
    }, 180);
    return () => window.clearTimeout(task);
  }, [deferredAnswers, draftKey]);

  useEffect(() => {
    if (!started || submitting) return;
    const interval = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [started, submitting]);

  async function start() {
    if (!quiz || starting) return;
    setStarting(true);
    setStatus(labels.starting);
    try {
      const attempt = await quizService.start(quiz.id);
      setAttemptId(attempt.attempt_id);
      setStarted(true);
      setElapsed(0);
      setStatus(null);
      await document.documentElement.requestFullscreen?.().catch(() => undefined);
    } catch (startError) {
      setStatus(startError instanceof ApiError ? startError.message : labels.startError);
    } finally {
      setStarting(false);
    }
  }

  const finish = useCallback(async (skipConfirm = false) => {
    if (!quiz || !attemptId) return;
    const confirmed = skipConfirm || window.confirm(labels.confirmFinish);
    if (!confirmed) return;
    setSubmitting(true);
    setStatus(labels.submitting);
    try {
      const result = await quizService.submit(quiz.id, attemptId, answers);
      window.localStorage.removeItem(draftKey);
      router.push(`/quizzes/${quiz.id}/result?attempt=${result.attempt_id}`);
    } catch (submitError) {
      setStatus(submitError instanceof ApiError ? submitError.message : labels.submitError);
    } finally {
      setSubmitting(false);
    }
  }, [answers, attemptId, draftKey, labels.confirmFinish, labels.submitError, labels.submitting, quiz, router]);

  useEffect(() => {
    if (started && attemptId && elapsed >= effectiveTotalSeconds && !submitting) {
      const task = window.setTimeout(() => {
        finish(true);
      }, 0);
      return () => window.clearTimeout(task);
    }
  }, [attemptId, effectiveTotalSeconds, elapsed, finish, started, submitting]);

  const chooseAnswer = useCallback((questionId: string, choiceId: string, isCorrect?: boolean) => {
    setAnswers((current) => ({ ...current, [questionId]: choiceId }));
    if (mode === "TRAINING" && isCorrect !== undefined) {
      const nextFeedback = isCorrect ? "correct" : "wrong";
      setFeedback((current) => ({ ...current, [questionId]: nextFeedback }));
      setVisualFeedback(nextFeedback);
      if (!isCorrect) navigator.vibrate?.(60);
      window.setTimeout(() => setVisualFeedback(null), 520);
    }
  }, [mode]);

  if (loading) return <LoadingState label={labels.loading} />;
  if (error) return <ErrorState message={error} />;
  if (!quiz) return <ErrorState title={labels.notFound} message={labels.notFoundHelp} />;
  if (!canPlayQuiz(user, quiz)) return <ErrorState title={labels.notAllowed} message={labels.notAllowedHelp} />;
  const questions = quiz.questions || [];
  if (!questions.length) return <ErrorState title={labels.noQuestions} message={labels.noQuestionsHelp} />;

  const question = questions[index] as QuizQuestion;
  const choices = question.choices || [];
  const progress = Math.round(((index + 1) / questions.length) * 100);
  const answeredCount = Object.keys(answers).length;
  const effectiveRemaining = Math.max(0, effectiveTotalSeconds - elapsed);
  const liveStreak = Object.values(feedback).filter((value) => value === "correct").length;

  return (
    <div className="grid gap-6">
      {!started ? (
        <section className="premium-surface rounded-[1.75rem] p-6 text-white">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f6c445]">{t("quiz.startQuiz")}</p>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">{quiz.title}</h1>
          <p className="mt-4 max-w-3xl text-sm font-bold leading-7 text-white/75">{quiz.description || labels.noDescription}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <IntroStat label={t("quiz.questions")} value={String(questions.length)} />
            <IntroStat label={t("quiz.estimatedDuration")} value={`${quiz.estimated_duration_minutes || 10} min`} />
            <IntroStat label={t("quiz.passingScore")} value={`${quiz.passing_score}%`} />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {(["TRAINING", "EXAM", "SPEED"] as const).map((item, index) => (
              <button
                key={`quiz-mode-${item}-${index}`}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-2xl border p-4 text-left font-black transition ${mode === item ? "border-[#f6c445] bg-white text-[#071d3a]" : "border-white/15 bg-white/10 text-white hover:bg-white/15"}`}
              >
                {labels.modes[item]}
              </button>
            ))}
          </div>
          <LoadingButton
            onClick={start}
            loading={starting}
            loadingLabel={labels.starting}
            variant="secondary"
            className="mt-6 bg-[#f6c445] text-[#071d3a] hover:bg-[#e7b52c]"
          >
            {!starting && <CheckCircle2 size={18} />}
            {t("quiz.startQuiz")}
          </LoadingButton>
        </section>
      ) : (
        <>
          <section className="sticky top-24 z-10 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-xl shadow-[#071d3a]/10 backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-black text-slate-500">{index + 1} / {questions.length}</p>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 md:w-96">
                  <div className="h-full rounded-full bg-[#f6c445] transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-2xl bg-[#fff7df] px-4 py-3 text-sm font-black text-[#071d3a]">
                  <Flame size={18} />
                  {labels.streak}: {liveStreak}
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-[#071d3a]">
                  <Clock3 size={18} />
                  {answeredCount}/{questions.length}
                </span>
              <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-lg font-black ${effectiveRemaining < 60 ? "bg-red-50 text-red-600" : "bg-[#e8f5ee] text-[#0f5f3a]"}`}>
                <Timer size={20} />
                {formatTime(effectiveRemaining)}
              </div>
              </div>
            </div>
          </section>

          <ActiveQuestion
            question={question}
            choices={choices}
            selectedChoiceId={answers[question.id]}
            feedback={feedback[question.id]}
            mode={mode}
            visualFeedback={visualFeedback}
            onChoose={chooseAnswer}
          />

          <div className="flex flex-col justify-between gap-3 md:flex-row">
            <LoadingButton type="button" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))} variant="primary" className="rounded-full">
              <ArrowLeft size={18} />
              {labels.previous}
            </LoadingButton>
            <div className="flex flex-wrap gap-3">
              {index < questions.length - 1 ? (
                <LoadingButton type="button" onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))} variant="secondary" className="rounded-full bg-[#f6c445] text-[#071d3a] hover:bg-[#e7b52c]">
                  {labels.next}
                  <ArrowRight size={18} />
                </LoadingButton>
              ) : (
                <LoadingButton
                  type="button"
                  disabled={submitting}
                  loading={submitting}
                  loadingLabel={labels.submitting}
                  onClick={() => finish()}
                  variant="secondary"
                  className="rounded-full bg-[#f6c445] text-[#071d3a] hover:bg-[#e7b52c]"
                >
                  {t("quiz.finishQuiz")}
                </LoadingButton>
              )}
            </div>
          </div>
        </>
      )}

      {status && (
        <p className="rounded-2xl bg-slate-100 p-4 text-sm font-black text-slate-700">
          <AlertTriangle className="mr-2 inline" size={18} />
          {status}
        </p>
      )}
      <Link href={`/quizzes/${quiz.id}`} className="text-sm font-black text-[#0f5f3a]">{labels.back}</Link>
    </div>
  );
}

const ActiveQuestion = memo(function ActiveQuestion({
  question,
  choices,
  selectedChoiceId,
  feedback,
  mode,
  visualFeedback,
  onChoose,
}: {
  question: QuizQuestion;
  choices: NonNullable<QuizQuestion["choices"]>;
  selectedChoiceId?: string;
  feedback?: "correct" | "wrong";
  mode: "TRAINING" | "EXAM" | "SPEED";
  visualFeedback: "correct" | "wrong" | null;
  onChoose: (questionId: string, choiceId: string, isCorrect?: boolean) => void;
}) {
  return (
    <section
      key={`quiz-active-question-${question.id}`}
      className={`ds-card rounded-[1.5rem] p-6 ${
        visualFeedback === "correct"
          ? "ring-4 ring-[#0f5f3a]/20"
          : visualFeedback === "wrong"
            ? "animate-[quiz-shake_420ms_ease] ring-4 ring-red-200"
            : "premium-fade-in"
      }`}
    >
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{question.question_type}</p>
      <h1 className="mt-3 text-2xl font-black leading-9 text-[#071d3a]">{question.question_text}</h1>
      <div className="mt-6 grid gap-3">
        {choices.map((choice, choiceIndex) => {
          const selected = selectedChoiceId === choice.id;
          const reveal = mode === "TRAINING" && selected && feedback;
          return (
            <button
              key={`quiz-choice-${question.id}-${choice.id}-${choiceIndex}`}
              type="button"
              onClick={() => onChoose(question.id, choice.id, choice.is_correct)}
              className={`native-press min-h-16 rounded-2xl border p-4 text-left text-sm font-black transition ${
                reveal === "correct"
                  ? "reward-sheen border-[#0f5f3a] bg-[#e8f5ee] text-[#082f1f]"
                  : reveal === "wrong"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : selected
                      ? "border-[#0f5f3a] bg-[#e8f5ee] text-[#082f1f]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#f6c445]"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{choice.choice_text}</span>
                {reveal === "correct" && <CheckCircle2 size={20} />}
                {reveal === "wrong" && <XCircle size={20} />}
              </span>
            </button>
          );
        })}
      </div>
      {mode === "TRAINING" && feedback && question.explanation && (
        <div className="mt-5 rounded-2xl bg-[#fff7df] p-4 text-sm font-bold leading-6 text-[#071d3a]">
          {question.explanation}
        </div>
      )}
    </section>
  );
});

function IntroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function pageLabels(language: string) {
  const fr = language !== "EN";
  return {
    loading: fr ? "Preparation du quiz..." : "Preparing quiz...",
    loadError: fr ? "Chargement impossible." : "Unable to load.",
    notFound: fr ? "Quiz introuvable" : "Quiz not found",
    notFoundHelp: fr ? "Aucun quiz n'a ete retourne." : "No quiz was returned.",
    notAllowed: fr ? "Action non autorisee" : "Action not allowed",
    notAllowedHelp: fr ? "Votre role ne permet pas de passer ce quiz." : "Your role cannot play this quiz.",
    noQuestions: fr ? "Questions indisponibles" : "Questions unavailable",
    noQuestionsHelp: fr ? "Ajoutez des questions avant de lancer cette evaluation." : "Add questions before starting this assessment.",
    noDescription: fr ? "Aucune description." : "No description.",
    starting: fr ? "Demarrage..." : "Starting...",
    startError: fr ? "Demarrage impossible." : "Unable to start.",
    submitting: fr ? "Soumission..." : "Submitting...",
    submitError: fr ? "Soumission impossible. Verifiez votre connexion puis reessayez." : "Unable to submit. Check your connection and retry.",
    confirmFinish: fr ? "Terminer et soumettre ce quiz ?" : "Finish and submit this quiz?",
    streak: fr ? "Serie" : "Streak",
    previous: fr ? "Precedent" : "Previous",
    next: fr ? "Suivant" : "Next",
    back: fr ? "Retour au detail du quiz" : "Back to quiz detail",
    modes: {
      TRAINING: fr ? "Mode entraînement" : "Training mode",
      EXAM: fr ? "Mode examen" : "Exam mode",
      SPEED: fr ? "Mode rapidité" : "Speed mode",
    },
  };
}
