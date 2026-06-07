"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Brain, RotateCcw, Sparkles, TrendingUp } from "lucide-react";
import type { Content } from "@/types/content";
import type { Quiz } from "@/types/platform";

type Labels = {
  recommended: string;
  continueProgress: string;
  retryQuiz: string;
  weaknesses: string;
  trending: string;
  aiReason: string;
  open: string;
  empty: string;
};

export function RecommendationRail({
  contents,
  quizzes,
  weaknesses,
  labels,
}: {
  contents: Content[];
  quizzes: Quiz[];
  weaknesses?: unknown[];
  labels: Labels;
}) {
  const items = [
    ...contents.slice(0, 4).map((content) => ({
      id: content.id,
      href: `/courses/${content.id}`,
      title: content.title || content.content_type,
      meta: content.difficulty_level || labels.continueProgress,
      icon: BookOpen,
      tone: "bg-[#e8f5ee] text-[#0f5f3a]",
    })),
    ...quizzes.slice(0, 3).map((quiz) => ({
      id: quiz.id,
      href: `/quizzes/${quiz.id}`,
      title: quiz.title,
      meta: labels.retryQuiz,
      icon: RotateCcw,
      tone: "bg-[#fff7df] text-[#071d3a]",
    })),
  ];

  return (
    <section className="ds-card rounded-[2rem] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b88a00]">{labels.recommended}</p>
          <h2 className="mt-1 text-2xl font-black text-[#071d3a]">{labels.trending}</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-black text-[#071d3a]">
          <Brain size={16} />
          {labels.aiReason}
        </span>
      </div>
      <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={`recommendation-${index}-${item.id}-${item.href}`} href={item.href} className="ds-card-hover min-w-[240px] snap-start rounded-3xl border border-slate-100 bg-white p-5">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                <Icon size={20} />
              </span>
              <p className="mt-5 line-clamp-2 min-h-12 font-black text-[#071d3a]">{item.title}</p>
              <p className="mt-2 text-sm font-bold text-slate-500">{item.meta}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0f5f3a]">
                {labels.open}
                <ArrowRight size={15} />
              </span>
            </Link>
          );
        })}
        {weaknesses?.slice(0, 2).map((_, index) => (
          <div key={`weakness-${index}`} className="min-w-[240px] snap-start rounded-3xl border border-[#f6c445]/40 bg-[#fff7df] p-5">
            <Sparkles className="text-[#b88a00]" />
            <p className="mt-5 font-black text-[#071d3a]">{labels.weaknesses}</p>
            <p className="mt-2 text-sm font-bold text-slate-600">{labels.aiReason}</p>
          </div>
        ))}
        {!items.length && !weaknesses?.length ? (
          <div className="min-w-[260px] rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
            <TrendingUp className="mb-4 text-[#f6c445]" />
            {labels.empty}
          </div>
        ) : null}
      </div>
    </section>
  );
}
