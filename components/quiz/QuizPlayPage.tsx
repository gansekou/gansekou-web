```tsx
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

  const labels = useMemo(
    () => pageLabels(language),
    [language]
  );

  const [quiz, setQuiz] =
    useState<Quiz | null>(null);

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [attemptId, setAttemptId] =
    useState<string | null>(null);

  const [started, setStarted] =
    useState(false);

  const [index, setIndex] =
    useState(0);

  const [elapsed, setElapsed] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [starting, setStarting] =
    useState(false);

  const [status, setStatus] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [mode, setMode] =
    useState<
      "TRAINING" | "EXAM" | "SPEED"
    >("TRAINING");

  const [feedback, setFeedback] =
    useState<
      Record<
        string,
        "correct" | "wrong"
      >
    >({});

  const [visualFeedback, setVisualFeedback] =
    useState<
      "correct" | "wrong" | null
    >(null);

  const deferredAnswers =
    useDeferredValue(answers);

  const draftKey =
    `gansekou_quiz_answers_${quizId}`;

  const totalSeconds =
    (quiz?.estimated_duration_minutes || 10) *
    60;

  const effectiveTotalSeconds =
    mode === "SPEED"
      ? Math.max(
          60,
          Math.floor(totalSeconds * 0.55)
        )
      : totalSeconds;

  /*
   * ============================================================
   * CHARGEMENT DU QUIZ
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const quizData =
          await quizService.getById(
            quizId
          );

        if (!cancelled) {
          setQuiz(quizData);

          const saved =
            window.localStorage.getItem(
              draftKey
            );

          if (saved) {
            try {
              setAnswers(
                JSON.parse(saved) as Record<
                  string,
                  string
                >
              );
            } catch {
              window.localStorage.removeItem(
                draftKey
              );
            }
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : labels.loadError
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    draftKey,
    labels.loadError,
    quizId,
  ]);

  /*
   * ============================================================
   * SAUVEGARDE AUTOMATIQUE
   * ============================================================
   */

  useEffect(() => {
    const task =
      window.setTimeout(() => {
        try {
          window.localStorage.setItem(
            draftKey,
            JSON.stringify(deferredAnswers)
          );
        } catch {
          // Le quiz continue même si localStorage
          // est indisponible ou plein.
        }
      }, 180);

    return () =>
      window.clearTimeout(task);
  }, [
    deferredAnswers,
    draftKey,
  ]);

  /*
   * ============================================================
   * MINUTEUR
   * ============================================================
   */

  useEffect(() => {
    if (!started || submitting) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setElapsed(
          (value) => value + 1
        );
      }, 1000);

    return () =>
      window.clearInterval(interval);
  }, [
    started,
    submitting,
  ]);

  /*
   * ============================================================
   * DEMARRER
   * ============================================================
   */

  async function start() {
    if (!quiz || starting) {
      return;
    }

    setStarting(true);
    setStatus(labels.starting);

    try {
      const attempt =
        await quizService.start(
          quiz.id
        );

      setAttemptId(
        attempt.attempt_id
      );

      setStarted(true);
      setElapsed(0);
      setStatus(null);

      /*
       * IMPORTANT :
       * On ne force plus le plein écran sur mobile.
       *
       * Le Fullscreen API peut modifier le viewport
       * de façon différente selon Chrome Android,
       * Samsung Internet et certains navigateurs intégrés.
       *
       * On le conserve uniquement pour les écrans
       * suffisamment larges.
       */
      if (
        typeof window !== "undefined" &&
        window.matchMedia(
          "(min-width: 768px)"
        ).matches
      ) {
        await document.documentElement
          .requestFullscreen?.()
          .catch(() => undefined);
      }
    } catch (startError) {
      setStatus(
        startError instanceof ApiError
          ? startError.message
          : labels.startError
      );
    } finally {
      setStarting(false);
    }
  }

  /*
   * ============================================================
   * TERMINER LE QUIZ
   * ============================================================
   */

  const finish = useCallback(
    async (skipConfirm = false) => {
      if (!quiz || !attemptId) {
        return;
      }

      const confirmed =
        skipConfirm ||
        window.confirm(
          labels.confirmFinish
        );

      if (!confirmed) {
        return;
      }

      setSubmitting(true);
      setStatus(labels.submitting);

      try {
        const result =
          await quizService.submit(
            quiz.id,
            attemptId,
            answers
          );

        try {
          window.localStorage.removeItem(
            draftKey
          );
        } catch {
          // Ignorer une éventuelle erreur localStorage.
        }

        router.push(
          `/quizzes/${quiz.id}/result?attempt=${result.attempt_id}`
        );
      } catch (submitError) {
        setStatus(
          submitError instanceof ApiError
            ? submitError.message
            : labels.submitError
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      answers,
      attemptId,
      draftKey,
      labels.confirmFinish,
      labels.submitError,
      labels.submitting,
      quiz,
      router,
    ]
  );

  /*
   * ============================================================
   * EXPIRATION
   * ============================================================
   */

  useEffect(() => {
    if (
      started &&
      attemptId &&
      elapsed >= effectiveTotalSeconds &&
      !submitting
    ) {
      const task =
        window.setTimeout(() => {
          finish(true);
        }, 0);

      return () =>
        window.clearTimeout(task);
    }
  }, [
    attemptId,
    effectiveTotalSeconds,
    elapsed,
    finish,
    started,
    submitting,
  ]);

  /*
   * ============================================================
   * CHOIX D'UNE REPONSE
   * ============================================================
   */

  const chooseAnswer = useCallback(
    (
      questionId: string,
      choiceId: string,
      isCorrect?: boolean
    ) => {
      setAnswers((current) => ({
        ...current,
        [questionId]: choiceId,
      }));

      if (
        mode === "TRAINING" &&
        isCorrect !== undefined
      ) {
        const nextFeedback =
          isCorrect
            ? "correct"
            : "wrong";

        setFeedback((current) => ({
          ...current,
          [questionId]:
            nextFeedback,
        }));

        setVisualFeedback(
          nextFeedback
        );

        if (
          !isCorrect &&
          typeof navigator !== "undefined"
        ) {
          navigator.vibrate?.(60);
        }

        window.setTimeout(
          () =>
            setVisualFeedback(null),
          520
        );
      }
    },
    [mode]
  );

  /*
   * ============================================================
   * ETATS
   * ============================================================
   */

  if (loading) {
    return (
      <LoadingState
        label={labels.loading}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
      />
    );
  }

  if (!quiz) {
    return (
      <ErrorState
        title={labels.notFound}
        message={labels.notFoundHelp}
      />
    );
  }

  if (!canPlayQuiz(user, quiz)) {
    return (
      <ErrorState
        title={labels.notAllowed}
        message={labels.notAllowedHelp}
      />
    );
  }

  const questions =
    quiz.questions || [];

  if (!questions.length) {
    return (
      <ErrorState
        title={labels.noQuestions}
        message={
          labels.noQuestionsHelp
        }
      />
    );
  }

  const safeIndex = Math.min(
    index,
    questions.length - 1
  );

  const question =
    questions[safeIndex] as QuizQuestion;

  const choices =
    question.choices || [];

  const progress =
    Math.round(
      ((safeIndex + 1) /
        questions.length) *
        100
    );

  const answeredCount =
    Object.keys(answers).length;

  const effectiveRemaining =
    Math.max(
      0,
      effectiveTotalSeconds -
        elapsed
    );

  const liveStreak =
    Object.values(feedback).filter(
      (value) =>
        value === "correct"
    ).length;

  return (
    <div
      className="
        grid
        min-w-0
        w-full
        max-w-full
        gap-4
        overflow-x-clip
        sm:gap-6
      "
    >
      {!started ? (
        /*
         * ========================================================
         * ECRAN DE DEMARRAGE
         * ========================================================
         */

        <section
          className="
            premium-surface
            min-w-0
            w-full
            max-w-full
            overflow-hidden
            rounded-[1.25rem]
            p-4
            text-white
            sm:rounded-[1.5rem]
            sm:p-6
          "
        >
          <p
            className="
              break-words
              text-xs
              font-black
              uppercase
              tracking-[0.12em]
              text-[#f6c445]
              sm:text-sm
              sm:tracking-[0.18em]
            "
          >
            {t("quiz.startQuiz")}
          </p>

          <h1
            className="
              mt-3
              break-words
              text-[clamp(1.45rem,6vw,2.25rem)]
              font-black
              leading-[1.12]
              sm:text-3xl
              md:text-5xl
            "
          >
            {quiz.title}
          </h1>

          <div
            className="
              mt-3
              max-w-3xl
              break-words
              text-sm
              font-bold
              leading-6
              text-white/75
              sm:mt-4
              sm:leading-7
            "
          >
            {quiz.description ||
              labels.noDescription}
          </div>

          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-2.5
              sm:mt-6
              sm:grid-cols-3
              sm:gap-3
            "
          >
            <IntroStat
              label={t(
                "quiz.questions"
              )}
              value={String(
                questions.length
              )}
            />

            <IntroStat
              label={t(
                "quiz.estimatedDuration"
              )}
              value={`${
                quiz.estimated_duration_minutes ||
                10
              } min`}
            />

            <IntroStat
              label={t(
                "quiz.passingScore"
              )}
              value={`${quiz.passing_score}%`}
            />
          </div>

          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-2
              sm:mt-6
              sm:grid-cols-3
            "
          >
            {(
              [
                "TRAINING",
                "EXAM",
                "SPEED",
              ] as const
            ).map(
              (
                item,
                modeIndex
              ) => (
                <button
                  key={`quiz-mode-${item}-${modeIndex}`}
                  type="button"
                  onClick={() =>
                    setMode(item)
                  }
                  className={`
                    min-h-12
                    w-full
                    rounded-2xl
                    border
                    p-3
                    text-left
                    text-sm
                    font-black
                    transition
                    active:scale-[0.99]
                    sm:p-4
                    ${
                      mode === item
                        ? "border-[#f6c445] bg-white text-[#071d3a]"
                        : "border-white/15 bg-white/10 text-white hover:bg-white/15"
                    }
                  `}
                >
                  {
                    labels.modes[
                      item
                    ]
                  }
                </button>
              )
            )}
          </div>

          <LoadingButton
            onClick={start}
            loading={starting}
            loadingLabel={
              labels.starting
            }
            variant="secondary"
            className="
              mt-5
              min-h-12
              w-full
              rounded-2xl
              bg-[#f6c445]
              text-[#071d3a]
              hover:bg-[#e7b52c]
              sm:mt-6
              sm:w-auto
              sm:rounded-full
            "
          >
            {!starting && (
              <CheckCircle2
                size={18}
              />
            )}

            {t("quiz.startQuiz")}
          </LoadingButton>
        </section>
      ) : (
        <>
          {/*
           * ======================================================
           * BARRE DE CONTROLE MOBILE-FIRST
           * ======================================================
           *
           * Mobile :
           *   ligne 1 = question + pourcentage
           *   ligne 2 = série + réponses + minuteur
           *
           * Desktop :
           *   progression à gauche
           *   statistiques à droite
           */}

          <section
            className="
              sticky
              top-2
              z-20
              min-w-0
              w-full
              max-w-full
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white/96
              px-3
              py-2.5
              shadow-md
              shadow-[#071d3a]/8
              backdrop-blur-xl
              supports-[backdrop-filter]:bg-white/90
              sm:top-4
              sm:rounded-[1.25rem]
              sm:px-4
              sm:py-3
            "
          >
            <div
              className="
                flex
                min-w-0
                flex-col
                gap-2
                sm:flex-row
                sm:items-center
                sm:gap-3
              "
            >
              {/* PROGRESSION */}

              <div
                className="
                  min-w-0
                  flex-1
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    justify-between
                    gap-2
                  "
                >
                  <span
                    className="
                      shrink-0
                      text-xs
                      font-black
                      text-slate-600
                      sm:text-sm
                    "
                  >
                    {safeIndex + 1}/
                    {questions.length}
                  </span>

                  <span
                    className="
                      shrink-0
                      text-[10px]
                      font-black
                      text-slate-400
                      sm:text-xs
                    "
                  >
                    {progress}%
                  </span>
                </div>

                <div
                  className="
                    mt-1
                    h-1.5
                    w-full
                    overflow-hidden
                    rounded-full
                    bg-slate-100
                    sm:mt-1.5
                    sm:h-2
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-[#f6c445]
                      transition-[width]
                      duration-300
                    "
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              {/* STATISTIQUES + MINUTEUR */}

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  justify-between
                  gap-1.5
                  sm:justify-end
                  sm:gap-2
                "
              >
                {/* SERIE */}

                <span
                  className="
                    inline-flex
                    min-w-0
                    shrink
                    items-center
                    justify-center
                    gap-1
                    rounded-full
                    bg-[#fff7df]
                    px-2
                    py-1.5
                    text-xs
                    font-black
                    text-[#071d3a]
                    sm:gap-1.5
                    sm:px-3
                    sm:py-2
                    sm:text-sm
                  "
                  title={labels.streak}
                >
                  <Flame
                    size={14}
                    className="shrink-0"
                  />

                  <span className="hidden sm:inline">
                    {labels.streak}:
                  </span>

                  {liveStreak}
                </span>

                {/* REPONSES */}

                <span
                  className="
                    inline-flex
                    min-w-0
                    shrink
                    items-center
                    justify-center
                    gap-1
                    rounded-full
                    bg-slate-100
                    px-2
                    py-1.5
                    text-xs
                    font-black
                    text-[#071d3a]
                    sm:gap-1.5
                    sm:px-3
                    sm:py-2
                    sm:text-sm
                  "
                  title={labels.answers}
                >
                  <Clock3
                    size={14}
                    className="shrink-0"
                  />

                  {answeredCount}/
                  {questions.length}
                </span>

                {/* MINUTEUR */}

                <div
                  className={`
                    inline-flex
                    shrink-0
                    items-center
                    justify-center
                    gap-1
                    rounded-full
                    px-2.5
                    py-1.5
                    text-sm
                    font-black
                    tabular-nums
                    sm:gap-1.5
                    sm:px-3
                    sm:py-2
                    sm:text-base
                    ${
                      effectiveRemaining <
                      60
                        ? "bg-red-50 text-red-600"
                        : "bg-[#e8f5ee] text-[#0f5f3a]"
                    }
                  `}
                  title={
                    labels.remaining
                  }
                >
                  <Timer
                    size={15}
                    className="shrink-0"
                  />

                  <span>
                    {formatTime(
                      effectiveRemaining
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/*
           * ======================================================
           * QUESTION
           * ======================================================
           */}

          <ActiveQuestion
            question={question}
            choices={choices}
            selectedChoiceId={
              answers[question.id]
            }
            feedback={
              feedback[
                question.id
              ]
            }
            mode={mode}
            visualFeedback={
              visualFeedback
            }
            onChoose={
              chooseAnswer
            }
          />

          {/*
           * ======================================================
           * NAVIGATION
           * ======================================================
           */}

          <div
            className="
              flex
              min-w-0
              flex-col
              gap-2.5
              sm:gap-3
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <LoadingButton
              type="button"
              disabled={
                safeIndex === 0
              }
              onClick={() =>
                setIndex(
                  (value) =>
                    Math.max(
                      0,
                      value - 1
                    )
                )
              }
              variant="primary"
              className="
                min-h-12
                w-full
                rounded-2xl
                sm:w-auto
                sm:rounded-full
              "
            >
              <ArrowLeft
                size={18}
              />

              {labels.previous}
            </LoadingButton>

            <div
              className="
                flex
                min-w-0
                flex-col
                gap-2
                sm:flex-row
                sm:flex-wrap
                sm:gap-3
                md:justify-end
              "
            >
              {safeIndex <
              questions.length -
                1 ? (
                <LoadingButton
                  type="button"
                  onClick={() =>
                    setIndex(
                      (value) =>
                        Math.min(
                          questions.length -
                            1,
                          value + 1
                        )
                    )
                  }
                  variant="secondary"
                  className="
                    min-h-12
                    w-full
                    rounded-2xl
                    bg-[#f6c445]
                    text-[#071d3a]
                    hover:bg-[#e7b52c]
                    sm:w-auto
                    sm:rounded-full
                  "
                >
                  {labels.next}

                  <ArrowRight
                    size={18}
                  />
                </LoadingButton>
              ) : (
                <LoadingButton
                  type="button"
                  disabled={
                    submitting
                  }
                  loading={
                    submitting
                  }
                  loadingLabel={
                    labels.submitting
                  }
                  onClick={() =>
                    finish()
                  }
                  variant="secondary"
                  className="
                    min-h-12
                    w-full
                    rounded-2xl
                    bg-[#f6c445]
                    text-[#071d3a]
                    hover:bg-[#e7b52c]
                    sm:w-auto
                    sm:rounded-full
                  "
                >
                  {t(
                    "quiz.finishQuiz"
                  )}
                </LoadingButton>
              )}
            </div>
          </div>
        </>
      )}

      {/*
       * ==========================================================
       * MESSAGE
       * ==========================================================
       */}

      {status && (
        <p
          className="
            min-w-0
            max-w-full
            break-words
            rounded-2xl
            bg-slate-100
            p-3
            text-sm
            font-black
            leading-5
            text-slate-700
            sm:p-4
          "
        >
          <AlertTriangle
            className="mr-2 inline shrink-0"
            size={18}
          />

          {status}
        </p>
      )}

      <Link
        href={`/quizzes/${quiz.id}`}
        className="
          w-fit
          max-w-full
          break-words
          text-sm
          font-black
          text-[#0f5f3a]
        "
      >
        {labels.back}
      </Link>
    </div>
  );
}

/*
 * ================================================================
 * QUESTION ACTIVE
 * ================================================================
 */

const ActiveQuestion = memo(
  function ActiveQuestion({
    question,
    choices,
    selectedChoiceId,
    feedback,
    mode,
    visualFeedback,
    onChoose,
  }: {
    question: QuizQuestion;
    choices: NonNullable<
      QuizQuestion["choices"]
    >;
    selectedChoiceId?: string;
    feedback?:
      | "correct"
      | "wrong";
    mode:
      | "TRAINING"
      | "EXAM"
      | "SPEED";
    visualFeedback:
      | "correct"
      | "wrong"
      | null;
    onChoose: (
      questionId: string,
      choiceId: string,
      isCorrect?: boolean
    ) => void;
  }) {
    return (
      <section
        key={`quiz-active-question-${question.id}`}
        className={`
          ds-card
          min-w-0
          w-full
          max-w-full
          overflow-hidden
          rounded-[1.25rem]
          p-4
          sm:rounded-[1.5rem]
          sm:p-6
          ${
            visualFeedback ===
            "correct"
              ? "ring-4 ring-[#0f5f3a]/20"
              : visualFeedback ===
                "wrong"
                ? "animate-[quiz-shake_420ms_ease] ring-4 ring-red-200"
                : "premium-fade-in"
          }
        `}
      >
        <p
          className="
            break-words
            text-[10px]
            font-black
            uppercase
            tracking-[0.12em]
            text-slate-500
            sm:text-xs
            sm:tracking-[0.16em]
          "
        >
          {question.question_type}
        </p>

        {/*
         * QUESTION
         *
         * MathText est utilisé ici afin que les expressions
         * mathématiques puissent être rendues correctement.
         */}
        <div
          className="
            mt-3
            min-w-0
            max-w-full
            overflow-x-auto
            overscroll-x-contain
            sm:mt-4
          "
        >
          <div
            className="
              min-w-0
              max-w-full
              break-words
              text-xl
              font-black
              leading-7
              text-[#071d3a]
              sm:text-2xl
              sm:leading-9
            "
          >
            <MathText
              content={
                question.question_text
              }
            />
          </div>
        </div>

        {/*
         * REPONSES
         */}

        <div
          className="
            mt-5
            grid
            min-w-0
            max-w-full
            gap-2.5
            sm:mt-6
            sm:gap-3
          "
        >
          {choices.map(
            (
              choice,
              choiceIndex
            ) => {
              const selected =
                selectedChoiceId ===
                choice.id;

              const reveal =
                mode ===
                  "TRAINING" &&
                selected &&
                feedback;

              return (
                <button
                  key={`quiz-choice-${question.id}-${choice.id}-${choiceIndex}`}
                  type="button"
                  onClick={() =>
                    onChoose(
                      question.id,
                      choice.id,
                      choice.is_correct
                    )
                  }
                  className={`
                    native-press
                    min-h-14
                    min-w-0
                    w-full
                    max-w-full
                    overflow-hidden
                    rounded-2xl
                    border
                    p-3.5
                    text-left
                    text-sm
                    font-black
                    transition
                    active:scale-[0.995]
                    sm:min-h-16
                    sm:p-4
                    ${
                      reveal ===
                      "correct"
                        ? "reward-sheen border-[#0f5f3a] bg-[#e8f5ee] text-[#082f1f]"
                        : reveal ===
                            "wrong"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : selected
                            ? "border-[#0f5f3a] bg-[#e8f5ee] text-[#082f1f]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#f6c445]"
                    }
                  `}
                >
                  <span
                    className="
                      flex
                      min-w-0
                      max-w-full
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    {/*
                     * Texte / formule de la réponse.
                     *
                     * La zone peut défiler horizontalement si
                     * une formule est exceptionnellement longue,
                     * sans provoquer de débordement de toute la page.
                     */}
                    <span
                      className="
                        min-w-0
                        max-w-full
                        flex-1
                        overflow-x-auto
                        overscroll-x-contain
                        break-words
                        leading-5
                      "
                    >
                      <MathText
                        content={
                          choice.choice_text
                        }
                      />
                    </span>

                    {reveal ===
                      "correct" && (
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0"
                      />
                    )}

                    {reveal ===
                      "wrong" && (
                      <XCircle
                        size={20}
                        className="mt-0.5 shrink-0"
                      />
                    )}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/*
         * EXPLICATION
         */}

        {mode ===
          "TRAINING" &&
          feedback &&
          question.explanation && (
            <div
              className="
                mt-4
                min-w-0
                max-w-full
                overflow-hidden
                rounded-2xl
                bg-[#fff7df]
                p-3.5
                text-sm
                font-bold
                leading-6
                text-[#071d3a]
                sm:mt-5
                sm:p-4
              "
            >
              <div
                className="
                  min-w-0
                  max-w-full
                  overflow-x-auto
                  overscroll-x-contain
                "
              >
                <MathText
                  content={
                    question.explanation
                  }
                />
              </div>
            </div>
          )}
      </section>
    );
  }
);

/*
 * ================================================================
 * STAT INTRO
 * ================================================================
 */

function IntroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        min-w-0
        w-full
        rounded-2xl
        bg-white/10
        p-3
        sm:p-4
      "
    >
      <p
        className="
          break-words
          text-[10px]
          font-black
          uppercase
          tracking-[0.12em]
          text-white/60
          sm:text-xs
          sm:tracking-[0.14em]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          break-words
          text-xl
          font-black
          sm:mt-2
          sm:text-2xl
        "
      >
        {value}
      </p>
    </div>
  );
}

/*
 * ================================================================
 * FORMATAGE DU TEMPS
 * ================================================================
 */

function formatTime(
  seconds: number
) {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const minutes =
    Math.floor(
      safeSeconds / 60
    );

  const rest =
    safeSeconds % 60;

  return `${minutes}:${String(
    rest
  ).padStart(2, "0")}`;
}

/*
 * ================================================================
 * LABELS
 * ================================================================
 */

function pageLabels(
  language: string
) {
  const fr =
    language !== "EN";

  return {
    loading: fr
      ? "Préparation du quiz..."
      : "Preparing quiz...",

    loadError: fr
      ? "Chargement impossible."
      : "Unable to load.",

    notFound: fr
      ? "Quiz introuvable"
      : "Quiz not found",

    notFoundHelp: fr
      ? "Aucun quiz n'a été retourné."
      : "No quiz was returned.",

    notAllowed: fr
      ? "Action non autorisée"
      : "Action not allowed",

    notAllowedHelp: fr
      ? "Votre rôle ne permet pas de passer ce quiz."
      : "Your role cannot play this quiz.",

    noQuestions: fr
      ? "Questions indisponibles"
      : "Questions unavailable",

    noQuestionsHelp: fr
      ? "Ajoutez des questions avant de lancer cette évaluation."
      : "Add questions before starting this assessment.",

    noDescription: fr
      ? "Aucune description."
      : "No description.",

    starting: fr
      ? "Démarrage..."
      : "Starting...",

    startError: fr
      ? "Démarrage impossible."
      : "Unable to start.",

    submitting: fr
      ? "Soumission..."
      : "Submitting...",

    submitError: fr
      ? "Soumission impossible. Vérifiez votre connexion puis réessayez."
      : "Unable to submit. Check your connection and retry.",

    confirmFinish: fr
      ? "Terminer et soumettre ce quiz ?"
      : "Finish and submit this quiz?",

    streak: fr
      ? "Série"
      : "Streak",

    answers: fr
      ? "Réponses"
      : "Answers",

    remaining: fr
      ? "Temps restant"
      : "Time remaining",

    previous: fr
      ? "Précédent"
      : "Previous",

    next: fr
      ? "Suivant"
      : "Next",

    back: fr
      ? "Retour au détail du quiz"
      : "Back to quiz detail",

    modes: {
      TRAINING: fr
        ? "Mode entraînement"
        : "Training mode",

      EXAM: fr
        ? "Mode examen"
        : "Exam mode",

      SPEED: fr
        ? "Mode rapidité"
        : "Speed mode",
    },
  };
}
```
