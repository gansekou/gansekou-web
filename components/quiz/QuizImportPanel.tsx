"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPaste,
  FileJson,
  FileText,
  ImagePlus,
  Loader2,
} from "lucide-react";

import { platformService } from "@/services/platform.service";
import type { EditableQuizQuestion } from "@/components/quiz/QuizQuestionEditor";
import { createEmptyQuestion } from "@/components/quiz/QuizQuestionList";

type Props = {
  onImport: (questions: EditableQuizQuestion[]) => void;
};

type Parsed = {
  questions: EditableQuizQuestion[];
  errors: string[];
  warnings: string[];
};

export function QuizImportPanel({ onImport }: Props) {
  const [mode, setMode] = useState<"word" | "text" | "json">("word");
  const [raw, setRaw] = useState("");
  const [pastedHtml, setPastedHtml] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [uploading, setUploading] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  /**
   * ============================================================
   * COLLAGE DEPUIS WORD
   * ============================================================
   */
  async function handleWordPaste(
    event: React.ClipboardEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    setPastedHtml(html || "");

    if (editorRef.current) {
      editorRef.current.innerHTML = sanitizePastedHtml(
        html || escapeHtml(text)
      );
    }

    setUploading(true);

    try {
      /*
       * Récupération des images réellement présentes
       * dans le presse-papiers.
       */
      const clipboardImages = Array.from(event.clipboardData.items)
        .filter(
          (item) =>
            item.kind === "file" &&
            item.type.toLowerCase().startsWith("image/")
        )
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file));

      /*
       * Certaines versions de Word/Chrome placent les images
       * dans le HTML sous forme de data:image.
       */
      const htmlImages = html ? extractDataImages(html) : [];

      const files =
        clipboardImages.length > 0 ? clipboardImages : htmlImages;

      /*
       * Upload des images vers le stockage GANSEKOU.
       */
      const imageUrls: string[] = [];

      for (const file of files) {
        try {
          const uploaded =
            await platformService.uploads.questionImage(file);

          if (uploaded?.file_url) {
            imageUrls.push(uploaded.file_url);
          }
        } catch {
          /*
           * Une erreur d'image ne doit pas empêcher
           * l'importation des questions.
           */
        }
      }

      /*
       * Le texte brut est la meilleure source pour analyser
       * les questions.
       */
      const source = normalizeWordText(
        text || htmlToText(html)
      );

      const result = parseQuizText(source);

      /*
       * Association provisoire des images aux questions.
       *
       * Une image par question est conservée pour le moment.
       */
      result.questions = result.questions.map(
        (question, index) => ({
          ...question,
          question_image_url:
            imageUrls[index] || question.question_image_url || null,
        })
      );

      if (imageUrls.length > result.questions.length) {
        result.warnings.push(
          `${imageUrls.length} image(s) ont été détectées. ` +
            `Le système conserve actuellement une image principale par question.`
        );
      }

      if (
        imageUrls.length > 0 &&
        result.questions.length === 0
      ) {
        result.warnings.push(
          "Des images ont été détectées mais aucune question exploitable n'a été reconnue."
        );
      }

      setRaw(source);
      setParsed(result);
    } catch (error) {
      setParsed({
        questions: [],
        errors: [
          error instanceof Error
            ? error.message
            : "Impossible d'importer le contenu collé.",
        ],
        warnings: [],
      });
    } finally {
      setUploading(false);
    }
  }

  /**
   * ============================================================
   * ANALYSE
   * ============================================================
   */
  function analyze() {
    const source =
      mode === "word"
        ? normalizeWordText(
            raw || htmlToText(pastedHtml)
          )
        : raw;

    if (!source.trim()) {
      setParsed({
        questions: [],
        errors: ["Aucun contenu à analyser."],
        warnings: [],
      });
      return;
    }

    setParsed(
      mode === "json"
        ? parseQuizJson(source)
        : parseQuizText(source)
    );
  }

  /**
   * ============================================================
   * AJOUT DES QUESTIONS DANS L'EDITEUR
   * ============================================================
   */
  function apply() {
    if (
      !parsed ||
      parsed.questions.length === 0 ||
      parsed.errors.length > 0
    ) {
      return;
    }

    onImport(
      parsed.questions.map((question, index) => ({
        ...question,
        client_id:
          question.client_id || crypto.randomUUID(),
        order_index: index,
      }))
    );

    setParsed(null);
    setRaw("");
    setPastedHtml("");

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-[#d8e5df] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-[#071d3a]">
            Importer rapidement des questions
          </h3>

          <p className="mt-1 text-sm font-bold text-slate-500">
            Préparez vos QCM dans Word, copiez-les avec leurs
            schémas, puis collez-les ici.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ModeButton
            active={mode === "word"}
            onClick={() => setMode("word")}
          >
            <ClipboardPaste size={16} />
            Word / Coller
          </ModeButton>

          <ModeButton
            active={mode === "text"}
            onClick={() => setMode("text")}
          >
            <FileText size={16} />
            Texte
          </ModeButton>

          <ModeButton
            active={mode === "json"}
            onClick={() => setMode("json")}
          >
            <FileJson size={16} />
            JSON
          </ModeButton>
        </div>
      </div>

      {mode === "word" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onPaste={handleWordPaste}
          className="
            mt-4 min-h-64 rounded-2xl
            border-2 border-dashed border-slate-300
            bg-slate-50 p-4
            text-sm font-medium
            outline-none
            focus:border-[#0f5f3a]
            [&_img]:my-3
            [&_img]:max-h-72
            [&_img]:max-w-full
            [&_img]:object-contain
          "
        >
          {!pastedHtml && (
            <p className="pointer-events-none text-slate-400">
              Copiez une ou plusieurs questions depuis Word puis
              faites Ctrl+V ici.
              <br />
              <br />
              Les textes et schémas seront analysés automatiquement.
            </p>
          )}
        </div>
      ) : (
        <textarea
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          className="
            mt-4 min-h-56 w-full rounded-2xl
            border-2 border-dashed border-slate-300
            bg-slate-50 p-4 font-mono text-sm
            outline-none focus:border-[#0f5f3a]
          "
          placeholder={
            mode === "json"
              ? JSON_PLACEHOLDER
              : TEXT_PLACEHOLDER
          }
        />
      )}

      {uploading && (
        <p className="mt-3 flex items-center gap-2 text-sm font-black text-[#0f5f3a]">
          <Loader2 size={16} className="animate-spin" />
          Analyse du document et import des images…
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={analyze}
          disabled={
            uploading ||
            !(
              raw ||
              editorRef.current?.innerText ||
              pastedHtml
            ).trim()
          }
          className="ds-button-primary disabled:opacity-50"
        >
          Analyser
        </button>

        {parsed &&
          parsed.questions.length > 0 &&
          parsed.errors.length === 0 && (
            <button
              type="button"
              onClick={apply}
              className="ds-button-premium"
            >
              Ajouter {parsed.questions.length} question
              {parsed.questions.length > 1 ? "s" : ""}
            </button>
          )}
      </div>

      {parsed && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-700">
            {parsed.errors.length > 0 ? (
              <AlertTriangle
                size={18}
                className="text-amber-600"
              />
            ) : (
              <CheckCircle2
                size={18}
                className="text-emerald-600"
              />
            )}

            {parsed.questions.length} question
            {parsed.questions.length > 1 ? "s" : ""} détectée
            {parsed.questions.length > 1 ? "s" : ""}
          </div>

          {parsed.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm font-bold text-amber-700">
              {parsed.errors.map((error, index) => (
                <li key={`error-${index}`}>
                  {error}
                </li>
              ))}
            </ul>
          )}

          {parsed.warnings.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm font-bold text-slate-600">
              {parsed.warnings.map((warning, index) => (
                <li key={`warning-${index}`}>
                  {warning}
                </li>
              ))}
            </ul>
          )}

          {parsed.questions.some(
            (question) =>
              Boolean(question.question_image_url)
          ) && (
            <p className="mt-3 flex items-center gap-2 text-xs font-black text-[#0f5f3a]">
              <ImagePlus size={15} />
              Image(s) associée(s) aux questions.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   BOUTON MODE
============================================================ */

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black ${
        active
          ? "bg-[#071d3a] text-white"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   PARSER TEXTE
============================================================ */

function parseQuizText(input: string): Parsed {
  const normalized = normalizeWordText(input);

  if (!normalized) {
    return {
      questions: [],
      errors: ["Aucun contenu à analyser."],
      warnings: [],
    };
  }

  /*
   * Formats acceptés :
   *
   * 1. Question
   * 1) Question
   * 1 - Question
   * 1 : Question
   * Question 1
   * Q1
   * Q1.
   */
  const questionRegex =
    /(?:^|\n)\s*(?:(?:question|q)\s*)?(\d{1,3})\s*[.)\-:]\s*/gi;

  const matches = [
    ...normalized.matchAll(questionRegex),
  ];

  let chunks: string[] = [];

  if (matches.length > 0) {
    chunks = matches.map((match, index) => {
      const start = match.index ?? 0;

      const end =
        index + 1 < matches.length
          ? matches[index + 1].index ??
            normalized.length
          : normalized.length;

      return normalized
        .slice(start, end)
        .trim();
    });
  } else {
    chunks = splitByChoiceGroups(normalized);
  }

  const questions: EditableQuizQuestion[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  chunks.forEach((chunk, index) => {
    const result = parseSingleQuestion(
      chunk,
      index
    );

    if (result.question) {
      questions.push(result.question);
    }

    errors.push(...result.errors);
    warnings.push(...result.warnings);
  });

  return {
    questions,
    errors,
    warnings,
  };
}

/* ============================================================
   PARSING D'UNE QUESTION
============================================================ */

function parseSingleQuestion(
  chunk: string,
  index: number
): {
  question: EditableQuizQuestion | null;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const lines = chunk
    .split("\n")
    .map((line) =>
      line
        .replace(/\u00a0/g, " ")
        .replace(/\u202f/g, " ")
        .replace(/\u200b/g, "")
        .trim()
    )
    .filter(Boolean);

  /*
   * A. texte
   * A) texte
   * A - texte
   * A : texte
   * A texte
   */
  const choiceRegex =
    /^([A-D])(?:\s*[.)\-:]\s*|\s+)(.+)$/i;

  const choiceStart = lines.findIndex((line) =>
    choiceRegex.test(line)
  );

  if (choiceStart < 0) {
    errors.push(
      `Question ${index + 1} : aucune proposition A, B, C ou D n'a été reconnue.`
    );

    return {
      question: null,
      errors,
      warnings,
    };
  }

  const questionLines = lines
    .slice(0, choiceStart)
    .filter(
      (line) =>
        !/^(?:question|q)?\s*\d{1,3}\s*[.)\-:]?\s*$/i.test(
          line
        )
    );

  /*
   * Les choix peuvent être sur plusieurs lignes.
   */
  const choices: Array<{
    letter: string;
    text: string;
  }> = [];

  let currentChoice:
    | {
        letter: string;
        text: string;
      }
    | null = null;

  for (const line of lines.slice(choiceStart)) {
    const match = line.match(choiceRegex);

    if (match) {
      if (currentChoice) {
        choices.push(currentChoice);
      }

      currentChoice = {
        letter: match[1].toUpperCase(),
        text: match[2].trim(),
      };
    } else if (currentChoice) {
      /*
       * Suite d'une proposition.
       */
      currentChoice.text += ` ${line}`;
    }
  }

  if (currentChoice) {
    choices.push(currentChoice);
  }

  if (choices.length < 2) {
    errors.push(
      `Question ${index + 1} : au moins deux propositions sont nécessaires.`
    );

    return {
      question: null,
      errors,
      warnings,
    };
  }

  /*
   * Bonne réponse.
   *
   * Exemples acceptés :
   * Réponse : B
   * Bonne réponse : B
   * Réponse correcte : B
   * Correct : B
   * Bonne réponse = B
   * Answer: B
   */
  const answerMatch = chunk.match(
    /(?:bonne\s+réponse|réponse\s+correcte?|réponse|correcte?|correct|answer)\s*[:=\-]?\s*\(?([A-D])\)?/i
  );

  let correctLetter =
    answerMatch?.[1]?.toUpperCase() || null;

  /*
   * Variante :
   * B est la bonne réponse.
   */
  if (!correctLetter) {
    const reverseAnswerMatch =
      chunk.match(
        /\b([A-D])\b\s+(?:est|is)\s+(?:la\s+)?bonne\s+réponse/i
      );

    if (reverseAnswerMatch) {
      correctLetter =
        reverseAnswerMatch[1].toUpperCase();
    }
  }

  if (!correctLetter) {
    errors.push(
      `Question ${index + 1} : bonne réponse introuvable. Ajoutez « Réponse : B ».`
    );

    return {
      question: null,
      errors,
      warnings,
    };
  }

  if (
    !choices.some(
      (choice) => choice.letter === correctLetter
    )
  ) {
    errors.push(
      `Question ${index + 1} : la bonne réponse « ${correctLetter} » ne correspond pas aux choix détectés.`
    );

    return {
      question: null,
      errors,
      warnings,
    };
  }

  /*
   * Correction.
   */
  const explanationMatch = chunk.match(
    /(?:correction|explication|solution)\s*[:=\-]\s*([\s\S]*)/i
  );

  const explanation =
    explanationMatch?.[1]?.trim() || "";

  if (!explanation) {
    warnings.push(
      `Question ${index + 1} : aucune correction n'a été détectée.`
    );
  }

  let questionText =
    questionLines.join("\n").trim();

  questionText = questionText
    .replace(
      /^(?:question|q)?\s*\d{1,3}\s*[.)\-:]\s*/i,
      ""
    )
    .trim();

  if (!questionText) {
    errors.push(
      `Question ${index + 1} : le texte de la question est vide.`
    );

    return {
      question: null,
      errors,
      warnings,
    };
  }

  const question: EditableQuizQuestion = {
    ...createEmptyQuestion(index),
    question_text: questionText,
    explanation,
    question_type: "SINGLE_CHOICE",
    points: 1,

    choices: choices.map((choice) => ({
      choice_text: choice.text,
      is_correct:
        choice.letter === correctLetter,
    })),
  };

  return {
    question,
    errors,
    warnings,
  };
}

/* ============================================================
   JSON
============================================================ */

function parseQuizJson(input: string): Parsed {
  try {
    const value = JSON.parse(input);

    const items = Array.isArray(value)
      ? value
      : value?.questions;

    if (!Array.isArray(items)) {
      return {
        questions: [],
        errors: [
          "Le JSON doit contenir un tableau de questions ou une propriété « questions ».",
        ],
        warnings: [],
      };
    }

    const questions: EditableQuizQuestion[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    items.forEach((item, index) => {
      const questionText =
        item?.question_text ??
        item?.question ??
        item?.text ??
        "";

      const choices = Array.isArray(item?.choices)
        ? item.choices
        : Array.isArray(item?.options)
        ? item.options
        : [];

      if (!String(questionText).trim()) {
        errors.push(
          `Question ${index + 1} : texte manquant.`
        );
        return;
      }

      if (choices.length < 2) {
        errors.push(
          `Question ${index + 1} : au moins deux propositions sont nécessaires.`
        );
        return;
      }

      const correctAnswer =
        typeof item?.correct_answer === "string"
          ? item.correct_answer
              .trim()
              .replace(/[.)]/g, "")
              .toUpperCase()
          : null;

      questions.push({
        ...createEmptyQuestion(index),

        question_text: String(questionText),

        explanation:
          item?.explanation ??
          item?.correction ??
          item?.solution ??
          "",

        question_type:
          item?.question_type ??
          "SINGLE_CHOICE",

        points: Number(item?.points) || 1,

        question_image_url:
          item?.question_image_url ??
          item?.image_url ??
          item?.image ??
          null,

        choices: choices.map(
          (choice: any, choiceIndex: number) => {
            const letter =
              String.fromCharCode(
                65 + choiceIndex
              );

            const choiceCorrect =
              Boolean(
                choice?.is_correct ??
                  choice?.correct
              ) ||
              Boolean(
                correctAnswer &&
                  (
                    letter === correctAnswer ||
                    String(choiceIndex + 1) ===
                      correctAnswer
                  )
              );

            return {
              choice_text: String(
                choice?.choice_text ??
                  choice?.text ??
                  choice?.label ??
                  choice?.option ??
                  ""
              ),
              is_correct: choiceCorrect,
            };
          }
        ),
      });
    });

    return {
      questions,
      errors,
      warnings,
    };
  } catch {
    return {
      questions: [],
      errors: [
        "JSON invalide. Vérifiez les guillemets, virgules et crochets.",
      ],
      warnings: [],
    };
  }
}

/* ============================================================
   WORD / HTML
============================================================ */

function normalizeWordText(
  input: string
): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\u202f/g, " ")
    .replace(/\u200b/g, "")
    .replace(/\uFEFF/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractDataImages(
  html: string
): File[] {
  if (typeof DOMParser === "undefined") {
    return [];
  }

  const doc = new DOMParser().parseFromString(
    html,
    "text/html"
  );

  return Array.from(doc.images)
    .map((img, index) =>
      dataUrlToFile(
        img.src,
        `question-image-${Date.now()}-${index}.png`
      )
    )
    .filter(
      (file): file is File => Boolean(file)
    );
}

function dataUrlToFile(
  dataUrl: string,
  filename: string
): File | null {
  const match = dataUrl.match(
    /^data:([^;,]+)?(;base64)?,(.*)$/
  );

  if (!match) {
    return null;
  }

  try {
    const mime =
      match[1] || "image/png";

    const bytes = match[2]
      ? Uint8Array.from(
          atob(match[3]),
          (char) => char.charCodeAt(0)
        )
      : new TextEncoder().encode(
          decodeURIComponent(match[3])
        );

    return new File(
      [bytes],
      filename,
      { type: mime }
    );
  } catch {
    return null;
  }
}

function htmlToText(
  html: string
): string {
  if (!html) {
    return "";
  }

  if (typeof DOMParser === "undefined") {
    return html.replace(
      /<[^>]+>/g,
      " "
    );
  }

  const doc = new DOMParser().parseFromString(
    html,
    "text/html"
  );

  /*
   * Les images ne doivent pas devenir du texte.
   * Elles servent seulement de séparateurs.
   */
  doc.querySelectorAll("img").forEach(
    (img) => {
      img.replaceWith(
        doc.createTextNode("\n[IMAGE]\n")
      );
    }
  );

  doc
    .querySelectorAll(
      "p, div, li, br, tr"
    )
    .forEach((element) => {
      if (element.tagName === "BR") {
        element.replaceWith(
          doc.createTextNode("\n")
        );
      } else {
        element.insertAdjacentText(
          "afterend",
          "\n"
        );
      }
    });

  return (
    doc.body.innerText ||
    doc.body.textContent ||
    ""
  );
}

/* ============================================================
   SÉPARATION SANS NUMÉROS
============================================================ */

function splitByChoiceGroups(
  input: string
): string[] {
  const lines = input.split("\n");

  const chunks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    /*
     * Si une nouvelle question numérotée apparaît,
     * on commence un nouveau bloc.
     */
    if (
      current.length > 0 &&
      /^(?:question|q)?\s*\d{1,3}\s*[.)\-:]/i.test(
        trimmed
      )
    ) {
      chunks.push(
        current.join("\n").trim()
      );

      current = [trimmed];
    } else {
      current.push(trimmed);
    }
  }

  if (current.join("\n").trim()) {
    chunks.push(
      current.join("\n").trim()
    );
  }

  return chunks.filter(Boolean);
}

/* ============================================================
   NETTOYAGE HTML
============================================================ */

function sanitizePastedHtml(
  html: string
): string {
  if (!html) {
    return "";
  }

  if (typeof DOMParser === "undefined") {
    return escapeHtml(html);
  }

  const doc = new DOMParser().parseFromString(
    html,
    "text/html"
  );

  doc
    .querySelectorAll(
      "script, style, meta, link, iframe, object, embed"
    )
    .forEach((node) => node.remove());

  doc.querySelectorAll("*").forEach(
    (node) => {
      Array.from(node.attributes).forEach(
        (attribute) => {
          if (
            attribute.name
              .toLowerCase()
              .startsWith("on")
          ) {
            node.removeAttribute(
              attribute.name
            );
          }
        }
      );
    }
  );

  return doc.body.innerHTML;
}

function escapeHtml(
  value: string
): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[char] || char)
  );
}

/* ============================================================
   EXEMPLES
============================================================ */

const TEXT_PLACEHOLDER = `1. Quel est le résultat de 2 + 3 × 4 ?

A. 20
B. 14
C. 24
D. 10

Réponse : B

Correction : La multiplication est prioritaire sur l'addition.

2. Quelle est la dérivée de x² ?

A. x
B. 2x
C. x²
D. 2

Réponse : B
Correction : La dérivée de x² est 2x.`;

const JSON_PLACEHOLDER = `[
  {
    "question": "Quel est le résultat de 2 + 3 ?",
    "choices": [
      {
        "text": "4",
        "is_correct": false
      },
      {
        "text": "5",
        "is_correct": true
      },
      {
        "text": "6",
        "is_correct": false
      }
    ],
    "explanation": "2 + 3 = 5."
  }
]`;
