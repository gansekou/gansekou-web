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

  /*
   * ============================================================
   * LANGUE
   * ============================================================
   */

  const fr = language === "FR";

  /*
   * ============================================================
   * LIBELLES
   * ============================================================
   */

  const labels = useMemo(
    () => ({
      loading: fr
        ? "Chargement du quiz..."
        : "Loading quiz...",

      loadError: fr
        ? "Chargement impossible."
        : "Unable to load the quiz.",

      notFound: fr
        ? "Quiz introuvable"
        : "Quiz not found",

      notFoundHelp: fr
        ? "Aucun quiz n'a été trouvé."
        : "No quiz was found.",

      notAllowed: fr
        ? "Accès non autorisé"
        : "Access not allowed",

      notAllowedHelp: fr
        ? "Vous n'avez pas accès à ce quiz."
        : "You do not have access to this quiz.",

      noQuestions: fr
        ? "Questions indisponibles"
        : "Questions unavailable",

      noQuestionsHelp: fr
        ? "Ce quiz ne contient actuellement aucune question."
        : "This quiz currently contains no questions.",

      noDescription: fr
        ? "Aucune description."
        : "No description.",

      starting: fr
        ? "Démarrage..."
        : "Starting...",

      startError: fr
        ? "Impossible de démarrer le quiz."
        : "Unable to start the quiz.",

      submitting: fr
        ? "Soumission..."
        : "Submitting...",

      submitError: fr
        ? "Impossible de soumettre le quiz."
        : "Unable to submit the quiz.",

      confirmFinish: fr
        ? "Voulez-vous vraiment terminer et soumettre ce quiz ?"
        : "Do you really want to finish and submit this quiz?",

      autoSubmit: fr
        ? "Le temps est écoulé. Le quiz va être soumis automatiquement."
        : "Time is up. The quiz will be submitted automatically.",

      previous: fr
        ? "Précédente"
        : "Previous",

      next: fr
        ? "Suivante"
        : "Next",

      back: fr
        ? "Retour au détail du quiz"
        : "Back to quiz details",

      question: fr
        ? "Question"
        : "Question",

      questions: fr
        ? "Questions"
        : "Questions",

      answered: fr
        ? "répondues"
        : "answered",

      duration: fr
        ? "Durée"
        : "Duration",

      requiredScore: fr
        ? "Score requis"
        : "Required score",

      mode: fr
        ? "Mode"
        : "Mode",

      streak: fr
        ? "Série"
        : "Streak",

      answers: fr
        ? "Réponses"
        : "Answers",

      remaining: fr
        ? "Temps restant"
        : "Time remaining",

      timeExpired: fr
        ? "Temps écoulé"
        : "Time expired",

      noTimeLimit: fr
        ? "Sans limite"
        : "No limit",

      indexOf: fr
        ? "sur"
        : "of",

      hint: fr
        ? "Indice"
        : "Hint",

      explanation: fr
        ? "Explication"
        : "Explanation",

      currentQuestion: fr
        ? "Question actuelle"
        : "Current question",

      completedQuestion: fr
        ? "Question répondue"
        : "Answered question",

      unansweredQuestion: fr
        ? "Question non répondue"
        : "Unanswered question",

      training: fr
        ? "Mode entraînement"
        : "Training mode",

      exam: fr
        ? "Mode examen"
        : "Exam mode",

      speed: fr
        ? "Mode rapidité"
        : "Speed mode",

      standard: fr
        ? "Mode standard"
        : "Standard mode",

      startNow: fr
        ? "Démarrer maintenant"
        : "Start now",

      finish: fr
        ? "Terminer le quiz"
        : "Finish quiz",

      cancel: fr
        ? "Annuler"
        : "Cancel",

      confirm: fr
        ? "Confirmer"
        : "Confirm",

      min: "min",
    }),
    [fr]
  );

  /*
   * ============================================================
   * ETAT
   * ============================================================
   */

  const [quiz, setQuiz] =
    useState<Quiz | null>(null);

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [attemptId, setAttemptId] =
    useState<string | null>(null);

  const [started, setStarted] =
    useState(false);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [elapsed, setElapsed] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [submitting, setSubmitting] =
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

  /*
   * ============================================================
   * REPONSES DIFFEREES
   * ============================================================
   */

  const deferredAnswers =
    useDeferredValue(answers);

  /*
   * ============================================================
   * CLE DE SAUVEGARDE LOCALE
   * ============================================================
   */

  const draftKey =
    `gansekou_quiz_answers_${quizId}`;

  /*
   * ============================================================
   * DUREE
   *
   * IMPORTANT :
   * Quiz utilise estimated_duration_minutes.
   * ============================================================
   */

  const totalSeconds = useMemo(() => {
    if (!quiz) {
      return 600;
    }

    const rawDuration =
      Number(
        quiz.estimated_duration_minutes
      );

    if (
      !Number.isFinite(rawDuration) ||
      rawDuration <= 0
    ) {
      return 600;
    }

    return Math.round(
      rawDuration * 60
    );
  }, [quiz]);

  /*
   * ============================================================
   * DUREE EFFECTIVE SELON LE MODE
   * ============================================================
   */

  const effectiveTotalSeconds =
    useMemo(() => {
      if (mode !== "SPEED") {
        return totalSeconds;
      }

      return Math.max(
        60,
        Math.floor(
          totalSeconds * 0.55
        )
      );
    }, [
      mode,
      totalSeconds,
    ]);

  /*
   * ============================================================
   * CHARGEMENT
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const quizData =
          await quizService.getById(
            quizId
          );

        if (cancelled) {
          return;
        }

        setQuiz(quizData);

        const saved =
          window.localStorage.getItem(
            draftKey
          );

        if (saved) {
          try {
            const parsed =
              JSON.parse(
                saved
              ) as Record<
                string,
                string
              >;

            if (
              parsed &&
              typeof parsed ===
                "object"
            ) {
              setAnswers(
                parsed
              );
            }
          } catch {
            window.localStorage.removeItem(
              draftKey
            );
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : loadError instanceof Error
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

    void load();

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
            JSON.stringify(
              deferredAnswers
            )
          );
        } catch {
          // Le stockage local peut être indisponible.
        }
      }, 180);

    return () => {
      window.clearTimeout(
        task
      );
    };
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
    if (
      !started ||
      submitting
    ) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setElapsed(
          (value) =>
            value + 1
        );
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    started,
    submitting,
  ]);

  /*
   * ============================================================
   * DEMARRER UNE TENTATIVE
   * ============================================================
   */

  const start = useCallback(
    async () => {
      if (
        !quiz ||
        starting ||
        submitting
      ) {
        return;
      }

      setStarting(true);
      setStatus(
        labels.starting
      );

      try {
        /*
         * IMPORTANT :
         * La création de la tentative se fait
         * avec quizService.start().
         */
        const attempt =
          await quizService.start(
            quiz.id
          );

        setAttemptId(
          attempt.attempt_id
        );

        setStarted(true);
        setElapsed(0);
        setCurrentIndex(0);
        setFeedback({});
        setVisualFeedback(null);
        setStatus(null);

        try {
          await document.documentElement.requestFullscreen?.();
        } catch {
          // Le plein écran peut être refusé par le navigateur.
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
    },
    [
      labels.startError,
      labels.starting,
      quiz,
      starting,
      submitting,
    ]
  );

  /*
   * ============================================================
   * TERMINER LE QUIZ
   * ============================================================
   */

  const finish = useCallback(
    async (
      skipConfirm = false
    ) => {
      if (
        !quiz ||
        !attemptId ||
        submitting
      ) {
        return;
      }

      if (!skipConfirm) {
        const confirmed =
          window.confirm(
            labels.confirmFinish
          );

        if (!confirmed) {
          return;
        }
      }

      setSubmitting(true);
      setStatus(
        skipConfirm
          ? labels.autoSubmit
          : labels.submitting
      );

      try {
        /*
         * IMPORTANT :
         * Ton quizService utilise submit()
         * avec quiz.id + attemptId + answers.
         */
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
          // Rien à faire si localStorage est indisponible.
        }

        try {
          if (
            document.fullscreenElement
          ) {
            await document.exitFullscreen?.();
          }
        } catch {
          // Rien à faire si la sortie du plein écran échoue.
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
      labels.autoSubmit,
      labels.confirmFinish,
      labels.submitError,
      labels.submitting,
      quiz,
      router,
      submitting,
    ]
  );

  /*
   * ============================================================
   * EXPIRATION
   * ============================================================
   */

  useEffect(() => {
    if (
      !started ||
      !attemptId ||
      submitting
    ) {
      return;
    }

    if (
      elapsed <
      effectiveTotalSeconds
    ) {
      return;
    }

    const task =
      window.setTimeout(() => {
        void finish(true);
      }, 0);

    return () => {
      window.clearTimeout(
        task
      );
    };
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
   * QUESTIONS
   * ============================================================
   */

  const questions =
    useMemo<QuizQuestion[]>(
      () => {
        if (!quiz) {
          return [];
        }

        return Array.isArray(
          quiz.questions
        )
          ? quiz.questions
          : [];
      },
      [quiz]
    );

  /*
   * ============================================================
   * INDEX DE QUESTION SECURISE
   * ============================================================
   */

  const safeIndex =
    questions.length > 0
      ? Math.min(
          Math.max(
            currentIndex,
            0
          ),
          questions.length - 1
        )
      : 0;

  /*
   * ============================================================
   * QUESTION COURANTE
   * ============================================================
   */

  const question =
    questions[safeIndex] ?? null;

  /*
   * ============================================================
   * CHOIX DE LA QUESTION
   * ============================================================
   */

  const choices =
    question?.choices ?? [];

  /*
   * ============================================================
   * REPONSES
   * ============================================================
   */

  const answeredCount =
    useMemo(() => {
      return questions.reduce(
        (count, currentQuestion) => {
          const id =
            String(
              currentQuestion.id
            );

          return answers[id]
            ? count + 1
            : count;
        },
        0
      );
    }, [
      answers,
      questions,
    ]);

  /*
   * ============================================================
   * PROGRESSION
   * ============================================================
   */

  const progress =
    questions.length > 0
      ? Math.round(
          ((safeIndex + 1) /
            questions.length) *
            100
        )
      : 0;

  /*
   * ============================================================
   * TEMPS RESTANT
   * ============================================================
   */

  const effectiveRemaining =
    Math.max(
      0,
      effectiveTotalSeconds -
        elapsed
    );

  /*
   * ============================================================
   * SERIE
   * ============================================================
   */

  const liveStreak =
    Object.values(
      feedback
    ).filter(
      (value) =>
        value === "correct"
    ).length;

  /*
   * ============================================================
   * CHOISIR UNE REPONSE
   * ============================================================
   */

  const chooseAnswer =
    useCallback(
      (
        questionId: string,
        choiceId: string,
        isCorrect?: boolean
      ) => {
        if (
          !started ||
          submitting
        ) {
          return;
        }

        setAnswers(
          (current) => ({
            ...current,
            [questionId]:
              choiceId,
          })
        );

        /*
         * En mode entraînement,
         * on affiche immédiatement
         * le résultat du choix.
         */
        if (
          mode ===
            "TRAINING" &&
          isCorrect !==
            undefined
        ) {
          const nextFeedback =
            isCorrect
              ? "correct"
              : "wrong";

          setFeedback(
            (current) => ({
              ...current,
              [questionId]:
                nextFeedback,
            })
          );

          setVisualFeedback(
            nextFeedback
          );

          if (
            !isCorrect
          ) {
            try {
              navigator.vibrate?.(
                60
              );
            } catch {
              // Vibration non disponible.
            }
          }

          window.setTimeout(
            () => {
              setVisualFeedback(
                null
              );
            },
            520
          );
        }
      },
      [
        mode,
        started,
        submitting,
      ]
    );

  /*
   * ============================================================
   * NAVIGATION PRECEDENTE
   * ============================================================
   */

  const goPrevious =
    useCallback(() => {
      setCurrentIndex(
        (value) =>
          Math.max(
            0,
            value - 1
          )
      );
    }, []);

  /*
   * ============================================================
   * NAVIGATION SUIVANTE
   * ============================================================
   */

  const goNext =
    useCallback(() => {
      if (
        questions.length ===
        0
      ) {
        return;
      }

      setCurrentIndex(
        (value) =>
          Math.min(
            questions.length -
              1,
            value + 1
          )
      );
    }, [
      questions.length,
    ]);

  /*
   * ============================================================
   * NAVIGATION DIRECTE
   * ============================================================
   */

  const goToQuestion =
    useCallback(
      (targetIndex: number) => {
        if (
          targetIndex < 0 ||
          targetIndex >=
            questions.length
        ) {
          return;
        }

        setCurrentIndex(
          targetIndex
        );
      },
      [questions.length]
    );

  /*
   * ============================================================
   * ETAT CHARGEMENT
   * ============================================================
   */

  if (loading) {
    return (
      <LoadingState
        label={
          labels.loading
        }
      />
    );
  }

  /*
   * ============================================================
   * ETAT ERREUR
   * ============================================================
   */

  if (error) {
    return (
      <ErrorState
        title={
          labels.loadError
        }
        message={error}
      />
    );
  }

  /*
   * ============================================================
   * QUIZ ABSENT
   * ============================================================
   */

  if (!quiz) {
    return (
      <ErrorState
        title={
          labels.notFound
        }
        message={
          labels.notFoundHelp
        }
      />
    );
  }

  /*
   * ============================================================
   * ACCES
   * ============================================================
   */

  if (
    !canPlayQuiz(
      user,
      quiz
    )
  ) {
    return (
      <ErrorState
        title={
          labels.notAllowed
        }
        message={
          labels.notAllowedHelp
        }
      />
    );
  }

  /*
   * ============================================================
   * QUESTIONS ABSENTES
   * ============================================================
   */

  if (
    !questions.length
  ) {
    return (
      <ErrorState
        title={
          labels.noQuestions
        }
        message={
          labels.noQuestionsHelp
        }
      />
    );
  }

  /*
   * ============================================================
   * QUESTION ABSENTE
   * ============================================================
   */

  if (!question) {
    return (
      <ErrorState
        title={
          labels.noQuestions
        }
        message={
          labels.noQuestionsHelp
        }
      />
    );
  }

  /*
   * ============================================================
   * REPONSE SELECTIONNEE
   * ============================================================
   */

  const questionId =
    String(
      question.id
    );

  const selectedChoiceId =
    answers[
      questionId
    ];

  const currentFeedback =
    feedback[
      questionId
    ];

  /*
   * ============================================================
   * RENDU
   * ============================================================
   */

  return (
    <div
      className="
        grid
        min-w-0
        gap-4
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
            overflow-hidden
            rounded-[1.5rem]
            p-4
            text-white
            sm:rounded-[1.75rem]
            sm:p-6
          "
        >
          <p
            className="
              break-words
              text-xs
              font-black
              uppercase
              tracking-[0.14em]
              text-[#f6c445]
              sm:text-sm
              sm:tracking-[0.18em]
            "
          >
            {t(
              "quiz.startQuiz"
            )}
          </p>

          <h1
            className="
              mt-3
              break-words
              text-2xl
              font-black
              leading-tight
              sm:text-3xl
              md:text-5xl
            "
          >
            {
              quiz.title
            }
          </h1>

          <p
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
            {
              quiz.description ||
              labels.noDescription
            }
          </p>

          <div
            className="
              mt-5
              grid
              gap-3
              sm:mt-6
              md:grid-cols-3
            "
          >
            <IntroStat
              label={
                labels.questions
              }
              value={String(
                questions.length
              )}
            />

            <IntroStat
              label={
                labels.duration
              }
              value={`${
                quiz.estimated_duration_minutes ||
                10
              } ${
                labels.min
              }`}
            />

            <IntroStat
              label={
                labels.requiredScore
              }
              value={`${quiz.passing_score}%`}
            />
          </div>

          <div
            className="
              mt-5
              grid
              gap-2
              sm:mt-6
              md:grid-cols-3
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
                    setMode(
                      item
                    )
                  }
                  className={`
                    min-h-12
                    rounded-2xl
                    border
                    p-3
                    text-left
                    text-sm
                    font-black
                    transition
                    sm:p-4
                    ${
                      mode ===
                      item
                        ? "border-[#f6c445] bg-white text-[#071d3a]"
                        : "border-white/15 bg-white/10 text-white hover:bg-white/15"
                    }
                  `}
                >
                  {item ===
                  "TRAINING"
                    ? labels.training
                    : item ===
                        "EXAM"
                      ? labels.exam
                      : labels.speed}
                </button>
              )
            )}
          </div>

          <LoadingButton
            onClick={
              start
            }
            loading={
              starting
            }
            loadingLabel={
              labels.starting
            }
            variant="secondary"
            className="
              mt-5
              w-full
              bg-[#f6c445]
              text-[#071d3a]
              hover:bg-[#e7b52c]
              sm:mt-6
              sm:w-auto
            "
          >
            {!starting && (
              <CheckCircle2
                size={18}
              />
            )}

            {labels.startNow}
          </LoadingButton>
        </section>
      ) : (
        <>
          {/*
           * ======================================================
           * BARRE DE CONTROLE
           * ======================================================
           */}

          <section
            className="
              sticky
              top-16
              z-20
              min-w-0
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white/95
              px-3
              py-2
              shadow-md
              shadow-[#071d3a]/8
              backdrop-blur-xl
              sm:top-24
              sm:rounded-[1.25rem]
              sm:px-4
              sm:py-3
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-2
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
                    {safeIndex +
                      1}
                    /
                    {
                      questions.length
                    }
                  </span>

                  <span
                    className="
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
                      transition-all
                    "
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              {/* SERIE */}

              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
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
                title={
                  labels.streak
                }
              >
                <Flame
                  size={14}
                  className="shrink-0"
                />

                <span className="hidden sm:inline">
                  {
                    labels.streak
                  }
                  :
                </span>

                {
                  liveStreak
                }
              </span>

              {/* REPONSES */}

              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
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
                title={
                  labels.answers
                }
              >
                <CheckCircle2
                  size={14}
                  className="shrink-0"
                />

                {
                  answeredCount
                }
                /
                {
                  questions.length
                }
              </span>

              {/* MINUTEUR */}

              <div
                className={`
                  inline-flex
                  shrink-0
                  items-center
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

                {formatTime(
                  effectiveRemaining
                )}
              </div>
            </div>
          </section>

          {/*
           * ======================================================
           * QUESTION ACTIVE
           * ======================================================
           */}

          <ActiveQuestion
            question={
              question
            }
            choices={
              choices
            }
            selectedChoiceId={
              selectedChoiceId
            }
            feedback={
              currentFeedback
            }
            mode={
              mode
            }
            visualFeedback={
              visualFeedback
            }
            onChoose={
              chooseAnswer
            }
            labels={{
              hint:
                labels.hint,
              explanation:
                labels.explanation,
            }}
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
              gap-2
              sm:gap-3
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <LoadingButton
              type="button"
              disabled={
                safeIndex ===
                0
              }
              onClick={
                goPrevious
              }
              variant="primary"
              className="
                w-full
                rounded-full
                sm:w-auto
              "
            >
              <ArrowLeft
                size={18}
              />

              {
                labels.previous
              }
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
              "
            >
              {safeIndex <
              questions.length -
                1 ? (
                <LoadingButton
                  type="button"
                  onClick={
                    goNext
                  }
                  variant="secondary"
                  className="
                    w-full
                    rounded-full
                    bg-[#f6c445]
                    text-[#071d3a]
                    hover:bg-[#e7b52c]
                    sm:w-auto
                  "
                >
                  {
                    labels.next
                  }

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
                    void finish()
                  }
                  variant="secondary"
                  className="
                    w-full
                    rounded-full
                    bg-[#f6c445]
                    text-[#071d3a]
                    hover:bg-[#e7b52c]
                    sm:w-auto
                  "
                >
                  {
                    labels.finish
                  }
                </LoadingButton>
              )}
            </div>
          </div>

          {/*
           * ======================================================
           * NAVIGATION DES QUESTIONS
           * ======================================================
           */}

          <section
            className="
              min-w-0
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
              sm:p-5
            "
          >
            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <h2
                className="
                  text-sm
                  font-black
                  text-[#071d3a]
                "
              >
                {
                  labels.questions
                }
              </h2>

              <span
                className="
                  text-xs
                  font-bold
                  text-slate-400
                "
              >
                {
                  answeredCount
                }
                /
                {
                  questions.length
                }
              </span>
            </div>

            <div
              className="
                grid
                grid-cols-8
                gap-2
                sm:grid-cols-10
                md:grid-cols-12
              "
            >
              {questions.map(
                (
                  currentQuestion,
                  questionIndex
                ) => {
                  const id =
                    String(
                      currentQuestion.id
                    );

                  const answered =
                    Boolean(
                      answers[id]
                    );

                  const active =
                    questionIndex ===
                    safeIndex;

                  return (
                    <button
                      key={`quiz-navigation-${id}-${questionIndex}`}
                      type="button"
                      onClick={() =>
                        goToQuestion(
                          questionIndex
                        )
                      }
                      className={`
                        flex
                        aspect-square
                        items-center
                        justify-center
                        rounded-lg
                        border
                        text-xs
                        font-black
                        transition
                        ${
                          active
                            ? "border-[#0f5f3a] bg-[#0f5f3a] text-white"
                            : answered
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-500 hover:border-[#f6c445] hover:bg-[#fffaf0]"
                        }
                      `}
                    >
                      {
                        questionIndex +
                          1
                      }
                    </button>
                  );
                }
              )}
            </div>
          </section>
        </>
      )}

      {/*
       * ==========================================================
       * STATUS
       * ==========================================================
       */}

      {status && (
        <p
          className="
            min-w-0
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

      {/*
       * ==========================================================
       * RETOUR
       * ==========================================================
       */}

      <Link
        href={`/quizzes/${quiz.id}`}
        className="
          w-fit
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
    labels,
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
    labels: {
      hint: string;
      explanation: string;
    };
  }) {
    return (
      <section
        className={`
          ds-card
          min-w-0
          overflow-hidden
          rounded-[1.5rem]
          p-4
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
            text-[11px]
            font-black
            uppercase
            tracking-[0.14em]
            text-slate-500
            sm:text-xs
            sm:tracking-[0.16em]
          "
        >
          {
            question.question_type
          }
        </p>

        <div
          className="
            mt-3
            break-words
            text-xl
            font-black
            leading-7
            text-[#071d3a]
            sm:text-2xl
            sm:leading-9
          "
        >
          <MathText>
            {
              question.question_text
            }
          </MathText>
        </div>

        {question.image_url && (
          <div
            className="
              mt-5
              overflow-hidden
              rounded-2xl
              border
              bg-slate-50
              p-2
              sm:mt-6
            "
          >
            <img
              src={
                question.image_url
              }
              alt=""
              className="
                mx-auto
                max-h-[420px]
                max-w-full
                object-contain
              "
            />
          </div>
        )}

        <div
          className="
            mt-5
            grid
            min-w-0
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

              const letter =
                String.fromCharCode(
                  65 +
                    choiceIndex
                );

              return (
                <button
                  key={`quiz-choice-${question.id}-${choice.id}-${choiceIndex}`}
                  type="button"
                  onClick={() =>
                    onChoose(
                      String(
                        question.id
                      ),
                      choice.id,
                      choice.is_correct
                    )
                  }
                  className={`
                    native-press
                    min-h-14
                    min-w-0
                    overflow-hidden
                    rounded-2xl
                    border
                    p-3.5
                    text-left
                    text-sm
                    font-black
                    transition
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
                      items-center
                      gap-3
                    "
                  >
                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        text-sm
                        font-black
                        ${
                          selected
                            ? "border-[#0f5f3a] bg-[#0f5f3a] text-white"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      `}
                    >
                      {
                        letter
                      }
                    </span>

                    <span
                      className="
                        min-w-0
                        flex-1
                        break-words
                        leading-6
                      "
                    >
                      <MathText>
                        {
                          choice.choice_text
                        }
                      </MathText>
                    </span>

                    {reveal ===
                      "correct" && (
                      <CheckCircle2
                        size={20}
                        className="shrink-0"
                      />
                    )}

                    {reveal ===
                      "wrong" && (
                      <XCircle
                        size={20}
                        className="shrink-0"
                      />
                    )}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {mode ===
          "TRAINING" &&
          feedback &&
          question.explanation && (
            <div
              className="
                mt-4
                min-w-0
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
              <p className="mb-1 font-black">
                {
                  labels.explanation
                }
              </p>

              <MathText>
                {
                  question.explanation
                }
              </MathText>
            </div>
          )}

        {question.hint && (
          <div
            className="
              mt-4
              min-w-0
              overflow-hidden
              rounded-2xl
              border
              border-amber-200
              bg-amber-50
              p-3.5
              text-sm
              font-bold
              leading-6
              text-amber-900
              sm:mt-5
              sm:p-4
            "
          >
            <p className="mb-1 font-black">
              {
                labels.hint
              }
            </p>

            <MathText>
              {
                question.hint
              }
            </MathText>
          </div>
        )}
      </section>
    );
  }
);

/*
 * ================================================================
 * STATISTIQUE INTRO
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
        {
          label
        }
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
        {
          value
        }
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

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    rest
  ).padStart(
    2,
    "0"
  )}`;
}

export default memo(
  QuizPlayPage
);
