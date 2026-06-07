"use client";

import { ListChecks, Plus } from "lucide-react";
import { QuizQuestionEditor, type EditableQuizQuestion } from "@/components/quiz/QuizQuestionEditor";

type Props = {
  questions: EditableQuizQuestion[];
  labels: React.ComponentProps<typeof QuizQuestionEditor>["labels"] & {
    questions: string;
    addQuestion: string;
  };
  onChange: (questions: EditableQuizQuestion[]) => void;
};

export function createEmptyQuestion(index: number): EditableQuizQuestion {
  return {
    client_id: crypto.randomUUID(),
    question_text: "",
    explanation: "",
    question_type: "SINGLE_CHOICE",
    points: 1,
    order_index: index,
    choices: [
      { choice_text: "", is_correct: true },
      { choice_text: "", is_correct: false },
    ],
  };
}

export function QuizQuestionList({ questions, labels, onChange }: Props) {
  function addQuestion() {
    onChange([...questions, createEmptyQuestion(questions.length)]);
  }

  return (
    <section className="ds-card rounded-[1.5rem] p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071d3a] text-white">
            <ListChecks size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black text-[#071d3a]">{labels.questions}</h2>
            <p className="text-sm font-bold text-slate-500">{questions.length}</p>
          </div>
        </div>
        <button type="button" onClick={addQuestion} className="ds-button-premium">
          <Plus size={18} />
          {labels.addQuestion}
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {questions.map((question, index) => (
          <QuizQuestionEditor
            key={question.client_id}
            question={{ ...question, order_index: index }}
            labels={labels}
            onChange={(next) => onChange(questions.map((item) => (item.client_id === question.client_id ? next : item)))}
            onRemove={() => onChange(questions.filter((item) => item.client_id !== question.client_id))}
          />
        ))}
      </div>
    </section>
  );
}
