"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, Lock, PlayCircle, Trophy } from "lucide-react";
import type { Content } from "@/types/content";
import type { Quiz } from "@/types/quiz";

type PathLabels = {
  title: string;
  lesson: string;
  exercises: string;
  quiz: string;
  validation: string;
  locked: string;
  continue: string;
};

export function LearningPath({
  subjectName,
  contents,
  quizzes,
  labels,
}: {
  subjectName: string;
  contents: Content[];
  quizzes: Quiz[];
  labels: PathLabels;
}) {
  const firstContent = contents[0];
  const firstQuiz = quizzes[0];
  const steps = [
    { label: labels.lesson, done: Boolean(firstContent), icon: BookOpen, href: firstContent ? `/courses/${firstContent.id}` : null },
    { label: labels.exercises, done: contents.length > 1, icon: PlayCircle, href: contents[1] ? `/courses/${contents[1].id}` : null },
    { label: labels.quiz, done: Boolean(firstQuiz), icon: Trophy, href: firstQuiz ? `/quizzes/${firstQuiz.id}` : null },
    { label: labels.validation, done: false, icon: CheckCircle2, href: null },
  ];

  return (
    <section className="ds-card rounded-[1.5rem] p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#b88a00]">{labels.title}</p>
          <h2 className="mt-1 text-2xl font-black text-[#071d3a]">{subjectName}</h2>
        </div>
        {firstContent ? (
          <Link href={`/courses/${firstContent.id}`} className="ds-button-primary">
            {labels.continue}
          </Link>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const card = (
            <div className={`min-h-32 rounded-2xl border p-4 transition ${step.href ? "border-[#f6c445]/60 bg-white hover:-translate-y-1 hover:shadow-lg" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ee] text-[#0f5f3a]">
                  <Icon size={18} />
                </span>
                {step.href ? <CheckCircle2 className="text-[#0f5f3a]" size={18} /> : <Lock className="text-slate-400" size={18} />}
              </div>
              <p className="mt-4 font-black text-[#071d3a]">{index + 1}. {step.label}</p>
              {!step.href ? <p className="mt-1 text-xs font-bold text-slate-500">{labels.locked}</p> : null}
            </div>
          );
          const key = `learning-path-${index}-${step.label}-${step.href || "locked"}`;
          return step.href ? <Link key={key} href={step.href}>{card}</Link> : <div key={key}>{card}</div>;
        })}
      </div>
    </section>
  );
}
