"use client";

import { useState } from "react";
import { Brain, BookOpenCheck, Dumbbell, FileText, Sparkles } from "lucide-react";
import { ApiError } from "@/lib/api";
import { aiService } from "@/services/ai.service";
import type { User } from "@/types/user";

type CoachMode = "SIMPLE" | "ADVANCED" | "EXERCISES" | "REVISION" | "QUIZ";

export function KoumaCoachPanel({ user }: { user: User }) {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<CoachMode>("SIMPLE");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const labels = coachLabels(user.preferred_language);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const payload = {
        topic,
        question: topic,
        level_id: user.level_id,
        language: user.preferred_language || "FR",
      };
      const result =
        mode === "EXERCISES"
          ? await aiService.exercises(payload)
          : mode === "REVISION"
            ? await aiService.revisionSheet(payload)
            : mode === "QUIZ"
              ? await aiService.quizPlan(payload)
              : await aiService.chat({
                  question: topic,
                  level_id: user.level_id,
                  language: user.preferred_language || "FR",
                  mode,
                });
      setAnswer(result.answer);
    } catch (error) {
      setAnswer(error instanceof ApiError ? error.message : labels.error);
    } finally {
      setLoading(false);
    }
  }

  const modes = [
    { id: "SIMPLE", label: labels.simple, icon: Sparkles },
    { id: "ADVANCED", label: labels.advanced, icon: Brain },
    { id: "EXERCISES", label: labels.exercises, icon: Dumbbell },
    { id: "REVISION", label: labels.revision, icon: FileText },
    { id: "QUIZ", label: labels.quiz, icon: BookOpenCheck },
  ] as const;

  return (
    <section className="ds-card rounded-[1.5rem] p-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f5f3a]">Kouma IA</p>
        <h3 className="mt-2 text-2xl font-black text-[#071d3a]">{labels.title}</h3>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{labels.body}</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {modes.map((item) => {
          const Icon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-2xl border p-3 text-left text-sm font-black transition ${active ? "border-[#0f5f3a] bg-[#eef8f2] text-[#071d3a]" : "border-slate-200 bg-white text-slate-500 hover:border-[#f6c445]"}`}
            >
              <Icon size={18} />
              <span className="mt-2 block">{item.label}</span>
            </button>
          );
        })}
      </div>
      <textarea
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        className="mt-5 min-h-32 w-full rounded-2xl border border-slate-200 p-4 font-bold outline-none focus:border-[#f6c445] focus:ring-4 focus:ring-[#f6c445]/15"
        placeholder={labels.placeholder}
      />
      <button type="button" onClick={generate} disabled={loading || !topic.trim()} className="ds-button-premium mt-4 disabled:opacity-60">
        <Brain size={18} />
        {loading ? labels.loading : labels.action}
      </button>
      {answer && <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm font-bold leading-7 text-slate-700">{answer}</div>}
    </section>
  );
}

function coachLabels(language?: string | null) {
  const fr = language !== "EN";
  return {
    title: fr ? "Coach pédagogique intelligent" : "Smart learning coach",
    body: fr
      ? "Choisissez un mode pour obtenir une explication, des exercices, un quiz ou une fiche de révision adaptée à votre niveau."
      : "Choose a mode to get an explanation, exercises, a quiz or a revision sheet adapted to your level.",
    simple: fr ? "Simple" : "Simple",
    advanced: fr ? "Avancé" : "Advanced",
    exercises: fr ? "Exercices" : "Exercises",
    revision: fr ? "Fiche" : "Sheet",
    quiz: fr ? "Quiz" : "Quiz",
    placeholder: fr ? "Ex: équations du second degré, résumé sur la photosynthèse..." : "Ex: quadratic equations, summary on photosynthesis...",
    action: fr ? "Générer avec Kouma IA" : "Generate with Kouma AI",
    loading: fr ? "Génération..." : "Generating...",
    error: fr ? "Kouma IA est indisponible." : "Kouma AI is unavailable.",
  };
}
