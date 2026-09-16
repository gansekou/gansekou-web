"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Plus,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";

import {
  ErrorState,
  LoadingState,
} from "@/components/app/StateViews";

import { useI18n } from "@/hooks/useI18n";
import { canCreateQuiz } from "@/lib/permissions";
import { quizService } from "@/services/quiz.service";
import { educationService } from "@/services/education.service";

import type {
  Level,
  Subject,
} from "@/types/education";

import type { Quiz } from "@/types/quiz";
import type { User } from "@/types/user";

export function QuizListPage({
  user,
}: {
  user: User;
}) {
  const { language, t } = useI18n(user);

  const labels = pageLabels(language);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");

  /*
   * ============================================================
   * CHARGEMENT
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [
          quizData,
          subjectData,
          levelData,
        ] = await Promise.all([
          quizService.getAll(),
          educationService.subjects(),
          educationService.levels(),
        ]);

        if (cancelled) return;

        setQuizzes(quizData);
        setSubjects(subjectData);
        setLevels(levelData);
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : labels.loadError
        );
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
  }, [labels.loadError]);

  /*
   * ============================================================
   * FILTRAGE
   * ============================================================
   */

  const filtered = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return quizzes.filter((quiz) => {
      const searchableText = `
        ${quiz.title}
        ${quiz.description || ""}
      `.toLowerCase();

      const matchQuery =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);

      const matchSubject =
        !subjectId ||
        quiz.subject_id === subjectId;

      /*
       * Nouveau système :
       * un quiz peut avoir plusieurs niveaux.
       *
       * Compatibilité :
       * les anciens quiz peuvent encore avoir
       * uniquement level_id.
       */
      const quizLevelIds =
        quiz.level_ids?.length
          ? quiz.level_ids
          : quiz.level_id
            ? [quiz.level_id]
            : [];

      const matchLevel =
        !levelId ||
        quizLevelIds.includes(levelId);

      return (
        matchQuery &&
        matchSubject &&
        matchLevel
      );
    });
  }, [
    levelId,
    query,
    quizzes,
    subjectId,
  ]);

  /*
   * ============================================================
   * NOMS
   * ============================================================
   */

  function subjectName(id: string) {
    const subject = subjects.find(
      (item) => item.id === id
    );

    if (!subject) {
      return labels.subject;
    }

    return language === "EN"
      ? subject.name_en
      : subject.name_fr;
  }

  function levelName(id: string) {
    const level = levels.find(
      (item) => item.id === id
    );

    if (!level) {
      return labels.level;
    }

    return language === "EN"
      ? level.name_en
      : level.name_fr;
  }

  /*
   * ============================================================
   * NIVEAUX D'UN QUIZ
   * ============================================================
   */

  function quizLevelNames(quiz: Quiz) {
    /*
     * Nouveau format multi-niveaux.
     */
    const ids =
      quiz.level_ids?.length
        ? quiz.level_ids
        : quiz.level_id
          ? [quiz.level_id]
          : [];

    if (ids.length === 0) {
      return labels.level;
    }

    return ids
      .map((id) => levelName(id))
      .join(", ");
  }

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

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">

      {/* ========================================================
          HERO
          ======================================================== */}

      <section
        className="
          premium-surface
          min-w-0
          overflow-hidden
          rounded-[1.5rem]
          p-4
          sm:rounded-[1.75rem]
          sm:p-6
        "
      >
        <div
          className="
            flex
            min-w-0
            flex-col
            gap-5
            md:flex-row
            md:items-end
            md:justify-between
          "
        >

          <div className="min-w-0 flex-1">

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
              {t("quiz.interactiveAssessments")}
            </p>

            <h1
              className="
                mt-2
                break-words
                text-2xl
                font-black
                leading-tight
                text-white
                sm:mt-3
                sm:text-3xl
                md:text-5xl
              "
            >
              {t("quiz.interactiveAssessments")}
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                break-words
                text-sm
                font-bold
                leading-6
                text-white/75
                sm:leading-7
              "
            >
              {labels.hero}
            </p>

          </div>

          <div
            className="
              flex
              w-full
              min-w-0
              flex-col
              gap-2
              sm:flex-row
              sm:flex-wrap
              sm:gap-3
              md:w-auto
              md:shrink-0
            "
          >

            <Link
              href="/quizzes/history"
              className="
                ds-button-premium
                w-full
                !px-4
                !py-3
                text-sm
                sm:w-auto
              "
            >
              <Trophy
                size={17}
                className="shrink-0"
              />

              <span>
                {labels.history}
              </span>
            </Link>

            {canCreateQuiz(user) && (
              <Link
                href="/quizzes/new"
                className="
                  ds-button-primary
                  w-full
                  bg-white
                  text-[#071d3a]
                  !px-4
                  !py-3
                  text-sm
                  sm:w-auto
                "
              >
                <Plus
                  size={17}
                  className="shrink-0"
                />

                <span>
                  {t("quiz.addQuiz")}
                </span>
              </Link>
            )}

          </div>
        </div>
      </section>

      {/* ========================================================
          FILTRES
          ======================================================== */}

      <section
        className="
          ds-card
          min-w-0
          overflow-hidden
          rounded-[1.5rem]
          p-4
          sm:p-5
        "
      >

        <div
          className="
            grid
            min-w-0
            gap-3
            md:grid-cols-[minmax(0,1fr)_220px_220px]
          "
        >

          {/* RECHERCHE */}

          <div className="relative min-w-0">

            <Search
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
              size={18}
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder={labels.search}
              aria-label={labels.search}
              className="
                quiz-input
                min-w-0
                pl-11
                text-sm
                sm:text-base
              "
            />

          </div>

          {/* MATIERE */}

          <select
            value={subjectId}
            onChange={(event) =>
              setSubjectId(event.target.value)
            }
            aria-label={labels.subject}
            className="
              quiz-input
              min-w-0
              text-sm
              sm:text-base
            "
          >
            <option value="">
              {labels.subject}
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

          {/* NIVEAU */}

          <select
            value={levelId}
            onChange={(event) =>
              setLevelId(event.target.value)
            }
            aria-label={labels.level}
            className="
              quiz-input
              min-w-0
              text-sm
              sm:text-base
            "
          >
            <option value="">
              {labels.level}
            </option>

            {levels.map((level) => (
              <option
                key={level.id}
                value={level.id}
              >
                {language === "EN"
                  ? level.name_en
                  : level.name_fr}
              </option>
            ))}
          </select>

        </div>

        {/* COMPTEUR */}

        <div
          className="
            mt-3
            flex
            min-w-0
            flex-wrap
            items-center
            justify-between
            gap-2
            text-xs
            font-bold
            text-slate-500
          "
        >
          <span>
            {filtered.length}{" "}
            {filtered.length > 1
              ? labels.results
              : labels.result}
          </span>

          {(query ||
            subjectId ||
            levelId) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubjectId("");
                setLevelId("");
              }}
              className="
                rounded-full
                px-3
                py-1.5
                font-black
                text-[#0f5f3a]
                transition
                hover:bg-[#e8f5ee]
              "
            >
              {labels.clearFilters}
            </button>
          )}
        </div>

      </section>

      {/* ========================================================
          GRILLE DES QUIZ
          ======================================================== */}

      {filtered.length > 0 && (
        <section
          className="
            grid
            min-w-0
            grid-cols-1
            gap-4
            sm:gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {filtered.map((quiz, index) => {
            const levelsText =
              quizLevelNames(quiz);

            return (
              <Link
                key={`quiz-card-${quiz.id}-${index}`}
                href={`/quizzes/${quiz.id}`}
                className="
                  ds-card
                  ds-card-hover
                  group
                  block
                  min-w-0
                  overflow-hidden
                  rounded-[1.5rem]
                  p-4
                  sm:p-5
                "
              >

                {/* BADGES */}

                <div
                  className="
                    flex
                    min-w-0
                    items-start
                    justify-between
                    gap-2
                  "
                >

                  <span
                    className="
                      min-w-0
                      max-w-[70%]
                      break-words
                      rounded-full
                      bg-[#e8f5ee]
                      px-3
                      py-1
                      text-[11px]
                      font-black
                      text-[#0f5f3a]
                      sm:text-xs
                    "
                  >
                    {quiz.quiz_type}
                  </span>

                  {quiz.is_premium && (
                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-[#fff7df]
                        px-3
                        py-1
                        text-[11px]
                        font-black
                        text-[#071d3a]
                        sm:text-xs
                      "
                    >
                      {labels.premium}
                    </span>
                  )}

                </div>

                {/* TITRE */}

                <h2
                  className="
                    mt-3
                    break-words
                    text-lg
                    font-black
                    leading-6
                    text-[#071d3a]
                    transition-colors
                    group-hover:text-[#0f5f3a]
                    sm:mt-4
                    sm:text-xl
                  "
                >
                  {quiz.title}
                </h2>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-2
                    line-clamp-2
                    min-h-10
                    break-words
                    text-sm
                    font-bold
                    leading-5
                    text-slate-500
                  "
                >
                  {quiz.description ||
                    labels.noDescription}
                </p>

                {/* INFORMATIONS */}

                <div
                  className="
                    mt-4
                    grid
                    min-w-0
                    grid-cols-2
                    gap-x-3
                    gap-y-2
                    border-t
                    border-slate-100
                    pt-4
                    text-xs
                    font-black
                    text-slate-600
                    sm:mt-5
                    sm:pt-5
                    sm:text-sm
                  "
                >

                  {/* MATIERE */}

                  <span
                    className="
                      min-w-0
                      break-words
                    "
                    title={subjectName(
                      quiz.subject_id
                    )}
                  >
                    {subjectName(
                      quiz.subject_id
                    )}
                  </span>

                  {/* NIVEAUX */}

                  <span
                    className="
                      min-w-0
                      break-words
                      text-right
                    "
                    title={levelsText}
                  >
                    {levelsText}
                  </span>

                  {/* DUREE */}

                  <span
                    className="
                      col-span-2
                      inline-flex
                      min-w-0
                      items-center
                      gap-1.5
                    "
                  >
                    <Clock
                      size={14}
                      className="
                        shrink-0
                        text-[#0f5f3a]
                      "
                    />

                    <span>
                      {quiz.estimated_duration_minutes ||
                        10}{" "}
                      {labels.minutes}
                    </span>
                  </span>

                </div>

              </Link>
            );
          })}

        </section>
      )}

      {/* ========================================================
          AUCUN RESULTAT
          ======================================================== */}

      {!filtered.length && (
        <section
          className="
            ds-card
            min-w-0
            overflow-hidden
            rounded-[1.5rem]
            p-6
            text-center
            sm:p-8
          "
        >

          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-[#fff7df]
            "
          >
            <Sparkles
              className="text-[#f6c445]"
              size={28}
            />
          </div>

          <h2
            className="
              mt-4
              break-words
              text-xl
              font-black
              text-[#071d3a]
              sm:text-2xl
            "
          >
            {labels.empty}
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-xl
              break-words
              text-sm
              font-bold
              leading-6
              text-slate-500
            "
          >
            {labels.emptyHelp}
          </p>

          {(query ||
            subjectId ||
            levelId) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubjectId("");
                setLevelId("");
              }}
              className="
                ds-button-premium
                mt-5
                !px-5
                !py-3
                text-sm
              "
            >
              {labels.clearFilters}
            </button>
          )}

        </section>
      )}

    </div>
  );
}

/*
 * ================================================================
 * TEXTES
 * ================================================================
 */

function pageLabels(language: string) {
  const fr = language !== "EN";

  return {
    hero: fr
      ? "Filtrez, lancez et suivez les évaluations disponibles selon votre niveau."
      : "Filter, start and track assessments available for your level.",

    history: fr
      ? "Historique"
      : "History",

    loading: fr
      ? "Chargement des quiz..."
      : "Loading quizzes...",

    loadError: fr
      ? "Chargement impossible."
      : "Unable to load.",

    search: fr
      ? "Rechercher un quiz"
      : "Search a quiz",

    subject: fr
      ? "Matière"
      : "Subject",

    level: fr
      ? "Niveau"
      : "Level",

    premium: "Premium",

    noDescription: fr
      ? "Aucune description."
      : "No description.",

    empty: fr
      ? "Aucun quiz"
      : "No quizzes",

    emptyHelp: fr
      ? "Les évaluations publiées correspondant aux filtres apparaîtront ici."
      : "Published assessments matching filters will appear here.",

    result: fr
      ? "résultat"
      : "result",

    results: fr
      ? "résultats"
      : "results",

    minutes: fr
      ? "min"
      : "min",

    clearFilters: fr
      ? "Effacer les filtres"
      : "Clear filters",
  };
}
