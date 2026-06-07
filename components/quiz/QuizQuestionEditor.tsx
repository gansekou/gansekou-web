"use client";

import { Trash2 } from "lucide-react";
import { QuizChoiceEditor } from "@/components/quiz/QuizChoiceEditor";
import type { QuizChoiceCreatePayload, QuizQuestionType } from "@/types/quiz";

export type EditableQuizChoice = QuizChoiceCreatePayload & { id?: string };

export type EditableQuizQuestion = {
  id?: string;
  client_id: string;
  question_text: string;
  explanation?: string | null;
  question_type: QuizQuestionType;
  points: number;
  order_index: number;
  choices: EditableQuizChoice[];
};

type Props = {
  question: EditableQuizQuestion;
  labels: {
    question: string;
    correction: string;
    points: string;
    type: string;
    singleChoice: string;
    multipleChoice: string;
    trueFalse: string;
    shortAnswer: string;
    addAnswer: string;
    answer: string;
    correctAnswer: string;
    delete: string;
    trueLabel: string;
    falseLabel: string;
  };
  onChange: (question: EditableQuizQuestion) => void;
  onRemove: () => void;
};

export function QuizQuestionEditor({ question, labels, onChange, onRemove }: Props) {
  function updateType(questionType: QuizQuestionType) {
    const choices =
      questionType === "TRUE_FALSE"
        ? [
            { choice_text: labels.trueLabel, is_correct: true },
            { choice_text: labels.falseLabel, is_correct: false },
          ]
        : question.choices.length
          ? question.choices
          : [
              { choice_text: "", is_correct: true },
              { choice_text: "", is_correct: false },
            ];

    onChange({ ...question, question_type: questionType, choices });
  }

  return (
    <article className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="flex-1 space-y-3">
          <textarea
            value={question.question_text}
            onChange={(event) => onChange({ ...question, question_text: event.target.value })}
            className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold outline-none focus:border-[#0f5f3a]"
            placeholder={labels.question}
          />
          <textarea
            value={question.explanation || ""}
            onChange={(event) => onChange({ ...question, explanation: event.target.value })}
            className="min-h-20 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold outline-none focus:border-[#0f5f3a]"
            placeholder={labels.correction}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={labels.delete}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_140px]">
        <select
          value={question.question_type}
          onChange={(event) => updateType(event.target.value as QuizQuestionType)}
          className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black outline-none"
          aria-label={labels.type}
        >
          <option value="SINGLE_CHOICE">{labels.singleChoice}</option>
          <option value="MULTIPLE_CHOICE">{labels.multipleChoice}</option>
          <option value="TRUE_FALSE">{labels.trueFalse}</option>
          <option value="SHORT_ANSWER">{labels.shortAnswer}</option>
        </select>
        <input
          type="number"
          min={1}
          value={question.points}
          onChange={(event) => onChange({ ...question, points: Number(event.target.value) || 1 })}
          className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black outline-none"
          placeholder={labels.points}
        />
      </div>
      {question.question_type === "SHORT_ANSWER" ? null : (
        <div className="mt-4">
          <QuizChoiceEditor
            choices={question.choices}
            questionType={question.question_type}
            labels={labels}
            onChange={(choices) => onChange({ ...question, choices })}
          />
        </div>
      )}
    </article>
  );
}
