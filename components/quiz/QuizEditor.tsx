"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Save } from "lucide-react";
import { QuizImportPanel } from "@/components/quiz/QuizImportPanel";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/hooks/useI18n";
import { quizService } from "@/services/quiz.service";
import { canManageQuizQuestions, canUseQuizAI } from "@/lib/permissions";
import {
  createEmptyQuestion,
  QuizQuestionList,
} from "@/components/quiz/QuizQuestionList";
import type { EditableQuizQuestion } from "@/components/quiz/QuizQuestionEditor";
import type { Level, Subject } from "@/types/education";
import type { Content } from "@/types/content";
import type { Quiz, QuizCreatePayload } from "@/types/quiz";
import type { User } from "@/types/user";

type Props = {
  user: User;
  quiz?: Quiz | null;
  subjects: Subject[];
  levels: Level[];
  courses: Content[];
};

export function QuizEditor({
  user,
  quiz,
  subjects,
  levels,
  courses,
}: Props) {
  const router = useRouter();
  const { language, t } = useI18n(user);

  const text = useMemo(
    () => quizLabels(language),
    [language]
  );

  /**
   * Récupération des niveaux existants.
   *
   * Nouveau format :
   * quiz.level_ids = [...]
   *
   * Compatibilité ancienne version :
   * quiz.level_id = "..."
   */
  const initialLevelIds =
    quiz?.level_ids?.length
      ? quiz.level_ids
      : quiz?.level_id
        ? [quiz.level_id]
        : [];

  const [form, setForm] = useState<QuizCreatePayload>({
    title: quiz?.title || "",
    description: quiz?.description || "",
    course_id: quiz?.course_id || quiz?.content_id || "",
    subject_id: quiz?.subject_id || "",

    // Nouveau système multi-niveaux
    level_ids: initialLevelIds,

    // Compatibilité backend / anciennes données
    level_id: initialLevelIds[0] || "",

    language: quiz?.language || language,
    difficulty_level:
      quiz?.difficulty_level || "INTERMEDIATE",
    quiz_type: quiz?.quiz_type || "QCM",
    is_premium: quiz?.is_premium || false,
    is_randomized: quiz?.is_randomized || false,
    allow_retry: quiz?.allow_retry ?? true,
    passing_score: quiz?.passing_score || 50,
    estimated_duration_minutes:
      quiz?.estimated_duration_minutes || 10,
  });

  const [questions, setQuestions] = useState<
    EditableQuizQuestion[]
  >(
    quiz?.questions?.length
      ? quiz.questions.map(toEditableQuestion)
      : [createEmptyQuestion(0)]
  );

  const [removedQuestionIds, setRemovedQuestionIds] =
    useState<string[]>([]);

  const [removedChoiceIds, setRemovedChoiceIds] =
    useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const isEditing = Boolean(quiz?.id);

  const canManageQuestions =
    canManageQuizQuestions(
      user,
      quiz || undefined
    );

  const aiAvailable = canUseQuizAI(user);

  /**
   * Importation de questions.
   */
  function importQuestions(
    imported: EditableQuizQuestion[]
  ) {
    setQuestions((current) => {
      const base =
        current.length === 1 &&
        !current[0].question_text.trim()
          ? []
          : current;

      const importedQuestions =
        imported.map((question, index) => ({
          ...question,
          client_id:
            question.client_id ||
            crypto.randomUUID(),
          order_index:
            base.length + index,
        }));

      return [
        ...base,
        ...importedQuestions,
      ];
    });
  }

  /**
   * Modification générique d'un champ du formulaire.
   */
  function setField<
    K extends keyof QuizCreatePayload
  >(
    key: K,
    value: QuizCreatePayload[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  /**
   * Sélection d'un cours.
   *
   * Le cours peut être associé à plusieurs niveaux.
   * Tous les niveaux du cours deviennent alors sélectionnables.
   */
  function selectCourse(courseId: string) {
    const course = courses.find(
      (item) => item.id === courseId
    );

    setForm((current) => {
      const availableLevelIds =
        course?.level_ids || [];

      /**
       * Lorsque le cours est sélectionné,
       * on conserve uniquement les niveaux compatibles
       * avec ce cours.
       */
      const currentLevelIds = (
        current.level_ids || []
      ).filter((id) =>
        availableLevelIds.includes(id)
      );

      /**
       * Si aucun niveau n'était encore sélectionné
       * et que le cours possède un seul niveau,
       * on le sélectionne automatiquement.
       */
      const nextLevelIds =
        currentLevelIds.length > 0
          ? currentLevelIds
          : availableLevelIds.length === 1
            ? [availableLevelIds[0]]
            : [];

      return {
        ...current,

        course_id:
          courseId || null,

        subject_id:
          course?.subject_id ||
          current.subject_id,

        level_ids: nextLevelIds,

        /**
         * level_id reste synchronisé avec
         * le premier niveau pour compatibilité.
         */
        level_id:
          nextLevelIds[0] || "",

        title:
          course && !isEditing
            ? `Quiz - ${
                course.translations?.[0]?.title ??
                course.title ??
                course.id.slice(0, 8)
              }`
            : current.title,
      };
    });
  }

  /**
   * Sélection / désélection d'un niveau.
   */
  function toggleLevel(levelId: string) {
    setForm((current) => {
      const currentIds =
        current.level_ids || [];

      const exists =
        currentIds.includes(levelId);

      const nextIds = exists
        ? currentIds.filter(
            (id) => id !== levelId
          )
        : [...currentIds, levelId];

      return {
        ...current,

        level_ids: nextIds,

        /**
         * Compatibilité avec l'ancien champ.
         * Le premier niveau sélectionné devient level_id.
         */
        level_id:
          nextIds[0] || "",
      };
    });
  }

  /**
   * Enregistrement du quiz.
   */
  async function save() {
    const selectedLevelIds =
      form.level_ids || [];

    if (
      !form.title ||
      !form.subject_id ||
      selectedLevelIds.length === 0
    ) {
      setStatus(text.validation);
      return;
    }

    setSaving(true);
    setStatus(text.saving);

    try {
      /**
       * On garantit que level_id contient également
       * le premier niveau pour la compatibilité.
       */
      const payload: QuizCreatePayload = {
        ...form,
        level_ids: selectedLevelIds,
        level_id:
          selectedLevelIds[0] || null,
      };

      const savedQuiz =
        isEditing && quiz
          ? await quizService.update(
              quiz.id,
              payload
            )
          : await quizService.create(
              payload
            );

      /**
       * Suppression des choix retirés.
       */
      for (const choiceId of removedChoiceIds) {
        await quizService
          .removeChoice(choiceId)
          .catch(() => null);
      }

      /**
       * Suppression des questions retirées.
       */
      for (const questionId of removedQuestionIds) {
        await quizService
          .removeQuestion(questionId)
          .catch(() => null);
      }

      /**
       * Création / mise à jour des questions.
       */
      for (const item of questions.filter(
        (entry) =>
          entry.question_text.trim()
      )) {
        const questionPayload = {
          question_text:
            item.question_text.trim(),

          explanation:
            item.explanation || null,

          question_type:
            item.question_type,

          points:
            item.points,

          order_index:
            item.order_index,

          question_image_url:
            item.question_image_url || null,
        };

        const savedQuestion =
          item.id
            ? await quizService.updateQuestion(
                item.id,
                questionPayload
              )
            : await quizService.addQuestion(
                savedQuiz.id,
                questionPayload
              );

        /**
         * Création / mise à jour des réponses.
         */
        for (const choice of item.choices.filter(
          (entry) =>
            entry.choice_text.trim()
        )) {
          if (choice.id) {
            await quizService.updateChoice(
              choice.id,
              {
                choice_text:
                  choice.choice_text,
                is_correct:
                  choice.is_correct,
              }
            );
          } else {
            await quizService.addChoice(
              savedQuestion.id,
              choice
            );
          }
        }
      }

      setStatus(text.saved);

      router.push(
        `/quizzes/${savedQuiz.id}`
      );
    } catch (error) {
      setStatus(
        error instanceof ApiError
          ? error.message
          : text.saveError
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Génération IA.
   *
   * L'API IA actuelle utilise encore un seul level_id.
   * On utilise donc le premier niveau sélectionné.
   */
  async function generateWithAI() {
    const selectedLevelIds =
      form.level_ids || [];

    if (
      !form.title ||
      !form.subject_id ||
      selectedLevelIds.length === 0
    ) {
      setStatus(text.validation);
      return;
    }

    setSaving(true);
    setStatus(text.aiGenerating);

    try {
      const generated =
        await quizService.generateWithAI({
          subject_id:
            form.subject_id,

          level_id:
            selectedLevelIds[0],

          title:
            form.title,

          language:
            form.language,

          difficulty_level:
            form.difficulty_level ||
            "INTERMEDIATE",

          number_of_questions:
            Math.max(
              1,
              questions.length || 5
            ),

          topic:
            form.description || null,
        });

      router.push(
        `/quizzes/${generated.quiz_id}`
      );
    } catch (error) {
      setStatus(
        error instanceof ApiError
          ? error.message
          : text.aiError
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Niveaux disponibles pour le cours sélectionné.
   */
  const availableLevels = useMemo(() => {
    if (!form.course_id) {
      return levels;
    }

    const course = courses.find(
      (item) =>
        item.id === form.course_id
    );

    if (!course?.level_ids?.length) {
      return levels;
    }

    return levels.filter((level) =>
      course.level_ids?.includes(
        level.id
      )
    );
  }, [
    form.course_id,
    courses,
    levels,
  ]);

  return (
    <div className="grid gap-6">

      {/* HERO */}
      <section className="premium-surface overflow-hidden rounded-[1.75rem] p-6 text-white">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f6c445]">
          {t("quiz.interactiveAssessments")}
        </p>

        <h1 className="mt-3 text-3xl font-black md:text-5xl">
          {isEditing
            ? t("quiz.editQuiz")
            : t("quiz.addQuiz")}
        </h1>

        <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-white/75">
          {text.hero}
        </p>
      </section>

      {/* INFORMATIONS DU QUIZ */}
      <section className="ds-card rounded-[1.5rem] p-5">

        <div className="grid gap-4 md:grid-cols-2">

          {/* COURS */}
          <Field label={text.linkedCourse}>
            <select
              value={form.course_id || ""}
              onChange={(event) =>
                selectCourse(
                  event.target.value
                )
              }
              className="quiz-input"
            >
              <option value="">
                {text.linkedCoursePlaceholder}
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.translations?.[0]?.title ??
                    course.title ??
                    `COURS ${course.id.slice(
                      0,
                      8
                    )}`}
                </option>
              ))}
            </select>
          </Field>

          {/* TITRE */}
          <Field label={text.title}>
            <input
              value={form.title}
              onChange={(event) =>
                setField(
                  "title",
                  event.target.value
                )
              }
              className="quiz-input"
            />
          </Field>

          {/* LANGUE */}
          <Field label={text.language}>
            <select
              value={form.language}
              onChange={(event) =>
                setField(
                  "language",
                  event.target.value
                )
              }
              className="quiz-input"
            >
              <option value="FR">
                FR
              </option>

              <option value="EN">
                EN
              </option>
            </select>
          </Field>

          {/* MATIERE */}
          <Field label={text.subject}>
            <select
              value={form.subject_id}
              onChange={(event) =>
                setField(
                  "subject_id",
                  event.target.value
                )
              }
              className="quiz-input"
              disabled={Boolean(
                form.course_id
              )}
            >
              <option value="">
                {text.subject}
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {language === "EN"
                    ? subject.name_en
                    : subject.name_fr}
                </option>
              ))}
            </select>
          </Field>

          {/* NIVEAUX */}
          <Field label={text.level}>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">

              <div className="mb-3 text-xs font-bold text-slate-500">
                {text.selectLevels}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {availableLevels.map(
                  (level) => {
                    const selected =
                      (
                        form.level_ids ||
                        []
                      ).includes(
                        level.id
                      );

                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() =>
                          toggleLevel(
                            level.id
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-left text-sm font-black transition ${
                          selected
                            ? "border-[#0f5f3a] bg-[#e8f5ee] text-[#082f1f]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#0f5f3a]/40"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
                              selected
                                ? "border-[#0f5f3a] bg-[#0f5f3a] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {selected
                              ? "✓"
                              : ""}
                          </span>

                          <span>
                            {language ===
                            "EN"
                              ? level.name_en
                              : level.name_fr}
                          </span>
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {(form.level_ids || [])
                .length > 0 && (
                <p className="mt-3 text-xs font-bold text-[#0f5f3a]">
                  {(form.level_ids || [])
                    .length}{" "}
                  {text.selectedLevels}
                </p>
              )}
            </div>
          </Field>

          {/* DIFFICULTE */}
          <Field label={text.difficulty}>
            <select
              value={
                form.difficulty_level ||
                ""
              }
              onChange={(event) =>
                setField(
                  "difficulty_level",
                  event.target.value
                )
              }
              className="quiz-input"
            >
              {[
                "BEGINNER",
                "INTERMEDIATE",
                "ADVANCED",
              ].map(
                (item, index) => (
                  <option
                    key={`quiz-difficulty-${item}-${index}`}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </Field>

          {/* TYPE */}
          <Field label={text.type}>
            <select
              value={
                form.quiz_type ||
                "QCM"
              }
              onChange={(event) =>
                setField(
                  "quiz_type",
                  event.target.value
                )
              }
              className="quiz-input"
            >
              <option value="QCM">
                QCM
              </option>
            </select>
          </Field>

          {/* DUREE */}
          <Field
            label={t(
              "quiz.estimatedDuration"
            )}
          >
            <input
              type="number"
              min={1}
              value={
                form.estimated_duration_minutes ||
                ""
              }
              onChange={(event) =>
                setField(
                  "estimated_duration_minutes",
                  Number(
                    event.target.value
                  ) || null
                )
              }
              className="quiz-input"
            />
          </Field>

          {/* SCORE */}
          <Field
            label={t(
              "quiz.passingScore"
            )}
          >
            <input
              type="number"
              min={0}
              max={100}
              value={
                form.passing_score ||
                0
              }
              onChange={(event) =>
                setField(
                  "passing_score",
                  Number(
                    event.target.value
                  ) || 0
                )
              }
              className="quiz-input"
            />
          </Field>
        </div>

        {/* DESCRIPTION */}
        <Field label={text.description}>
          <textarea
            value={
              form.description || ""
            }
            onChange={(event) =>
              setField(
                "description",
                event.target.value
              )
            }
            className="quiz-input mt-2 min-h-28 p-4"
          />
        </Field>

        {/* OPTIONS */}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Toggle
            label={text.premium}
            checked={Boolean(
              form.is_premium
            )}
            onChange={(value) =>
              setField(
                "is_premium",
                value
              )
            }
          />

          <Toggle
            label={text.randomized}
            checked={Boolean(
              form.is_randomized
            )}
            onChange={(value) =>
              setField(
                "is_randomized",
                value
              )
            }
          />

          <Toggle
            label={text.allowRetry}
            checked={Boolean(
              form.allow_retry
            )}
            onChange={(value) =>
              setField(
                "allow_retry",
                value
              )
            }
          />
        </div>
      </section>

      {/* QUESTIONS */}
      {canManageQuestions ? (
        <>
          <QuizImportPanel
            onImport={
              importQuestions
            }
          />

          <QuizQuestionList
            questions={questions}
            labels={text}
            onChange={(nextQuestions) => {
              const nextIds =
                new Set(
                  nextQuestions
                    .map(
                      (item) =>
                        item.id
                    )
                    .filter(Boolean)
                );

              const nextChoiceIds =
                new Set(
                  nextQuestions.flatMap(
                    (item) =>
                      item.choices
                        .map(
                          (choice) =>
                            choice.id
                        )
                        .filter(Boolean)
                  )
                );

              setRemovedQuestionIds(
                (current) => [
                  ...current,
                  ...questions
                    .map(
                      (item) =>
                        item.id
                    )
                    .filter(
                      (
                        id
                      ): id is string =>
                        Boolean(
                          id &&
                            !nextIds.has(
                              id
                            )
                        )
                    ),
                ]
              );

              setRemovedChoiceIds(
                (current) => [
                  ...current,
                  ...questions.flatMap(
                    (item) =>
                      item.choices
                        .map(
                          (choice) =>
                            choice.id
                        )
                        .filter(
                          (
                            id
                          ): id is string =>
                            Boolean(
                              id &&
                                !nextChoiceIds.has(
                                  id
                                )
                            )
                        )
                  ),
                ]
              );

              setQuestions(
                nextQuestions
              );
            }}
          />
        </>
      ) : null}

      {/* MESSAGE EDITION */}
      {isEditing && (
        <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">
          {text.editLimit}
        </section>
      )}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3">

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="ds-button-primary disabled:opacity-60"
        >
          <Save size={18} />
          {t("action.save")}
        </button>

        {aiAvailable &&
        !isEditing ? (
          <button
            type="button"
            onClick={
              generateWithAI
            }
            disabled={saving}
            className="ds-button-premium disabled:opacity-60"
          >
            <Bot size={18} />
            {t(
              "quiz.generateAI"
            )}
          </button>
        ) : null}
      </div>

      {status && (
        <p className="text-sm font-black text-slate-600">
          {status}
        </p>
      )}
    </div>
  );
}

/**
 * Transformation d'une question API
 * vers le format utilisé par l'éditeur.
 */
function toEditableQuestion(
  question: NonNullable<
    Quiz["questions"]
  >[number]
): EditableQuizQuestion {
  return {
    id: question.id,
    client_id: question.id,
    question_text:
      question.question_text,
    explanation:
      question.explanation || "",
    question_type:
      question.question_type,
    points:
      question.points,
    order_index:
      question.order_index || 0,
    question_image_url:
      question.question_image_url ||
      null,

    choices: (
      question.choices || []
    ).map((choice) => ({
      id: choice.id,
      choice_text:
        choice.choice_text,
      is_correct:
        Boolean(
          choice.is_correct
        ),
    })),
  };
}

/**
 * Champ générique.
 */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>

      <div className="mt-2">
        {children}
      </div>
    </label>
  );
}

/**
 * Toggle.
 */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left text-sm font-black ${
        checked
          ? "border-[#0f5f3a] bg-[#e8f5ee] text-[#082f1f]"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {label}

      <span
        className={`h-6 w-11 rounded-full p-1 transition ${
          checked
            ? "bg-[#0f5f3a]"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "translate-x-5"
              : ""
          }`}
        />
      </span>
    </button>
  );
}

/**
 * Traductions.
 */
function quizLabels(
  language: string
) {
  const fr =
    language !== "EN";

  return {
    hero: fr
      ? "Construisez une evaluation exploitable avec ses questions, reponses et corrections."
      : "Build a usable assessment with questions, answers and corrections.",

    title: fr
      ? "Titre"
      : "Title",

    linkedCourse: fr
      ? "Cours lie"
      : "Linked course",

    linkedCoursePlaceholder:
      fr
        ? "Selectionner un cours"
        : "Select a course",

    description: fr
      ? "Description"
      : "Description",

    language: fr
      ? "Langue"
      : "Language",

    subject: fr
      ? "Matiere"
      : "Subject",

    level: fr
      ? "Niveaux"
      : "Levels",

    selectLevels: fr
      ? "Selectionnez un ou plusieurs niveaux"
      : "Select one or more levels",

    selectedLevels: fr
      ? "niveau(x) selectionne(s)"
      : "level(s) selected",

    difficulty: fr
      ? "Difficulte"
      : "Difficulty",

    type: fr
      ? "Type"
      : "Type",

    premium: fr
      ? "Premium oui/non"
      : "Premium yes/no",

    randomized: fr
      ? "Ordre aleatoire"
      : "Randomized",

    allowRetry: fr
      ? "Nouvelle tentative autorisee"
      : "Allow retry",

    question: fr
      ? "Texte de la question"
      : "Question text",

    questions: fr
      ? "Questions"
      : "Questions",

    addQuestion: fr
      ? "Ajouter une question"
      : "Add question",

    addAnswer: fr
      ? "Ajouter une reponse"
      : "Add answer",

    answer: fr
      ? "Reponse"
      : "Answer",

    correctAnswer: fr
      ? "Bonne reponse"
      : "Correct answer",

    correction: fr
      ? "Explication / correction"
      : "Explanation / correction",

    points: fr
      ? "Points"
      : "Points",

    singleChoice: fr
      ? "Choix unique"
      : "Single choice",

    multipleChoice: fr
      ? "Choix multiple"
      : "Multiple choice",

    trueFalse: fr
      ? "Vrai / faux"
      : "True / false",

    shortAnswer: fr
      ? "Reponse courte"
      : "Short answer",

    trueLabel: fr
      ? "Vrai"
      : "True",

    falseLabel: fr
      ? "Faux"
      : "False",

    delete: fr
      ? "Supprimer"
      : "Delete",

    validation: fr
      ? "Titre, matiere et au moins un niveau sont obligatoires."
      : "Title, subject and at least one level are required.",

    saving: fr
      ? "Enregistrement..."
      : "Saving...",

    saved: fr
      ? "Quiz enregistre."
      : "Quiz saved.",

    saveError: fr
      ? "Enregistrement impossible."
      : "Unable to save.",

    aiGenerating: fr
      ? "Generation IA..."
      : "AI generation...",

    aiError: fr
      ? "Generation IA impossible."
      : "Unable to generate with AI.",

    editLimit: fr
      ? "Vos modifications sont appliquees au quiz et aux questions associees."
      : "Your changes are applied to the quiz and its questions.",
  };
}
