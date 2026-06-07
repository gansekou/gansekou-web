"use client";

import Link from "next/link";
import { Archive, Download, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentMediaViewer } from "@/components/content/ContentMediaViewer";
import { StatusBadge } from "@/components/content/ContentManager";
import { EmptyState } from "@/components/app/StateViews";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import { downloadAuthenticatedFile, getContentMainUrl } from "@/lib/content-media";
import {
  canArchiveContent,
  canDeleteContent,
  canEditContent,
  canPublishContent,
  isStudentRole,
} from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Level, Specialty, Subject } from "@/types/platform";
import type { Quiz } from "@/types/quiz";
import type { User } from "@/types/user";

export function ContentPremiumDetail({
  user,
  content,
  related,
  linkedQuizzes,
  translations,
  subjects,
  levels,
  specialties,
  scope,
  reload,
}: {
  user: User;
  content?: Content | null;
  related: Content[];
  linkedQuizzes: Quiz[];
  translations: { title?: string; description?: string; language?: string }[];
  subjects: Subject[];
  levels: Level[];
  specialties: Specialty[];
  scope: "admin" | "teacher" | "courses";
  reload: () => Promise<void>;
}) {
  const router = useRouter();
  const { t } = useI18n(user);
  const [localContent, setLocalContent] = useState<Content | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lessonQuizzes, setLessonQuizzes] = useState<Quiz[]>(linkedQuizzes);
  const current = localContent?.id === content?.id ? localContent : content || null;
  const subjectById = useMemo(() => new Map(subjects.map((item) => [item.id, item])), [subjects]);
  const levelById = useMemo(() => new Map(levels.map((item) => [item.id, item])), [levels]);
  const specialtyById = useMemo(() => new Map(specialties.map((item) => [item.id, item])), [specialties]);
  const basePath = scope === "admin" ? "/admin/contents" : scope === "teacher" ? "/teacher/contents" : "/courses";
  const associatedExercises = related.filter((item) => item.content_type === "EXERCICE" && item.subject_id === current?.subject_id && item.level_id === current?.level_id);
  const associatedSubjects = related.filter((item) => item.content_type === "SUJET" && item.subject_id === current?.subject_id && item.level_id === current?.level_id);

  if (!current) return <EmptyState title={t("content.notFound")} message={t("content.notFound")} />;

  const activeContent = current;
  const translation = translations[0];
  const title = translation?.title || activeContent.title || `${activeContent.content_type} ${activeContent.id.slice(0, 8)}`;
  const description = translation?.description || activeContent.description || "";

  async function action(kind: "view" | "download" | "start" | "complete" | "favorite") {
    setMessage(null);
    setError(null);
    try {
      if (kind === "view") {
        await platformService.contents.view(activeContent.id);
      }
      if (kind === "download") {
        await platformService.contents.download(activeContent.id);
        await downloadAuthenticatedFile(activeContent);
      }
      if (kind === "start") await platformService.progress.start(activeContent.id);
      if (kind === "complete") {
        const result = await platformService.progress.complete(activeContent.id) as { linked_quizzes?: Quiz[] };
        setLessonQuizzes(result.linked_quizzes || []);
        setMessage((result.linked_quizzes || []).length ? t("course.lessonCompletedQuizPrompt") : t("course.progressSavedNoQuiz"));
        return;
      }
      if (kind === "favorite") await platformService.progress.favorite(activeContent.id);
      setMessage(t("common.success"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorSave"));
    }
  }

  async function moderate(kind: "publish" | "archive" | "delete") {
    if (!window.confirm(t(kind === "delete" ? "content.confirmDelete" : "content.confirmModeration"))) return;
    setMessage(null);
    setError(null);
    try {
      if (kind === "publish") setLocalContent(await platformService.contents.publish(activeContent.id));
      if (kind === "archive") setLocalContent(await platformService.contents.archive(activeContent.id));
      if (kind === "delete") {
        await platformService.contents.remove(activeContent.id);
        await reload();
        router.push(scope === "admin" ? "/admin/contents" : scope === "teacher" ? "/teacher/contents" : "/courses");
        return;
      }
      await reload();
      setMessage(t("common.success"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("admin.errorSave"));
    }
  }

  return (
    <section className="grid gap-5">
      <section className="rounded-[2rem] bg-[#071d3a] p-7 text-white shadow-2xl shadow-[#071d3a]/20">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{t("content.details")}</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">{title}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-white/70">{description || current.content_type}</p>
            <div className="mt-4 flex flex-wrap gap-2"><StatusBadge status={activeContent.status} t={t} />{activeContent.is_premium && <span className="rounded-full bg-[#f6c445] px-3 py-1 text-xs font-black text-[#071d3a]">Premium</span>}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => action("view")} className="ds-button-premium">{t("content.read")}</button>
            {getContentMainUrl(activeContent) && <button type="button" onClick={() => void action("download")} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 font-black text-white"><Download size={18} />{t("content.download")}</button>}
            {canEditContent(user, activeContent) && <Link href={`${basePath}/${activeContent.id}/edit`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 font-black text-white"><Pencil size={18} />{t("action.edit")}</Link>}
          </div>
        </div>
      </section>

      <ContentMediaViewer content={activeContent} t={t} />

      <section className="grid gap-4 md:grid-cols-4">
        <Info label={t("common.subject")} value={subjectById.get(activeContent.subject_id)?.name_fr || "-"} />
        <Info label={t("common.level")} value={levelById.get(activeContent.level_id)?.name_fr || "-"} />
        <Info label={t("subject.specialty")} value={activeContent.specialty_id ? specialtyById.get(activeContent.specialty_id)?.name_fr || "-" : "-"} />
        <Info label={t("content.type")} value={activeContent.content_type} />
        <Info label={t("content.offline")} value={activeContent.is_available_offline ? "Oui" : "Non"} />
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
        <div className="flex flex-wrap gap-2">
          {isStudentRole(user) && <><button onClick={() => action("start")} className="rounded-full bg-slate-100 px-4 py-2 font-black text-[#071d3a]">{t("action.start")}</button><button onClick={() => action("complete")} className="rounded-full bg-slate-100 px-4 py-2 font-black text-[#071d3a]">{t("action.complete")}</button><button onClick={() => action("favorite")} className="rounded-full bg-[#f6c445] px-4 py-2 font-black text-[#071d3a]">{t("content.favorite")}</button></>}
          {canPublishContent(user) && activeContent.status !== "APPROVED" && <button onClick={() => moderate("publish")} className="rounded-full bg-[#0f5f3a] px-4 py-2 font-black text-white">{t("content.validate")}</button>}
          {canArchiveContent(user) && activeContent.status !== "ARCHIVED" && <button onClick={() => moderate("archive")} className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 font-black text-[#071d3a]"><Archive size={16} />{t("content.archive")}</button>}
          {canDeleteContent(user, activeContent) && <button onClick={() => moderate("delete")} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 font-black text-red-700"><Trash2 size={16} />{t("action.delete")}</button>}
        </div>
        {message && <p className="mt-4 text-sm font-black text-[#0f5f3a]">{message}</p>}
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      </section>

      {activeContent.content_type === "COURS" && (
        <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-black text-[#071d3a]">{t("course.linkedQuizzes")}</h3>
            {canEditContent(user, activeContent) && (
              <Link href={`/quizzes/new?course_id=${activeContent.id}`} className="ds-button-primary">
                {t("quiz.addQuiz")}
              </Link>
            )}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lessonQuizzes.map((quiz) => (
              <Link key={quiz.id} href={`/quizzes/${quiz.id}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 font-black text-[#071d3a] transition hover:bg-white hover:shadow-lg">
                <span className="text-xs uppercase tracking-[0.14em] text-[#0f5f3a]">{t("course.recommendedAfterLesson")}</span>
                <p className="mt-3">{quiz.title}</p>
                <p className="mt-2 text-sm text-slate-500">{quiz.description || quiz.quiz_type}</p>
                <span className="mt-4 inline-block rounded-full bg-[#f6c445] px-4 py-2 text-sm text-[#071d3a]">{t("course.testMyKnowledge")}</span>
              </Link>
            ))}
          </div>
          {!lessonQuizzes.length && <p className="mt-4 text-sm font-bold text-slate-500">{t("course.noQuizForCourse")}</p>}
        </section>
      )}

      {activeContent.content_type === "COURS" && (
        <section className="grid gap-5 lg:grid-cols-2">
          <AssociatedRail title={t("exercise.associated")} items={associatedExercises} basePath="/exercises" emptyLabel={t("content.noRelated")} />
          <AssociatedRail title={t("subjectPaper.associated")} items={associatedSubjects} basePath="/subjects" emptyLabel={t("content.noRelated")} />
        </section>
      )}

      <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
        <h3 className="text-2xl font-black text-[#071d3a]">{t("content.related")}</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {related.map((item, index) => <Link key={`related-content-${item.id}-${index}`} href={`${basePath}/${item.id}`} className="rounded-2xl bg-slate-50 p-4 font-black text-[#071d3a]">{item.title || item.content_type}</Link>)}
        </div>
        {!related.length && <EmptyState title={t("content.noRelated")} message={t("content.noRelated")} />}
      </section>

    </section>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-white p-5 shadow-xl shadow-[#082f1f]/5"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-3 text-xl font-black text-[#071d3a]">{value}</p></div>;
}

function AssociatedRail({ title, items, basePath, emptyLabel }: { title: string; items: Content[]; basePath: string; emptyLabel: string }) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
      <h3 className="text-2xl font-black text-[#071d3a]">{title}</h3>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <Link key={item.id} href={`${basePath}/${item.id}`} className="rounded-2xl bg-slate-50 p-4 font-black text-[#071d3a] transition hover:bg-white hover:shadow-lg">
            <span className="text-xs uppercase tracking-[0.14em] text-[#0f5f3a]">{item.content_type}</span>
            <p className="mt-2">{item.title || item.id.slice(0, 8)}</p>
          </Link>
        ))}
      </div>
      {!items.length ? <p className="mt-4 text-sm font-bold text-slate-500">{emptyLabel}</p> : null}
    </section>
  );
}
