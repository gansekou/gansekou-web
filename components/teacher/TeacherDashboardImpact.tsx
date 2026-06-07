"use client";

import { BarChart3, BookOpen, CheckCircle2, MessageCircleQuestion, Trophy } from "lucide-react";
import type { ComponentType } from "react";
import type { Content } from "@/types/content";
import type { Question } from "@/types/question";
import type { Quiz, TeacherSubject } from "@/types/platform";
import { TeacherXpCard } from "@/components/teacher/TeacherXpCard";

export function TeacherDashboardImpact({
  teacherSubjects,
  pendingQuestions,
  assignedQuestions,
  contents,
  quizzes,
  xp,
}: {
  teacherSubjects: TeacherSubject[];
  pendingQuestions: Question[];
  assignedQuestions: Question[];
  contents: Content[];
  quizzes: Quiz[];
  xp: number;
}) {
  const answered = assignedQuestions.filter((question) => question.status === "ANSWERED_BY_TEACHER").length;
  const contentViews = contents.reduce((sum, item) => sum + (item.total_views || 0), 0);
  const downloads = contents.reduce((sum, item) => sum + (item.total_downloads || 0), 0);
  const responseRate = pendingQuestions.length + answered > 0
    ? Math.round((answered / (pendingQuestions.length + answered)) * 100)
    : 0;

  return (
    <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <TeacherXpCard xp={xp} />
      <div className="ds-card rounded-[1.5rem] p-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f5f3a]">Mon impact pédagogique</p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <ImpactMetric icon={MessageCircleQuestion} label="Questions en attente" value={pendingQuestions.length} />
          <ImpactMetric icon={CheckCircle2} label="Taux de réponse" value={`${responseRate}%`} />
          <ImpactMetric icon={BookOpen} label="Vues contenus" value={contentViews} />
          <ImpactMetric icon={Trophy} label="Quiz créés" value={quizzes.length} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <MiniBar label="Matières actives" value={teacherSubjects.length} max={Math.max(teacherSubjects.length, 1)} />
          <MiniBar label="Téléchargements" value={downloads} max={Math.max(downloads, contentViews, 1)} />
          <MiniBar label="XP gagné" value={xp} max={Math.max(xp, 100)} />
        </div>
      </div>
    </section>
  );
}

function ImpactMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon size={20} className="text-[#0f5f3a]" />
      <p className="mt-3 text-2xl font-black text-[#071d3a]">{value}</p>
      <p className="mt-1 text-xs font-black uppercase text-slate-400">{label}</p>
    </div>
  );
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-black uppercase text-slate-400">
        <span className="inline-flex items-center gap-1"><BarChart3 size={14} />{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#0f5f3a]" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}
