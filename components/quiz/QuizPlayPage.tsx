"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  Timer,
  XCircle,
} from "lucide-react";

import {
  ErrorState,
  LoadingState,
} from "@/components/app/StateViews";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import { canPlayQuiz } from "@/lib/permissions";
import { quizService } from "@/services/quiz.service";

import type {
  Quiz,
  QuizQuestion,
} from "@/types/quiz";

import type { User } from "@/types/user";
import { MathText } from "@/components/math/MathText";

export function QuizPlayPage({
  user,
  quizId,
}: {
  user: User;
  quizId: string;
}) {
  const { language, t } = useI18n(user);
  const router = useRouter();

  const fr = language === "FR";

  const labels = useMemo(
    () => ({
      loading: fr ? "Chargement du quiz..." : "Loading quiz...",
      error: fr
        ? "Impossible de charger ce quiz."
        : "Unable to load this quiz.",
      retry: fr ? "Réessayer" : "Retry",
      back: fr ? "Retour aux quiz" : "Back to quizzes",
      start: fr ? "Commencer le quiz" : "Start quiz",
      submit: fr ? "Terminer le quiz" : "Submit quiz",
      next: fr ? "Question suivante" : "Next question",
      previous: fr ? "Question précédente" : "Previous question",
      unanswered: fr ? "Question non répondue" : "Unanswered question",
      answered: fr ? "Réponse enregistrée" : "Answer saved",
      timeRemaining: fr ? "Temps restant" : "Time remaining",
      noTimeLimit: fr ? "Sans limite de temps" : "No time limit",
      question: fr ? "Question" : "Question",
      of: fr ? "sur" : "of",
      score: fr ? "Score" : "Score",
      correct: fr ? "Correct" : "Correct",
      incorrect: fr ? "Incorrect" : "Incorrect",
      confirmSubmit: fr
        ? "Voulez-vous vraiment terminer le quiz ?"
        : "Do you really want to submit the quiz?",
      autoSubmit: fr
        ? "Le temps est écoulé. Le quiz va être soumis automatiquement."
        : "Time is up. The quiz will be submitted automatically.",
      premiumRequired: fr
        ? "Ce quiz nécessite un abonnement premium."
        : "This quiz requires a premium subscription.",
      accessDenied: fr
        ? "Vous n'avez pas accès à ce quiz."
        : "You do not have access to this quiz.",
      submitError: fr
        ? "Une erreur est survenue lors de la soumission du quiz."
        : "An error occurred while submitting the quiz.",
      seconds: fr ? "secondes" : "seconds",
      minute: fr ? "min" : "min",
      explanation: fr ? "Explication" : "Explanation",
      points: fr ? "points" : "points",
      requiredScore: fr ? "Score requis" : "Required score",
      difficulty: fr ? "Difficulté" : "Difficulty",
      duration: fr ? "Durée" : "Duration",
      instructions: fr ? "Instructions" : "Instructions",
      startNow: fr ? "Démarrer maintenant" : "Start now",
      cancel: fr ? "Annuler" : "Cancel",
      confirm: fr ? "Confirmer" : "Confirm",
      mode: fr ? "Mode" : "Mode",
      standard: fr ? "Mode standard" : "Standard mode",
      exam: fr ? "Mode examen" : "Exam mode",
      speed: fr ? "Mode rapidité" : "Speed mode",
    }),
    [fr]
  );

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    null
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const deferredCurrentIndex = useDeferredValue(currentIndex);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await quizService.getById(quizId);
      setQuiz(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(labels.error);
      }
    } finally {
      setLoading(false);
    }
  }, [quizId, labels.error]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  const questions = useMemo<QuizQuestion[]>(() => {
    if (!quiz) {
      return [];
    }

    return Array.isArray(quiz.questions) ? quiz.questions : [];
  }, [quiz]);

  const currentQuestion = questions[deferredCurrentIndex] ?? null;

  const hasAccess = useMemo(() => {
    if (!quiz) {
      return false;
    }

    return canPlayQuiz(user, quiz);
  }, [quiz, user]);

  const durationSeconds = useMemo(() => {
    if (!quiz) {
      return null;
    }

    const duration =
      quiz.estimated_duration ??
      quiz.duration ??
      null;

    if (!duration || duration <= 0) {
      return null;
    }

    return Math.round(Number(duration) * 60);
  }, [quiz]);

  const answeredCount = useMemo(() => {
    return questions.reduce((count, question) => {
      const questionId = String(question.id);

      return answers[questionId] ? count + 1 : count;
    }, 0);
  }, [answers, questions]);

  const progress = useMemo(() => {
    if (questions.length === 0) {
      return 0;
    }

    return ((currentIndex + 1) / questions.length) * 100;
  }, [currentIndex, questions.length]);

  const formatTime = useCallback((totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, []);

  const startQuiz = useCallback(() => {
    if (!quiz || !hasAccess) {
      return;
    }

    setStarted(true);
    setCurrentIndex(0);
    setAnswers({});
    setSubmitError(null);

    if (durationSeconds !== null) {
      setRemainingSeconds(durationSeconds);
    } else {
      setRemainingSeconds(null);
    }
  }, [durationSeconds, hasAccess, quiz]);

  const submitQuiz = useCallback(async () => {
    if (!quiz || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formattedAnswers = questions.map((question) => ({
        question_id: question.id,
        answer: answers[String(question.id)] ?? null,
      }));

      const result = await quizService.submitQuiz(quiz.id, {
        answers: formattedAnswers,
      });

      router.push(
        `/quizzes/${quiz.id}/result?attempt=${result.attempt_id}`
      );
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setSubmitError(submitError.message);
      } else {
        setSubmitError(labels.submitError);
      }
    } finally {
      setSubmitting(false);
      setShowSubmitConfirm(false);
    }
  }, [
    answers,
    labels.submitError,
    questions,
    quiz,
    router,
    submitting,
  ]);

  useEffect(() => {
    if (!started || remainingSeconds === null || submitting) {
      return;
    }

    if (remainingSeconds <= 0) {
      setSubmitError(labels.autoSubmit);
      void submitQuiz();
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current === null) {
          return null;
        }

        return Math.max(0, current - 1);
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    labels.autoSubmit,
    remainingSeconds,
    started,
    submitting,
    submitQuiz,
  ]);

  const selectAnswer = useCallback(
    (questionId: string | number, answerId: string) => {
      if (!started || submitting) {
        return;
      }

      setAnswers((previous) => ({
        ...previous,
        [String(questionId)]: answerId,
      }));
    },
    [started, submitting]
  );

  const goNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setShowSubmitConfirm(true);
      return;
    }

    setCurrentIndex((index) =>
      Math.min(index + 1, questions.length - 1)
    );
  }, [currentIndex, questions.length]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) {
        return;
      }

      setCurrentIndex(index);
    },
    [questions.length]
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState label={labels.loading} />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title={labels.error}
          message={error ?? labels.error}
          onRetry={() => void loadQuiz()}
        />

        <div className="mt-6 flex justify-center">
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            {labels.back}
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold">
                {labels.premiumRequired}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {labels.accessDenied}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/premium"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  {fr ? "Voir les abonnements" : "View subscriptions"}
                </Link>

                <Link
                  href="/quizzes"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {labels.back}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {labels.back}
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="border-b bg-muted/30 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {quiz.subject?.name && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {quiz.subject.name}
                </span>
              )}

              {quiz.difficulty && (
                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {quiz.difficulty}
                </span>
              )}

              {quiz.type && (
                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {quiz.type}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
              {quiz.title}
            </h1>

            {quiz.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                {quiz.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {fr ? "Questions" : "Questions"}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {questions.length}
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {labels.duration}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {durationSeconds !== null
                  ? `${Math.ceil(durationSeconds / 60)} ${labels.minute}`
                  : labels.noTimeLimit}
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {labels.requiredScore}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {quiz.required_score ?? 0}%
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {labels.mode}
                </span>
              </div>
              <p className="mt-2 text-lg font-bold">
                {quiz.mode === "SPEED"
                  ? labels.speed
                  : quiz.mode === "EXAM"
                    ? labels.exam
                    : labels.standard}
              </p>
            </div>
          </div>

          {quiz.instructions && (
            <div className="border-t p-6 sm:p-8">
              <h2 className="text-base font-bold">
                {labels.instructions}
              </h2>

              <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {quiz.instructions}
              </div>
            </div>
          )}

          <div className="border-t bg-muted/20 p-6 sm:p-8">
            <button
              type="button"
              onClick={startQuiz}
              disabled={questions.length === 0}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {labels.startNow}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />

          <h1 className="mt-4 text-xl font-bold">
            {labels.error}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {fr
              ? "Aucune question disponible pour ce quiz."
              : "No question is available for this quiz."}
          </p>

          <Link
            href="/quizzes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            {labels.back}
          </Link>
        </div>
      </div>
    );
  }

  const questionId = String(currentQuestion.id);
  const selectedAnswer = answers[questionId];

  const choices =
    currentQuestion.choices ??
    currentQuestion.options ??
    [];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/quizzes"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                {labels.back}
              </span>
            </Link>

            <div className="min-w-0 flex-1 px-2 text-center">
              <p className="truncate text-sm font-semibold">
                {quiz.title}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {labels.question} {currentIndex + 1} {labels.of}{" "}
                {questions.length}
              </p>
            </div>

            {remainingSeconds !== null ? (
              <div
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${
                  remainingSeconds <= 30
                    ? "border-destructive/40 text-destructive"
                    : ""
                }`}
              >
                <Timer className="h-4 w-4" />
                <span className="tabular-nums">
                  {formatTime(remainingSeconds)}
                </span>
              </div>
            ) : (
              <div className="hidden shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
                <Clock3 className="h-4 w-4" />
                {labels.noTimeLimit}
              </div>
            )}
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="min-w-0">
            <div className="rounded-2xl border bg-card shadow-sm sm:rounded-3xl">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {labels.question} {currentIndex + 1}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {answeredCount}/{questions.length}{" "}
                      {fr ? "répondues" : "answered"}
                    </p>
                  </div>

                  {selectedAnswer ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {labels.answered}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {labels.unanswered}
                    </div>
                  )}
                </div>

                <div className="text-base font-semibold leading-7 sm:text-lg sm:leading-8">
                  <MathText>
                    {currentQuestion.question ??
                      currentQuestion.text ??
                      ""}
                  </MathText>
                </div>

                {currentQuestion.image_url && (
                  <div className="mt-6 overflow-hidden rounded-2xl border bg-muted/20">
                    <img
                      src={currentQuestion.image_url}
                      alt=""
                      className="mx-auto max-h-[420px] w-auto max-w-full object-contain"
                    />
                  </div>
                )}

                <div className="mt-7 grid gap-3">
                  {choices.map((choice, choiceIndex) => {
                    const choiceId =
                      typeof choice === "string"
                        ? choice
                        : String(
                            choice.id ??
                              choice.value ??
                              choiceIndex
                          );

                    const choiceText =
                      typeof choice === "string"
                        ? choice
                        : choice.text ??
                          choice.label ??
                          choice.value ??
                          "";

                    const isSelected =
                      selectedAnswer === choiceId;

                    const letter = String.fromCharCode(
                      65 + choiceIndex
                    );

                    return (
                      <button
                        key={choiceId}
                        type="button"
                        onClick={() =>
                          selectAnswer(
                            currentQuestion.id,
                            choiceId
                          )
                        }
                        disabled={submitting}
                        className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition sm:p-4 ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "hover:border-primary/50 hover:bg-muted/40"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "bg-background group-hover:border-primary/50"
                          }`}
                        >
                          {letter}
                        </span>

                        <span className="min-w-0 flex-1 pt-1 text-sm leading-6 sm:text-base">
                          <MathText>{choiceText}</MathText>
                        </span>

                        {isSelected && (
                          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {currentQuestion.hint && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/20">
                    <p className="font-semibold text-amber-800 dark:text-amber-300">
                      {fr ? "Indice" : "Hint"}
                    </p>

                    <div className="mt-1 text-amber-700 dark:text-amber-400">
                      <MathText>
                        {currentQuestion.hint}
                      </MathText>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t bg-muted/20 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={goPrevious}
                    disabled={currentIndex === 0 || submitting}
                    className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {labels.previous}
                    </span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                    >
                      <span className="hidden sm:inline">
                        {labels.next}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSubmitConfirm(true)}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                    >
                      <span className="hidden sm:inline">
                        {labels.submit}
                      </span>
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">
                  {fr ? "Questions" : "Questions"}
                </h2>

                <span className="text-xs text-muted-foreground">
                  {answeredCount}/{questions.length}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const id = String(question.id);
                  const answered = Boolean(answers[id]);
                  const active = index === currentIndex;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => goToQuestion(index)}
                      className={`flex aspect-square items-center justify-center rounded-xl border text-xs font-bold transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : answered
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  {fr ? "Question actuelle" : "Current question"}
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  {fr ? "Répondue" : "Answered"}
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border" />
                  {fr ? "Non répondue" : "Unanswered"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={submitting}
                className="mt-5 w-full rounded-xl border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-50"
              >
                {labels.submit}
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-5 lg:hidden">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">
                {fr ? "Navigation" : "Navigation"}
              </h2>

              <span className="text-xs text-muted-foreground">
                {answeredCount}/{questions.length}
              </span>
            </div>

            <div className="grid grid-cols-8 gap-2 sm:grid-cols-10">
              {questions.map((question, index) => {
                const id = String(question.id);
                const answered = Boolean(answers[id]);
                const active = index === currentIndex;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-bold transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : answered
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "hover:border-primary/50 hover:bg-muted"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {submitError && (
          <div className="mx-auto mt-5 max-w-4xl rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <p>{submitError}</p>
            </div>
          </div>
        )}
      </main>

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold">
                  {labels.submit}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {labels.confirmSubmit}
                </p>

                <p className="mt-3 text-sm font-medium">
                  {answeredCount}/{questions.length}{" "}
                  {fr ? "questions répondues" : "questions answered"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                disabled={submitting}
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
              >
                {labels.cancel}
              </button>

              <LoadingButton
                type="button"
                onClick={() => void submitQuiz()}
                loading={submitting}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                {labels.confirm}
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(QuizPlayPage);
