"use client";

import Link from "next/link";
import { useCallback } from "react";
import { EmptyState } from "@/components/app/StateViews";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import { canAccessTeacherStudio, isAdminRole } from "@/lib/permissions";
import type { PageData } from "@/types/platform";
import type { Question } from "@/types/question";
import type { User } from "@/types/user";

export function QuestionsPage() {
  const load = useCallback(async (user: User): Promise<PageData> => {
    const questions = isAdminRole(user)
      ? await platformService.questions.all().catch(() => [] as Question[])
      : await platformService.questions.mine().catch(() => [] as Question[]);
    return { questions };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement des questions..." load={load}>
      {({ user, data }) => <QuestionList user={user} questions={(data.questions as Question[]) || []} />}
    </AuthenticatedPage>
  );
}

function QuestionList({ user, questions }: { user?: User | null; questions: Question[] }) {
  if (user && canAccessTeacherStudio(user) && !isAdminRole(user)) {
    return (
      <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
        <h3 className="text-2xl font-black text-[#082f1f]">Questions enseignant</h3>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Link href="/teacher/questions/pending" className="rounded-2xl border border-slate-100 bg-slate-50 p-5 font-black text-[#082f1f] hover:bg-white">
            Questions disponibles
          </Link>
          <Link href="/teacher/questions/assigned" className="rounded-2xl border border-slate-100 bg-slate-50 p-5 font-black text-[#082f1f] hover:bg-white">
            Questions attribuees
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-black text-[#082f1f]">Questions</h3>
        <Link href="/questions/new" className="rounded-full bg-[#0f5f3a] px-5 py-2 text-sm font-black text-white">Nouvelle</Link>
      </div>
      {!questions.length ? (
        <EmptyState title="Aucune question" message="Pose une question pour recevoir une aide adaptee a ton niveau." />
      ) : (
        <div className="mt-6 space-y-3">
          {questions.map((item) => (
            <Link key={item.id} href={`/questions/${item.id}`} className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-black text-[#082f1f]">{item.question_text || "Question sans texte"}</p>
                {hasAvailableAnswer(item) ? <span className="rounded-full bg-[#e9f7ef] px-3 py-1 text-xs font-black text-[#0f5f3a]">Reponse disponible</span> : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>{formatQuestionStatus(item)}</span>
                <span className="text-[#0f5f3a]">Voir reponse</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function hasAvailableAnswer(question: Question) {
  return Boolean(question.has_ai_answer || question.has_teacher_answer || question.ai_answer || question.teacher_answer || question.ai_answers?.length || question.teacher_answers?.length);
}

function formatQuestionStatus(question: Question) {
  if (question.status === "ANSWERED_BY_TEACHER" || question.has_teacher_answer || question.teacher_answers?.length) return "Reponse enseignant disponible";
  if (question.status === "ANSWERED_BY_AI" || question.has_ai_answer || question.ai_answers?.length) return "Reponse IA disponible";
  if (question.status === "CLOSED") return "Fermee";
  return "En attente";
}
