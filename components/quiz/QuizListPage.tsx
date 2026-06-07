"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, Filter, Plus, Sparkles, Trophy } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { canCreateQuiz } from "@/lib/permissions";
import { quizService } from "@/services/quiz.service";
import { educationService } from "@/services/education.service";
import type { Level, Subject } from "@/types/education";
import type { Quiz } from "@/types/quiz";
import type { User } from "@/types/user";

export function QuizListPage({ user }: { user: User }) {
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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [quizData, subjectData, levelData] = await Promise.all([
          quizService.getAll(),
          educationService.subjects(),
          educationService.levels(),
        ]);
        if (!cancelled) {
          setQuizzes(quizData);
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
  }, [labels.loadError]);

  const filtered = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchQuery = !query || `${quiz.title} ${quiz.description || ""}`.toLowerCase().includes(query.toLowerCase());
      return matchQuery && (!subjectId || quiz.subject_id === subjectId) && (!levelId || quiz.level_id === levelId);
    });
  }, [levelId, query, quizzes, subjectId]);

  function subjectName(id: string) {
    const subject = subjects.find((item) => item.id === id);
    return subject ? (language === "EN" ? subject.name_en : subject.name_fr) : labels.subject;
  }

  function levelName(id: string) {
    const level = levels.find((item) => item.id === id);
    return level ? (language === "EN" ? level.name_en : level.name_fr) : labels.level;
  }

  if (loading) return <LoadingState label={labels.loading} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="grid gap-6">
      <section className="premium-surface rounded-[1.75rem] p-6 text-white">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f6c445]">{t("quiz.interactiveAssessments")}</p>
            <h1 className="mt-3 text-3xl font-black md:text-5xl">{t("quiz.interactiveAssessments")}</h1>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-7 text-white/75">{labels.hero}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/quizzes/history" className="ds-button-premium">
              <Trophy size={18} />
              {labels.history}
            </Link>
            {canCreateQuiz(user) && (
              <Link href="/quizzes/new" className="ds-button-primary bg-white text-[#071d3a]">
                <Plus size={18} />
                {t("quiz.addQuiz")}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="ds-card rounded-[1.5rem] p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} className="quiz-input pl-11" />
          </div>
          <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="quiz-input">
            <option value="">{labels.subject}</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{language === "EN" ? subject.name_en : subject.name_fr}</option>)}
          </select>
          <select value={levelId} onChange={(event) => setLevelId(event.target.value)} className="quiz-input">
            <option value="">{labels.level}</option>
            {levels.map((level) => <option key={level.id} value={level.id}>{language === "EN" ? level.name_en : level.name_fr}</option>)}
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((quiz, index) => (
          <Link key={`quiz-card-${quiz.id}-${index}`} href={`/quizzes/${quiz.id}`} className="ds-card ds-card-hover block rounded-[1.5rem] p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-black text-[#0f5f3a]">{quiz.quiz_type}</span>
              {quiz.is_premium && <span className="rounded-full bg-[#fff7df] px-3 py-1 text-xs font-black text-[#071d3a]">{labels.premium}</span>}
            </div>
            <h2 className="mt-4 text-xl font-black text-[#071d3a]">{quiz.title}</h2>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-500">{quiz.description || labels.noDescription}</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm font-black text-slate-600">
              <span>{subjectName(quiz.subject_id)}</span>
              <span>{levelName(quiz.level_id)}</span>
              <span className="inline-flex items-center gap-1"><Clock size={15} />{quiz.estimated_duration_minutes || 10} min</span>
            </div>
          </Link>
        ))}
      </section>

      {!filtered.length && (
        <section className="ds-card rounded-[1.5rem] p-8 text-center">
          <Sparkles className="mx-auto text-[#f6c445]" size={34} />
          <h2 className="mt-3 text-2xl font-black text-[#071d3a]">{labels.empty}</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">{labels.emptyHelp}</p>
        </section>
      )}
    </div>
  );
}

function pageLabels(language: string) {
  const fr = language !== "EN";
  return {
    hero: fr ? "Filtrez, lancez et suivez les evaluations disponibles selon votre niveau." : "Filter, start and track assessments available for your level.",
    history: fr ? "Historique" : "History",
    loading: fr ? "Chargement des quiz..." : "Loading quizzes...",
    loadError: fr ? "Chargement impossible." : "Unable to load.",
    search: fr ? "Rechercher un quiz" : "Search a quiz",
    subject: fr ? "Matiere" : "Subject",
    level: fr ? "Niveau" : "Level",
    premium: "Premium",
    noDescription: fr ? "Aucune description." : "No description.",
    empty: fr ? "Aucun quiz" : "No quizzes",
    emptyHelp: fr ? "Les evaluations publiees correspondant aux filtres apparaitront ici." : "Published assessments matching filters will appear here.",
  };
}
