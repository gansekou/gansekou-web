"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { History, Trophy } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { quizService } from "@/services/quiz.service";
import type { QuizAttempt } from "@/types/quiz";
import type { User } from "@/types/user";

export function QuizHistoryPage({ user }: { user: User }) {
  const { language, t } = useI18n(user);
  const labels = useMemo(() => pageLabels(language), [language]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await quizService.history();
        if (!cancelled) setAttempts(data);
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

  const filtered = attempts.filter((attempt) => !status || (status === "PASSED" ? attempt.is_passed : !attempt.is_passed));
  const average = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length) : 0;

  if (loading) return <LoadingState label={labels.loading} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="grid gap-6">
      <section className="premium-surface rounded-[1.75rem] p-6 text-white">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f6c445]">{labels.history}</p>
        <h1 className="mt-3 text-3xl font-black md:text-5xl">{labels.history}</h1>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Stat label={labels.attempts} value={String(attempts.length)} />
          <Stat label={labels.average} value={`${average}%`} />
          <Stat label={labels.passed} value={String(attempts.filter((item) => item.is_passed).length)} />
        </div>
      </section>

      <section className="ds-card rounded-[1.5rem] p-5">
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="quiz-input max-w-xs">
          <option value="">{labels.all}</option>
          <option value="PASSED">{t("quiz.passed")}</option>
          <option value="FAILED">{t("quiz.keepImproving")}</option>
        </select>
      </section>

      <section className="space-y-3">
        {filtered.map((attempt, index) => (
          <Link key={`quiz-history-${attempt.id}-${index}`} href={`/quizzes/${attempt.quiz_id}/result?attempt=${attempt.id}`} className="ds-card ds-card-hover grid gap-3 rounded-[1.25rem] p-4 md:grid-cols-[1fr_160px_160px_140px] md:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f5ee] text-[#0f5f3a]">
                <History size={20} />
              </span>
              <div>
                <p className="font-black text-[#071d3a]">{labels.quiz} {attempt.quiz_id.slice(0, 8)}</p>
                <p className="text-sm font-bold text-slate-500">{new Date(attempt.started_at).toLocaleString(language === "EN" ? "en-US" : "fr-FR")}</p>
              </div>
            </div>
            <span className="text-lg font-black text-[#071d3a]">{attempt.score}%</span>
            <span className={attempt.is_passed ? "font-black text-[#0f5f3a]" : "font-black text-red-600"}>
              {attempt.is_passed ? t("quiz.passed") : t("quiz.keepImproving")}
            </span>
            <span className="text-sm font-black text-slate-500">{attempt.correct_answers}/{attempt.total_questions}</span>
          </Link>
        ))}
      </section>

      {!filtered.length && (
        <section className="ds-card rounded-[1.5rem] p-8 text-center">
          <Trophy className="mx-auto text-[#f6c445]" size={34} />
          <h2 className="mt-3 text-2xl font-black text-[#071d3a]">{labels.empty}</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">{labels.emptyHelp}</p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/60">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function pageLabels(language: string) {
  const fr = language !== "EN";
  return {
    loading: fr ? "Chargement de l'historique..." : "Loading history...",
    loadError: fr ? "Chargement impossible." : "Unable to load.",
    history: fr ? "Historique quiz" : "Quiz history",
    attempts: fr ? "Tentatives" : "Attempts",
    average: fr ? "Score moyen" : "Average score",
    passed: fr ? "Reussites" : "Passed",
    all: fr ? "Tous les statuts" : "All statuses",
    quiz: "Quiz",
    empty: fr ? "Aucune tentative" : "No attempts",
    emptyHelp: fr ? "Les quiz termines apparaitront ici." : "Completed quizzes will appear here.",
  };
}
