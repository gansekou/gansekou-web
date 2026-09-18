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
       * Images réellement présentes dans le presse-papiers.
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
       * Certaines versions de Word/Chrome
       * mettent les images directement en data:image.
       */
      const htmlImages = html ? extractDataImages(html) : [];

      const files =
        clipboardImages.length > 0 ? clipboardImages : htmlImages;

      /*
       * Upload vers le stockage GANSEKOU.
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
           * Une erreur d'image ne bloque pas l'import.
           */
        }
      }

      /*
       * Analyse du texte.
       */
      const source = normalizeWordText(
        text || htmlToText(html)
      );

      const result = parseQuizText(source);

      /*
       * Association des images aux questions.
       *
       * Pour cette version, une image principale
       * est associée à chaque question dans l'ordre.
       */
      result.questions = result.questions.map(
        (question, index) => ({
          ...question,
          question_image_url:
            imageUrls[index] ||
            question.question_image_url ||
            null,
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
   * Formats acceptés :
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

    /*
     * Deux formats sont acceptés :
     *
     * 1. Tableau direct :
     * [
     *   {...},
     *   {...}
     * ]
     *
     * 2. Format complet GANSEKOU :
     * {
     *   "title": "...",
     *   "questions": [...]
     * }
     */
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

    items.forEach((item: any, index: number) => {
      const questionText =
        item?.question_text ??
        item?.question ??
        item?.text ??
        "";

      if (!String(questionText).trim()) {
        errors.push(
          `Question ${index + 1} : texte manquant.`
        );
        return;
      }

      /*
       * --------------------------------------------------------
       * RÉCUPÉRATION DES OPTIONS
       * --------------------------------------------------------
       *
       * Format moderne :
       *
       * "options": [
       *   "réponse A",
       *   "réponse B",
       *   "réponse C",
       *   "réponse D"
       * ]
       *
       * Ancien format :
       *
       * "choices": [
       *   {
       *     "text": "...",
       *     "is_correct": true
       *   }
       * ]
       */
      let rawChoices: any[] = [];

      if (Array.isArray(item?.options)) {
        rawChoices = item.options;
      } else if (Array.isArray(item?.choices)) {
        rawChoices = item.choices;
      }

      if (rawChoices.length < 2) {
        errors.push(
          `Question ${index + 1} : au moins deux propositions sont nécessaires.`
        );
        return;
      }

      /*
       * --------------------------------------------------------
       * TYPE DE QUESTION
       * --------------------------------------------------------
       */
      const questionType =
        normalizeQuestionType(
          item?.question_type ??
            item?.type ??
            "SINGLE_CHOICE"
        );

      /*
       * --------------------------------------------------------
       * BONNE RÉPONSE
       * --------------------------------------------------------
       *
       * Format recommandé :
       *
       * "correct_answer": 0
       *
       * signifie :
       * première proposition correcte.
       *
       * "correct_answer": 1
       *
       * signifie :
       * deuxième proposition correcte.
       *
       * On accepte aussi :
       *
       * "correct_answer": "A"
       * "correct_answer": "B"
       * "correct_answer": "C"
       * "correct_answer": "D"
       *
       * Et pour le choix multiple :
       *
       * "correct_answer": [0, 2]
       */
      const correctIndexes =
        resolveCorrectIndexes(
          item?.correct_answer,
          item?.correct_answers,
          rawChoices
        );

      /*
       * Si aucune bonne réponse n'est indiquée,
       * on vérifie si les objets choices contiennent
       * déjà is_correct/correct.
       */
      const choices = rawChoices.map(
        (choice: any, choiceIndex: number) => {
          const text =
            typeof choice === "string"
              ? choice
              : String(
                  choice?.choice_text ??
                    choice?.text ??
                    choice?.label ??
                    choice?.option ??
                    ""
                );

          const explicitCorrect =
            typeof choice === "object" &&
            choice !== null &&
            (
              choice?.is_correct === true ||
              choice?.correct === true
            );

          const indexCorrect =
            correctIndexes.includes(choiceIndex);

          return {
            choice_text: text,
            is_correct:
              indexCorrect || explicitCorrect,
          };
        }
      );

      /*
       * Vérification supplémentaire.
       */
      if (
        questionType !== "SHORT_ANSWER" &&
        !choices.some(
          (choice) => choice.is_correct
        )
      ) {
        errors.push(
          `Question ${index + 1} : aucune bonne réponse n'a été détectée. Utilisez « correct_answer » avec un index comme 0, 1, 2 ou 3.`
        );
        return;
      }

      /*
       * Pour SINGLE_CHOICE et TRUE_FALSE,
       * une seule réponse doit être correcte.
       */
      if (
        (questionType === "SINGLE_CHOICE" ||
          questionType === "TRUE_FALSE") &&
        choices.filter(
          (choice) => choice.is_correct
        ).length > 1
      ) {
        warnings.push(
          `Question ${index + 1} : plusieurs réponses sont marquées correctes. La première sera conservée pour un choix unique.`
        );

        let firstCorrectFound = false;

        choices.forEach((choice) => {
          if (choice.is_correct) {
            if (!firstCorrectFound) {
              firstCorrectFound = true;
            } else {
              choice.is_correct = false;
            }
          }
        });
      }

      /*
       * --------------------------------------------------------
       * IMAGE
       * --------------------------------------------------------
       */
      const image =
        item?.question_image_url ??
        item?.image_url ??
        item?.image ??
        null;

      /*
       * --------------------------------------------------------
       * QUESTION FINALE
       * --------------------------------------------------------
       */
      questions.push({
        ...createEmptyQuestion(index),

        question_text:
          String(questionText).trim(),

        explanation:
          item?.explanation ??
          item?.correction ??
          item?.solution ??
          "",

        question_type: questionType,

        points:
          Number(item?.points) > 0
            ? Number(item.points)
            : 1,

        question_image_url:
          typeof image === "string" &&
          image.trim()
            ? image.trim()
            : null,

        choices,
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
   NORMALISATION DU TYPE
============================================================ */

function normalizeQuestionType(
  value: unknown
): EditableQuizQuestion["question_type"] {
  const type = String(
    value || ""
  )
    .trim()
    .toUpperCase();

  switch (type) {
    case "MULTIPLE_CHOICE":
    case "MULTIPLE":
    case "MULTI_CHOICE":
      return "MULTIPLE_CHOICE";

    case "TRUE_FALSE":
    case "TRUEFALSE":
    case "VRAI_FAUX":
      return "TRUE_FALSE";

    case "SHORT_ANSWER":
    case "SHORT":
    case "RESPONSE_COURTE":
      return "SHORT_ANSWER";

    case "SINGLE_CHOICE":
    case "SINGLE":
    case "QCM":
    default:
      return "SINGLE_CHOICE";
  }
}

/* ============================================================
   RÉSOLUTION DE LA BONNE RÉPONSE
============================================================ */

function resolveCorrectIndexes(
  correctAnswer: unknown,
  correctAnswers: unknown,
  choices: any[]
): number[] {
  /*
   * Priorité à correct_answers pour le choix multiple.
   */
  const source =
    Array.isArray(correctAnswers)
      ? correctAnswers
      : correctAnswer;

  if (Array.isArray(source)) {
    return source
      .map((value) =>
        resolveOneCorrectIndex(
          value,
          choices.length
        )
      )
      .filter(
        (index): index is number =>
          index !== null
      );
  }

  const singleIndex =
    resolveOneCorrectIndex(
      source,
      choices.length
    );

  return singleIndex === null
    ? []
    : [singleIndex];
}

function resolveOneCorrectIndex(
  value: unknown,
  choiceCount: number
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  /*
   * ----------------------------------------------------------
   * INDEX NUMÉRIQUE
   * ----------------------------------------------------------
   *
   * 0 => A
   * 1 => B
   * 2 => C
   * 3 => D
   */
  if (
    typeof value === "number" &&
    Number.isInteger(value)
  ) {
    if (
      value >= 0 &&
      value < choiceCount
    ) {
      return value;
    }

    /*
     * Tolérance pour un format 1-based :
     * 1 => A
     * 2 => B
     * 3 => C
     * 4 => D
     */
    if (
      value >= 1 &&
      value <= choiceCount
    ) {
      return value - 1;
    }

    return null;
  }

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[.)]/g, "");

  /*
   * Lettre :
   *
   * A => 0
   * B => 1
   * C => 2
   * D => 3
   */
  if (/^[A-D]$/.test(normalized)) {
    const index =
      normalized.charCodeAt(0) - 65;

    return index < choiceCount
      ? index
      : null;
  }

  /*
   * Chaîne numérique :
   *
   * "0" => 0
   * "1" => 1
   */
  if (/^\d+$/.test(normalized)) {
    const numeric =
      Number(normalized);

    if (
      numeric >= 0 &&
      numeric < choiceCount
    ) {
      return numeric;
    }

    /*
     * Tolérance 1-based.
     */
    if (
      numeric >= 1 &&
      numeric <= choiceCount
    ) {
      return numeric - 1;
    }
  }

  return null;
}

/* ============================================================
   WORD / HTML
============================================================ */

function normalizeWordText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\u202f/g, " ")
    .replace(/\u2007/g, " ")
    .replace(/\u200b/g, "")
    .replace(/\uFEFF/g, "")
    // Plusieurs espaces horizontaux deviennent un seul espace,
    // mais les espaces entre les mots sont toujours conservés.
    .replace(/[ \t]+/g, " ")
    // Maximum deux lignes vides consécutives.
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

function htmlToText(html: string): string {
  if (!html) {
    return "";
  }

  if (typeof DOMParser === "undefined") {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ");
  }

  const doc = new DOMParser().parseFromString(
    html,
    "text/html"
  );

  /*
   * Les images sont remplacées par un marqueur.
   */
  doc.querySelectorAll("img").forEach((img) => {
    img.replaceWith(
      doc.createTextNode("\n[IMAGE]\n")
    );
  });

  /*
   * Les éléments structurants deviennent des retours
   * à la ligne.
   */
  doc.querySelectorAll(
    "br, p, div, li, tr, h1, h2, h3, h4, h5, h6"
  ).forEach((element) => {
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

  /*
   * textContent est utilisé plutôt que innerText.
   *
   * Cela évite que le navigateur réinterprète
   * les espaces selon le rendu visuel du HTML.
   */
  const text =
    doc.body.textContent || "";

  return normalizeWordText(text);
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

const JSON_PLACEHOLDER = `{
  "title": "Les entiers naturels : lecture et écriture",
  "language": "FREN",
  "subject": "Mathématiques",
  "level": "6 EME",
  "difficulty": "BEGINNER",
  "type": "QCM",
  "estimated_duration": 10,
  "required_score": 60,
  "description": "Évaluation sur la lecture et l’écriture des entiers naturels.",
  "questions": [
    {
      "question": "Quel est le nombre qui vient après 999 ?",
      "options": [
        "100",
        "999",
        "1000",
        "1001"
      ],
      "correct_answer": 2,
      "explanation": "Après 999 vient 1000."
    },
    {
      "question": "Quel est le chiffre des milliers dans 47 326 ?",
      "options": [
        "4",
        "7",
        "3",
        "6"
      ],
      "correct_answer": 1,
      "explanation": "Dans 47 326, le chiffre des milliers est 7."
    }
  ]
}`;
