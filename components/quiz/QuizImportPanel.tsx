"use client";

import { useRef, useState } from "react";
import { ClipboardPaste, FileJson, FileText, CheckCircle2, AlertTriangle, Upload } from "lucide-react";
import { platformService } from "@/services/platform.service";
import type { EditableQuizQuestion } from "@/components/quiz/QuizQuestionEditor";
import { createEmptyQuestion } from "@/components/quiz/QuizQuestionList";

type Props = {
  onImport: (questions: EditableQuizQuestion[]) => void;
};

type Parsed = { questions: EditableQuizQuestion[]; errors: string[] };

export function QuizImportPanel({ onImport }: Props) {
  const [mode, setMode] = useState<"word" | "text" | "json">("word");
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  async function handleWordPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    const imageFiles = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    let imageUrls: string[] = [];
    if (imageFiles.length) {
      setUploading(true);
      try {
        const uploads = await Promise.all(imageFiles.map((file) => platformService.uploads.questionImage(file)));
        imageUrls = uploads.map((item) => item.file_url).filter(Boolean);
      } finally {
        setUploading(false);
      }
    }

    const source = html || text;
    setRaw(text);
    const result = parseQuizText(text);
    result.questions = result.questions.map((question, index) => ({
      ...question,
      question_image_url: imageUrls[index] || undefined,
    }));
    setParsed(result);
    if (editorRef.current) editorRef.current.innerHTML = source;
  }

  function analyze() {
    const result = mode === "json" ? parseQuizJson(raw) : parseQuizText(raw);
    setParsed(result);
  }

  function apply() {
    if (!parsed?.questions.length || parsed.errors.length) return;
    onImport(parsed.questions);
    setParsed(null);
    setRaw("");
    if (editorRef.current) editorRef.current.innerHTML = "";
  }

  return (
    <section className="rounded-[1.5rem] border border-[#d8e5df] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-[#071d3a]">Importer rapidement des questions</h3>
          <p className="mt-1 text-sm font-bold text-slate-500">Copiez depuis Word, collez vos QCM ou importez un JSON. Vérifiez avant l’enregistrement.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ModeButton active={mode === "word"} onClick={() => setMode("word")}><ClipboardPaste size={16}/> Word / Coller</ModeButton>
          <ModeButton active={mode === "text"} onClick={() => setMode("text")}><FileText size={16}/> Texte</ModeButton>
          <ModeButton active={mode === "json"} onClick={() => setMode("json")}><FileJson size={16}/> JSON</ModeButton>
        </div>
      </div>

      {mode === "word" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onPaste={handleWordPaste}
          className="mt-4 min-h-48 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-medium outline-none focus:border-[#0f5f3a]"
          data-placeholder="Copiez une ou plusieurs questions depuis Word puis collez-les ici…"
        />
      ) : (
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="mt-4 min-h-56 w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 font-mono text-sm outline-none focus:border-[#0f5f3a]"
          placeholder={mode === "json" ? JSON_PLACEHOLDER : TEXT_PLACEHOLDER}
        />
      )}

      {uploading && <p className="mt-2 text-sm font-black text-[#0f5f3a]"><Upload className="mr-1 inline" size={15}/> Import des images…</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={analyze} disabled={uploading || (!raw.trim() && !editorRef.current?.innerText.trim())} className="ds-button-primary disabled:opacity-50">Analyser</button>
        {parsed && parsed.questions.length > 0 && !parsed.errors.length && (
          <button type="button" onClick={apply} className="ds-button-premium">Ajouter {parsed.questions.length} question{parsed.questions.length > 1 ? "s" : ""}</button>
        )}
      </div>

      {parsed && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-700">
            {parsed.errors.length ? <AlertTriangle size={18} className="text-amber-600"/> : <CheckCircle2 size={18} className="text-emerald-600"/>}
            {parsed.questions.length} question{parsed.questions.length > 1 ? "s" : ""} détectée{parsed.questions.length > 1 ? "s" : ""}
          </div>
          {parsed.errors.length > 0 && <ul className="mt-2 list-disc pl-5 text-sm font-bold text-amber-700">{parsed.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
        </div>
      )}
    </section>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black ${active ? "bg-[#071d3a] text-white" : "bg-slate-100 text-slate-600"}`}>{children}</button>;
}

function parseQuizText(input: string): Parsed {
  const normalized = input.replace(/\r/g, "").trim();
  if (!normalized) return { questions: [], errors: ["Aucun contenu à analyser."] };
  const chunks = normalized.split(/(?=^\s*(?:Question\s*)?\d+\s*[.)\-:]\s*)/gim).filter(Boolean);
  const questions: EditableQuizQuestion[] = [];
  const errors: string[] = [];

  chunks.forEach((chunk, index) => {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    const answerMatch = chunk.match(/(?:réponse|bonne\s+réponse|correct|correcte?)\s*[:=\-]?\s*([A-D])/i);
    const explanationMatch = chunk.match(/(?:correction|explication)\s*[:=]\s*([\s\S]*)/i);
    const choiceStart = lines.findIndex((line) => /^([A-D])[.)\-:]\s+/i.test(line));
    if (choiceStart < 0) { errors.push(`Question ${index + 1} : propositions A-D introuvables.`); return; }
    const questionLines = lines.slice(0, choiceStart).filter((line) => !/^(?:Question\s*)?\d+\s*[.)\-:]?$/i.test(line));
    const choices = lines.slice(choiceStart).filter((line) => /^([A-D])[.)\-:]\s+/i.test(line) && !/^(?:réponse|bonne|correct)/i.test(line));
    if (choices.length < 2) { errors.push(`Question ${index + 1} : au moins deux propositions sont nécessaires.`); return; }
    if (!answerMatch) { errors.push(`Question ${index + 1} : bonne réponse introuvable.`); return; }
    const correct = answerMatch[1].toUpperCase();
    questions.push({
      ...createEmptyQuestion(index),
      question_text: questionLines.join(" ").replace(/^(?:Question\s*)?\d+\s*[.)\-:]\s*/i, "").trim(),
      explanation: explanationMatch?.[1]?.trim() || "",
      choices: choices.map((line) => ({ choice_text: line.replace(/^([A-D])[.)\-:]\s+/i, "").trim(), is_correct: line[0].toUpperCase() === correct })),
    });
  });
  return { questions, errors };
}

function parseQuizJson(input: string): Parsed {
  try {
    const value = JSON.parse(input);
    const items = Array.isArray(value) ? value : value.questions;
    if (!Array.isArray(items)) return { questions: [], errors: ["Le JSON doit contenir un tableau de questions ou une propriété questions."] };
    const errors: string[] = [];
    const questions = items.map((item, index) => {
      const choices = Array.isArray(item.choices) ? item.choices : [];
      if (!item.question || choices.length < 2) { errors.push(`Question ${index + 1} : question ou propositions manquantes.`); return null; }
      const correctAnswer = typeof item.correct_answer === "string" ? item.correct_answer.toUpperCase() : null;
      return {
        ...createEmptyQuestion(index),
        question_text: String(item.question_text ?? item.question),
        explanation: item.explanation ?? item.correction ?? "",
        question_type: item.question_type ?? "SINGLE_CHOICE",
        points: Number(item.points) || 1,
        question_image_url: item.question_image_url ?? item.image_url ?? undefined,
        choices: choices.map((choice: any, choiceIndex: number) => ({
          choice_text: String(choice.choice_text ?? choice.text ?? choice.label ?? ""),
          is_correct: Boolean(choice.is_correct ?? (correctAnswer && String.fromCharCode(65 + choiceIndex) === correctAnswer)),
        })),
      };
    }).filter(Boolean) as EditableQuizQuestion[];
    return { questions, errors };
  } catch {
    return { questions: [], errors: ["JSON invalide. Vérifiez les guillemets, virgules et crochets."] };
  }
}

const TEXT_PLACEHOLDER = `1. Quel est le résultat de 2 + 3 × 4?\nA. 20\nB. 14\nC. 24\nD. 10\nRéponse : B\nCorrection : La multiplication est prioritaire.\n\n2. ...`;
const JSON_PLACEHOLDER = `[{"question":"Quel est le résultat de 2 + 3 ?","choices":[{"text":"4","is_correct":false},{"text":"5","is_correct":true},{"text":"6","is_correct":false}],"explanation":"2 + 3 = 5."}]`;
