"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import type { QuizChoiceCreatePayload, QuizQuestionType } from "@/types/quiz";

type EditableChoice = QuizChoiceCreatePayload & { id?: string };

type Props = {
  choices: EditableChoice[];
  questionType: QuizQuestionType;
  labels: {
    addAnswer: string;
    answer: string;
    correctAnswer: string;
    delete: string;
    trueLabel: string;
    falseLabel: string;
  };
  onChange: (choices: EditableChoice[]) => void;
};

export function QuizChoiceEditor({ choices, questionType, labels, onChange }: Props) {
  function setChoice(index: number, patch: Partial<QuizChoiceCreatePayload>) {
    const next = choices.map((choice, currentIndex) => {
      if (currentIndex !== index) {
        return questionType === "SINGLE_CHOICE" || questionType === "TRUE_FALSE"
          ? { ...choice, is_correct: patch.is_correct ? false : choice.is_correct }
          : choice;
      }
      return { ...choice, ...patch };
    });
    onChange(next);
  }

  function addChoice() {
    onChange([...choices, { choice_text: "", is_correct: false }]);
  }

  function removeChoice(index: number) {
    onChange(choices.filter((_, currentIndex) => currentIndex !== index));
  }

  const normalizedChoices =
    questionType === "TRUE_FALSE" && choices.length < 2
      ? [
          choices[0] || { choice_text: labels.trueLabel, is_correct: true },
          choices[1] || { choice_text: labels.falseLabel, is_correct: false },
        ]
      : choices;

  return (
    <div className="space-y-3">
      {normalizedChoices.map((choice, index) => (
        <div key={`quiz-choice-editor-${questionType}-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <input
            value={choice.choice_text}
            disabled={questionType === "TRUE_FALSE"}
            onChange={(event) => setChoice(index, { choice_text: event.target.value })}
            className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-[#0f5f3a]"
            placeholder={`${labels.answer} ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => setChoice(index, { is_correct: !choice.is_correct })}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition ${
              choice.is_correct ? "bg-[#0f5f3a] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Check size={16} />
            {labels.correctAnswer}
          </button>
          <button
            type="button"
            aria-label={labels.delete}
            disabled={questionType === "TRUE_FALSE"}
            onClick={() => removeChoice(index)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-50 px-3 text-red-600 disabled:opacity-40"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ))}
      {questionType !== "TRUE_FALSE" && (
        <button
          type="button"
          onClick={addChoice}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-[#071d3a]"
        >
          <Plus size={17} />
          {labels.addAnswer}
        </button>
      )}
    </div>
  );
}
