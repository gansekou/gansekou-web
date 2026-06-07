"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, FileText, Paperclip } from "lucide-react";
import { EmptyState } from "@/components/app/StateViews";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { HeroPanel } from "@/components/pages/shared/cards";
import { ApiError } from "@/lib/api";
import { canAnswerStudentQuestions } from "@/lib/permissions";
import { useI18n } from "@/hooks/useI18n";
import { platformService } from "@/services/platform.service";
import type { PageData } from "@/types/platform";
import type { AIAnswer, Question, TeacherAnswer } from "@/types/question";
import type { User } from "@/types/user";

export function QuestionDetailPage({ teacherMode = false }: { teacherMode?: boolean }) {
  const params = useParams<{ id?: string }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const load = useCallback(async (): Promise<PageData> => {
    if (!routeId) return {};
    const question = await platformService.questions.byId(routeId).catch(() => undefined);
    return { question };
  }, [routeId]);

  return (
    <AuthenticatedPage loadingLabel="Chargement de la question..." load={load}>
      {({ user, data, reload }) => (
        <QuestionDetail
          question={data.question as Question | null}
          isTeacher={teacherMode && canAnswerStudentQuestions(user)}
          routeId={routeId}
          reload={reload}
          user={user}
        />
      )}
    </AuthenticatedPage>
  );
}

function QuestionDetail({
  question,
  isTeacher,
  routeId,
  reload,
  user,
}: {
  question?: Question | null;
  isTeacher?: boolean;
  routeId?: string;
  reload: () => Promise<void>;
  user?: User | null;
}) {
  const { t, language } = useI18n(user);
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const aiAnswers = useMemo(() => collectAiAnswers(question), [question]);
  const teacherAnswers = useMemo(() => collectTeacherAnswers(question), [question]);
  const subjectName = pickLocalizedName(question?.subject, language) || question?.subject_id || "Matiere";
  const levelName = pickLocalizedName(question?.level, language);
  const hasAnswer = aiAnswers.length > 0 || teacherAnswers.length > 0;

  async function submitTeacherAnswer() {
    if (!question || !answer.trim()) return;
    setStatus("Envoi de la reponse...");
    try {
      let attachment_url: string | undefined;
      if (file) {
        const uploaded = await platformService.uploads.teacherAnswer(file);
        attachment_url = uploaded.file_url;
      }
      await platformService.teacher.answerQuestion(question.id, {
        answer_text: answer.trim(),
        attachment_url,
        language: question.language || language || "FR",
      });
      setAnswer("");
      setFile(null);
      setStatus("Reponse envoyee.");
      await reload();
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Envoi impossible.");
    }
  }

  if (!question) {
    return (
      <EmptyState
        title="Question introuvable"
        message={`Cette question n'est plus disponible ${routeId ? `(${routeId.slice(0, 8)})` : ""}.`}
      />
    );
  }

  return (
    <>
      <div className="mb-5">
        <Link href="/questions" className="inline-flex items-center gap-2 text-sm font-black text-[#0f5f3a]">
          <ArrowLeft size={18} />
          Retour
        </Link>
      </div>
      <HeroPanel eyebrow={formatQuestionStatus(question)} title={question.title || "Question Gansekou"} body={`${subjectName}${levelName ? ` - ${levelName}` : ""}`} />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
        <div className="space-y-5">
          <QuestionCard question={question} subjectName={subjectName} levelName={levelName || undefined} />
          <AnswerSection title={t("questions.aiAnswer")} empty={null}>
            {aiAnswers.map((item) => (
              <AnswerBody key={item.id} text={item.answer_text || item.answer || ""} status={item.status} createdAt={item.created_at} />
            ))}
          </AnswerSection>
          <AnswerSection title={t("questions.teacherAnswer")} empty={null}>
            {teacherAnswers.map((item) => (
              <TeacherAnswerCard key={item.id} answer={item} subjectName={subjectName} answeredByLabel={t("questions.answeredByTeacher")} answeredAtLabel={t("questions.answeredAt")} />
            ))}
          </AnswerSection>
          {!hasAnswer ? (
            <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
              <p className="font-black text-[#071d3a]">{t("questions.waitingTeacherAnswer")}</p>
            </div>
          ) : null}
        </div>
        {isTeacher ? (
          <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
            <h3 className="text-2xl font-black text-[#082f1f]">{t("teacher.answerQuestion")}</h3>
            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} className="mt-5 min-h-40 w-full rounded-2xl border border-slate-200 p-4 outline-none" placeholder="Votre explication..." />
            <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-500">
              <Paperclip size={18} />
              {file?.name || "Ajouter une piece jointe"}
              <input className="hidden" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
            <button onClick={submitTeacherAnswer} className="mt-4 rounded-full bg-[#0f5f3a] px-6 py-3 font-black text-white">{t("teacher.publishAnswer")}</button>
            {status ? <p className="mt-3 text-sm font-bold text-slate-600">{status}</p> : null}
          </div>
        ) : null}
      </section>
    </>
  );
}

function QuestionCard({ question, subjectName, levelName }: { question: Question; subjectName: string; levelName?: string }) {
  const fileUrl = question.question_image_url || question.image_url;
  return (
    <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <h3 className="text-2xl font-black text-[#082f1f]">Question posee</h3>
      <p className="mt-4 whitespace-pre-line text-base font-bold leading-7 text-slate-700">{question.question_text || "Question sans texte"}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-2">{subjectName}</span>
        {levelName ? <span className="rounded-full bg-slate-100 px-3 py-2">{levelName}</span> : null}
        <span className="rounded-full bg-slate-100 px-3 py-2">{formatQuestionStatus(question)}</span>
      </div>
      {fileUrl ? (
        <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-[#0f5f3a]">
          <FileText size={18} />
          Ouvrir la piece jointe
        </a>
      ) : null}
    </div>
  );
}

function AnswerSection({ title, empty, children }: { title: string; empty: React.ReactNode; children: React.ReactNode[] | React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  if (Array.isArray(items) && !items.length) return empty;
  return (
    <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <h3 className="text-2xl font-black text-[#082f1f]">{title}</h3>
      <div className="mt-5 space-y-4">{items}</div>
    </div>
  );
}

function TeacherAnswerCard({ answer, subjectName, answeredByLabel, answeredAtLabel }: { answer: TeacherAnswer; subjectName: string; answeredByLabel: string; answeredAtLabel: string }) {
  const teacherName = formatUserName(answer.teacher) || "Enseignant";
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <span>{answeredByLabel}: {teacherName}</span>
        <span>{subjectName}</span>
        {answer.status ? <span>{answer.status}</span> : null}
      </div>
      <AnswerBody text={answer.answer_text || ""} status={answer.status} createdAt={answer.created_at} answeredAtLabel={answeredAtLabel} />
      {answer.attachment_url ? (
        <a href={answer.attachment_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#0f5f3a]">
          <Paperclip size={17} />
          Piece jointe
        </a>
      ) : null}
    </div>
  );
}

function AnswerBody({ text, status, createdAt, answeredAtLabel }: { text: string; status?: string | null; createdAt?: string; answeredAtLabel?: string }) {
  return (
    <div>
      <p className="whitespace-pre-line text-base font-bold leading-7 text-[#071d3a]">{text || "Reponse disponible."}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
        {createdAt ? <span>{answeredAtLabel || "Date"}: {formatDate(createdAt)}</span> : null}
        {status ? <span>{status}</span> : null}
      </div>
    </div>
  );
}

function collectAiAnswers(question?: Question | null): AIAnswer[] {
  const answers = [...(question?.ai_answers || [])];
  if (question?.ai_answer && !answers.some((item) => item.id === question.ai_answer?.id)) answers.unshift(question.ai_answer);
  return answers.filter((item) => item.answer_text || item.answer);
}

function collectTeacherAnswers(question?: Question | null): TeacherAnswer[] {
  const answers = [...(question?.teacher_answers || [])];
  if (question?.teacher_answer && !answers.some((item) => item.id === question.teacher_answer?.id)) answers.unshift(question.teacher_answer);
  return answers.filter((item) => item.answer_text);
}

function formatQuestionStatus(question: Question) {
  if (question.status === "ANSWERED_BY_TEACHER" || question.has_teacher_answer) return "Reponse enseignant disponible";
  if (question.status === "ANSWERED_BY_AI" || question.has_ai_answer) return "Reponse IA disponible";
  if (question.status === "CLOSED") return "Fermee";
  return "En attente";
}

function pickLocalizedName(item: { name_fr?: string | null; name_en?: string | null } | null | undefined, language: string) {
  return language === "EN" ? item?.name_en || item?.name_fr : item?.name_fr || item?.name_en;
}

function formatUserName(user?: { prenom?: string | null; nom?: string | null; email?: string | null } | null) {
  return [user?.prenom, user?.nom].filter(Boolean).join(" ") || user?.email || "";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
