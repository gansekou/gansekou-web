"use client";

import Link from "next/link";
import { CheckCircle2, MessageCircleQuestion } from "lucide-react";
import type { Question } from "@/types/question";

export function TeacherQuestionQueue({
  questions,
  emptyMessage = "Aucune question disponible dans vos matières pour le moment.",
}: {
  questions: Question[];
  emptyMessage?: string;
}) {
  return (
    <section className="ds-card rounded-[1.5rem] p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-[#071d3a]">Questions prioritaires</h3>
          <p className="mt-2 text-sm font-bold text-slate-500">Questions filtrées selon vos matières enseignées.</p>
        </div>
        <MessageCircleQuestion className="text-[#0f5f3a]" size={26} />
      </div>
      <div className="mt-5 grid gap-3">
        {questions.map((question) => (
          <Link
            key={question.id}
            href={`/teacher/questions/${question.id}`}
            className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4 transition hover:bg-white"
          >
            <span>
              <span className="block font-black text-[#071d3a]">{question.question_text || "Question élève"}</span>
              <span className="mt-1 block text-sm font-bold text-slate-500">{question.status || "REQUESTED_TEACHER"}</span>
            </span>
            <CheckCircle2 size={20} className="text-[#0f5f3a]" />
          </Link>
        ))}
      </div>
      {!questions.length && <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">{emptyMessage}</p>}
    </section>
  );
}
