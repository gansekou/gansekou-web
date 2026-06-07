"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Medal, RefreshCcw, Sparkles, Trophy } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import { aiService } from "@/services/ai.service";
import { gamificationService } from "@/services/gamification.service";
import { quizService } from "@/services/quiz.service";
import type { StudentBadge, StudentGamificationProfile } from "@/types/gamification";
import type { Quiz, QuizQuestion, QuizSubmitResult } from "@/types/quiz";
import type { User } from "@/types/user";

export function QuizResultPage({ user, quizId }: { user: User; quizId: string }) {
  const { language, t } = useI18n(user);
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt");
  const labels = useMemo(() => pageLabels(language), [language]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [profile, setProfile] = useState<StudentGamificationProfile | null>(null);
  const [badges, setBadges] = useState<StudentBadge[]>([]);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const quizData = await quizService.getById(quizId);
        const attemptResult = attemptId ? await quizService.result(attemptId).catch(() => null) : null;
        const [profileData, badgesData, checked] = await Promise.all([
          gamificationService.profile().catch(() => null),
          gamificationService.myBadges().catch(() => [] as StudentBadge[]),
          gamificationService.checkBadges().catch(() => null),
        ]);
        if (!cancelled) {
          setQuiz(quizData);
          setResult(attemptResult);
          setQuestions(quizData.questions || []);
          setProfile(profileData);
          setBadges(checked?.new_badges?.length ? checked.new_badges : badgesData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [attemptId, quizId]);

  async function explainMistakes() {
    if (!quiz || !result) return;
    setStatus(labels.aiLoading);
    try {
      const wrong = result.results.filter((item) => !item.is_correct);
      const prompt = [
        labels.aiPrompt,
        quiz.title,
        ...wrong.map((item) => {
          const question = questions.find((entry) => entry.id === item.question_id);
          return `${question?.question_text || item.question_id}: ${item.explanation || ""}`;
        }),
      ].join("\n");
      const response = await aiService.chat({
        question: prompt,
        subject_id: quiz.subject_id,
        level_id: quiz.level_id,
        language,
      });
      setAiAnswer(response.answer);
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : labels.aiError);
    }
  }

  if (loading) return <LoadingState label={labels.loading} />;
  if (!quiz) return <ErrorState title={labels.notFound} message={labels.notFoundHelp} />;
  if (!result) return <ErrorState title={labels.noResult} message={labels.noResultHelp} />;

  const wrongAnswers = result.total_questions - result.correct_answers;
  const passed = result.passed;

  return (
    <div className="grid gap-6">
      <section className={`rounded-[1.75rem] p-6 text-white ${passed ? "premium-surface" : "bg-[#071d3a]"}`}>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f6c445]">{t("quiz.viewResult")}</p>
        <h1 className="mt-3 text-3xl font-black md:text-5xl">{passed ? t("quiz.passed") : t("quiz.keepImproving")}</h1>
        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-7xl font-black">{result.score}%</p>
            <p className="mt-2 text-sm font-bold text-white/70">{quiz.title}</p>
          </div>
          <Link href={`/quizzes/${quiz.id}/play`} className="ds-button-premium">
            <RefreshCcw size={18} />
            {labels.retry}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label={labels.correct} value={String(result.correct_answers)} />
        <Metric label={labels.wrong} value={String(wrongAnswers)} />
        <Metric label={t("quiz.questions")} value={String(result.total_questions)} />
        <Metric label={labels.points} value={profile ? String(profile.points) : "-"} />
      </section>

      <section className="ds-card rounded-[1.5rem] p-5">
        <h2 className="text-xl font-black text-[#071d3a]">{t("quiz.correction")}</h2>
        <div className="mt-5 space-y-3">
          {result.results.map((item, index) => {
            const question = questions.find((entry) => entry.id === item.question_id);
            const selected = (question?.choices || []).filter((choice) => item.selected_choice_ids.includes(choice.id));
            return (
              <div key={`${item.question_id}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <p className="font-black text-[#071d3a]">{question?.question_text || item.question_id}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${item.is_correct ? "bg-[#e8f5ee] text-[#0f5f3a]" : "bg-red-50 text-red-600"}`}>
                    {item.is_correct ? labels.correct : labels.wrong}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  {selected?.map((choice) => choice.choice_text).join(", ") || item.selected_choice_ids.join(", ")}
                </p>
                {item.explanation && <p className="mt-3 rounded-xl bg-white p-3 text-sm font-bold leading-6 text-slate-600">{item.explanation}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="ds-card rounded-[1.5rem] p-5">
          <h2 className="flex items-center gap-2 text-xl font-black text-[#071d3a]"><Medal size={20} />{t("quiz.badgeEarned")}</h2>
          <div className="mt-4 space-y-2">
            {badges.slice(0, 4).map((item, index) => (
              <div key={`result-badge-${item.id}-${index}`} className="rounded-2xl bg-[#fff7df] p-3 text-sm font-black text-[#071d3a]">
                {item.badge ? (language === "EN" ? item.badge.name_en : item.badge.name_fr) : labels.badge}
              </div>
            ))}
            {!badges.length && <p className="text-sm font-bold text-slate-500">{labels.noBadge}</p>}
          </div>
        </div>
        <div className="ds-card rounded-[1.5rem] p-5">
          <h2 className="flex items-center gap-2 text-xl font-black text-[#071d3a]"><Trophy size={20} />{labels.progression}</h2>
          <p className="mt-4 text-sm font-bold leading-6 text-slate-600">
            {profile ? `${profile.quizzes_completed} ${labels.completed}, ${profile.quizzes_passed} ${labels.passedCount}, ${profile.points} ${labels.points.toLowerCase()}.` : labels.noProgression}
          </p>
        </div>
      </section>

      <section className="ds-card rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <h2 className="flex items-center gap-2 text-xl font-black text-[#071d3a]"><Sparkles size={20} />{t("quiz.explainMistakesAI")}</h2>
          <button type="button" onClick={explainMistakes} className="ds-button-premium">
            <Bot size={18} />
            {t("quiz.explainMistakesAI")}
          </button>
        </div>
        {status && <p className="mt-4 text-sm font-black text-slate-600">{status}</p>}
        {aiAnswer && <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-700">{aiAnswer}</div>}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ds-card rounded-[1.5rem] p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-[#071d3a]">{value}</p>
    </div>
  );
}

function pageLabels(language: string) {
  const fr = language !== "EN";
  return {
    loading: fr ? "Chargement du resultat..." : "Loading result...",
    notFound: fr ? "Quiz introuvable" : "Quiz not found",
    notFoundHelp: fr ? "Aucun quiz n'a ete retourne." : "No quiz was returned.",
    noResult: fr ? "Resultat indisponible" : "Result unavailable",
    noResultHelp: fr ? "Aucun identifiant de tentative valide n'a ete fourni." : "No valid attempt id was provided.",
    retry: fr ? "Refaire le quiz" : "Retry quiz",
    correct: fr ? "Bonnes reponses" : "Correct answers",
    wrong: fr ? "Mauvaises reponses" : "Wrong answers",
    points: fr ? "Points" : "Points",
    badge: fr ? "Badge" : "Badge",
    noBadge: fr ? "Aucun nouveau badge retourne." : "No new badge returned.",
    progression: fr ? "Progression" : "Progress",
    completed: fr ? "quiz termines" : "quizzes completed",
    passedCount: fr ? "quiz reussis" : "quizzes passed",
    noProgression: fr ? "Profil gamification indisponible." : "Gamification profile unavailable.",
    aiLoading: fr ? "Analyse IA..." : "AI analysis...",
    aiError: fr ? "Analyse IA impossible." : "Unable to analyze with AI.",
    aiPrompt: fr ? "Explique ces erreurs de quiz simplement et propose quoi reviser." : "Explain these quiz mistakes simply and suggest what to review.",
  };
}
