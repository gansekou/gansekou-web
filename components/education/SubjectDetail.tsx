"use client";

import Link from "next/link";
import { BookOpen, Brain, Pencil, Plus, Sparkles, Trophy, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import {
  canCreateContent,
  canDeleteSubjectEducation,
  canEditSubjectEducation,
} from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Level, Specialty, Subject } from "@/types/platform";
import type { Quiz } from "@/types/quiz";
import type { User } from "@/types/user";

export function SubjectDetail({
  user,
  subject,
  levels,
  specialties,
  contents,
  quizzes,
  reload,
}: {
  user: User;
  subject?: Subject | null;
  levels: Level[];
  specialties: Specialty[];
  contents: Content[];
  quizzes: Quiz[];
  reload: () => Promise<void>;
}) {
  const router = useRouter();
  const { language, t } = useI18n(user);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const levelById = useMemo(() => new Map(levels.map((level) => [level.id, level])), [levels]);
  const specialtyById = useMemo(
    () => new Map(specialties.map((specialty) => [specialty.id, specialty])),
    [specialties]
  );

  if (!subject) {
    return <EmptyState title={t("subject.notFound")} message={t("subject.notFoundHelp")} />;
  }

  const currentSubject = subject;
  const level = levelById.get(currentSubject.level_id);
  const specialty = currentSubject.specialty_id ? specialtyById.get(currentSubject.specialty_id) : null;
  const title = language === "EN" ? currentSubject.name_en : currentSubject.name_fr;
  const courses = contents.filter((content) => content.content_type === "COURS");
  const exercises = contents.filter((content) => content.content_type === "EXERCICE");
  const examPapers = contents.filter((content) => content.content_type === "SUJET");
  const subjectQuizzes = quizzes.filter((quiz) => quiz.subject_id === currentSubject.id);

  async function remove() {
    if (!window.confirm(t("subject.confirmDelete"))) return;
    setStatus(null);
    setError(null);
    try {
      await platformService.education.deleteSubject(currentSubject.id);
      await reload();
      router.push("/subjects");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorDelete"));
    }
  }

  return (
    <section className="grid gap-5">
      <section className="premium-surface overflow-hidden rounded-[2rem] p-7 text-white shadow-2xl shadow-[#071d3a]/20">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">
              {t("subject.subjects")}
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">{title}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/70">{t("subject.structureHelp")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">{level ? (language === "EN" ? level.name_en : level.name_fr) : "-"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canCreateContent(user) && (
              <Link href={`/courses/new?subject_id=${currentSubject.id}&level_id=${currentSubject.level_id}`} className="ds-button-premium inline-flex items-center gap-2">
                <Plus size={18} />
                {t("action.addCourse")}
              </Link>
            )}
            {canEditSubjectEducation(user) && (
              <Link href={`/subjects/${currentSubject.id}/edit`} className="rounded-full bg-white/10 px-5 py-3 font-black text-white">
                <Pencil size={18} className="mr-2 inline" />
                {t("action.edit")}
              </Link>
            )}
            {canDeleteSubjectEducation(user) && (
              <button type="button" onClick={remove} className="rounded-full bg-red-500/15 px-5 py-3 font-black text-white">
                <Trash2 size={18} className="mr-2 inline" />
                {t("action.delete")}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard label={t("subject.linkedLevel")} value={level ? (language === "EN" ? level.name_en : level.name_fr) : "-"} />
        <InfoCard label={t("subject.specialty")} value={specialty ? (language === "EN" ? specialty.name_en : specialty.name_fr) : t("subject.noSpecialty")} />
        <InfoCard label={t("subject.coefficient")} value={currentSubject.coefficient} />
      </section>

      <section className="grid gap-4">
        <AiSubjectCard title={language === "EN" ? "AI recommendations" : "Recommandations IA"} body={language === "EN" ? "Review recent lessons, then validate with a short quiz." : "Revois les lecons recentes, puis valide avec un quiz court."} />
      </section>

      <ContentSection title={language === "EN" ? "Courses" : "Cours"} contents={courses} empty={t("subject.noRelatedContent")} />
      <ContentSection title={language === "EN" ? "Exercises" : "Exercices"} contents={exercises} empty={t("subject.noRelatedContent")} />
      <ContentSection title={language === "EN" ? "Exam papers" : "Sujets"} contents={examPapers} empty={t("subject.noRelatedContent")} />
      <QuizSection title={language === "EN" ? "Linked quizzes" : "Quiz lies"} quizzes={subjectQuizzes} empty={language === "EN" ? "No quiz linked to this subject." : "Aucun quiz lie a cette matiere."} />

      {status && <p className="text-sm font-black text-[#0f5f3a]">{status}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    </section>
  );
}

function AiSubjectCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="ds-card rounded-[2rem] p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071d3a] text-[#f6c445]">
          <Brain size={22} />
        </span>
        <div>
          <p className="text-xl font-black text-[#071d3a]">{title}</p>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{body}</p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-black text-[#0f5f3a]">
            <Sparkles size={17} />
            Parcours adapte au niveau et aux resultats.
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-xl shadow-[#082f1f]/5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-black text-[#071d3a]">{value}</p>
    </div>
  );
}

function ContentSection({
  title,
  contents,
  empty,
}: {
  title: string;
  contents: Content[];
  empty: string;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
      <h3 className="text-2xl font-black text-[#071d3a]">{title}</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contents.map((content, index) => (
          <Link key={`subject-content-${content.id}-${index}`} href={`/courses/${content.id}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
            <BookOpen className="text-[#f6c445]" />
            <p className="mt-4 font-black text-[#071d3a]">
              {content.title || `${content.content_type} ${content.id.slice(0, 8)}`}
            </p>
            <p className="mt-2 text-sm font-bold text-slate-500">{content.status}</p>
          </Link>
        ))}
      </div>
      {!contents.length && <EmptyState title={empty} message={empty} />}
    </section>
  );
}

function QuizSection({ title, quizzes, empty }: { title: string; quizzes: Quiz[]; empty: string }) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-2xl font-black text-[#071d3a]">{title}</h3>
        <Trophy className="text-[#f6c445]" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((quiz, index) => (
          <Link key={`subject-quiz-${quiz.id}-${index}`} href={`/quizzes/${quiz.id}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
            <Trophy className="text-[#f6c445]" />
            <p className="mt-4 font-black text-[#071d3a]">{quiz.title}</p>
            <p className="mt-2 text-sm font-bold text-slate-500">{quiz.description || quiz.quiz_type}</p>
          </Link>
        ))}
      </div>
      {!quizzes.length && <EmptyState title={empty} message={empty} />}
    </section>
  );
}
