"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import type { ReactNode } from "react";

type MathTextProps = {
  content?: string | null;
  block?: boolean;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* 1. Symboles Unicode → LaTeX                                         */
/* ------------------------------------------------------------------ */

const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
};

function normalizeMathText(value: string): string {
  let text = value.trim();

  // ---------------------------------------------------------------
  // 1. Normalisation des signes Unicode
  // ---------------------------------------------------------------

  text = text
    .replace(/−/g, "-")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/·/g, "\\cdot ")
    .replace(/×/g, "\\times ")
    .replace(/≤/g, "\\leq ")
    .replace(/≥/g, "\\geq ")
    .replace(/≠/g, "\\neq ")
    .replace(/±/g, "\\pm ")
    .replace(/π/g, "\\pi ")
    .replace(/∞/g, "\\infty ");

  // ---------------------------------------------------------------
  // 2. Racines carrées Unicode
  // ---------------------------------------------------------------

  text = text.replace(
    /√\s*\(([^()]*)\)/g,
    "\\sqrt{$1}"
  );

  text = text.replace(
    /√\s*([0-9]+(?:[.,][0-9]+)?)/g,
    "\\sqrt{$1}"
  );

  text = text.replace(
    /√\s*([a-zA-Z][a-zA-Z0-9]*)/g,
    "\\sqrt{$1}"
  );

  // ---------------------------------------------------------------
  // 3. Fractions avec parenthèses
  // Exemples :
  // (a+b)/(c+d)
  // (x+1)/(x-2)
  // ---------------------------------------------------------------

  text = text.replace(
    /\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g,
    "\\frac{$1}{$2}"
  );

  // ---------------------------------------------------------------
  // 4. Fractions avec un numérateur entre parenthèses
  // Exemples :
  // (x+1)/2
  // (a-b)/c
  // ---------------------------------------------------------------

  text = text.replace(
    /\(([^()]+)\)\s*\/\s*([a-zA-Z0-9]+)/g,
    "\\frac{$1}{$2}"
  );

  // ---------------------------------------------------------------
  // 5. Fractions avec un dénominateur entre parenthèses
  // Exemples :
  // x/(a+b)
  // 2/(x-1)
  // ---------------------------------------------------------------

  text = text.replace(
    /([a-zA-Z0-9]+)\s*\/\s*\(([^()]+)\)/g,
    "\\frac{$1}{$2}"
  );

  // ---------------------------------------------------------------
  // 6. Fractions simples avec lettres ou nombres
  // Exemples :
  // 1/2, x/2, a/b, 3x/4
  // ---------------------------------------------------------------

  text = text.replace(
    /(^|[\s=(+\-*])(-?(?:\d+(?:[.,]\d+)?|[a-zA-Z](?:[a-zA-Z0-9]*)))\s*\/\s*(\d+(?:[.,]\d+)?|[a-zA-Z](?:[a-zA-Z0-9]*))(?=$|[\s),.+\-*=])/g,
    (_match, prefix, numerator, denominator) => {
      return `${prefix}\\frac{${numerator}}{${denominator}}`;
    }
  );

  // ---------------------------------------------------------------
  // 7. Puissances Unicode
  // ---------------------------------------------------------------

  text = text.replace(
    /([a-zA-Z0-9)])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,
    (_match, base: string, power: string) => {
      const converted = [...power]
        .map((character) => SUPERSCRIPTS[character] ?? character)
        .join("");

      return `${base}^{${converted}}`;
    }
  );

  // ---------------------------------------------------------------
  // 8. Puissances entre parenthèses
  // Exemple : x^(2) → x^{2}
  // ---------------------------------------------------------------

  text = text.replace(
    /([a-zA-Z0-9)])\^\(([^()]*)\)/g,
    "$1^{$2}"
  );

  return text;
}

/* ------------------------------------------------------------------ */
/* 2. Détection d'une expression mathématique « autonome »             */
/* ------------------------------------------------------------------ */

/**
 * Vrai si la chaîne ENTIÈRE est une expression mathématique
 * (et non un texte contenant des maths).
 */
function isPureMath(value: string): boolean {
  const v = value.trim();
  if (!v) return false;

  // Si contient déjà du LaTeX explicite
  if (/\\[a-zA-Z]+/.test(v)) return true;

  // Caractères autorisés dans une expression pure
  // (lettres, chiffres, opérateurs, parenthèses, espaces, symboles)
  const allowed = /^[a-zA-Z0-9\s+\-*/^_=().,{}[\]|<>≤≥≠±×÷√π∞∑∏∫°'′″:;!?]+$/;
  if (!allowed.test(v)) return false;

  // Doit contenir au moins un signe « mathématique » distinctif
  const hasMathSignal =
    /[+\-*/^_=√π∞≤≥≠±×÷]/.test(v) ||   // opérateur
    /\([^)]*[a-zA-Z][^)]*\)/.test(v) || // parenthèses avec lettres
    /\d/.test(v);                       // au moins un chiffre

  return hasMathSignal;
}

/* ------------------------------------------------------------------ */
/* 3. Découpage automatique d'un texte en segments texte / math        */
/* ------------------------------------------------------------------ */

type Segment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean };

/**
 * Découpe un texte comme :
 *   "On pose z = (2 - i)/(1 + 2i). Quelle est ..."
 * en :
 *   [text: "On pose ", math: "z = (2 - i)/(1 + 2i)", text: ". Quelle est ..."]
 *
 * Stratégie : on repère les « runs » de caractères mathématiques
 * (lettres/chiffres/opérateurs/parenthèses) et on garde ceux qui
 * contiennent un signal mathématique explicite.
 */
function splitPlainTextAndMath(value: string): Segment[] {
  const result: Segment[] = [];

  /*
   * On détecte uniquement des expressions qui ont
   * une structure mathématique claire.
   *
   * Exemples :
   *   z = (2-i)/(1+2i)
   *   x + 3 = 7
   *   f(x) = x² + 1
   *   a + ib
   *   √(x+1)
   *
   * IMPORTANT :
   * on s'arrête avant la ponctuation d'une phrase.
   */

  const regex =
  /(?:[a-zA-Z]\s*=\s*)?(?:\\sqrt\s*\{[^{}]+\}|√\s*(?:\([^()\n]+\)|[a-zA-Z0-9]+)|[a-zA-Z0-9]+|\([^()\n]+\))(?:\s*(?:[+\-−*/^=≤≥≠×÷])\s*(?:\\sqrt\s*\{[^{}]+\}|√\s*(?:\([^()\n]+\)|[a-zA-Z0-9]+)|[a-zA-Z0-9]+|\([^()\n]+\)))+(?=(?:[.,;:!?]|\s|$))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while (
    (match = regex.exec(value)) !== null
  ) {
    const candidate = match[0];

    /*
     * Protection contre les faux positifs.
     */
    if (
      candidate.trim().length < 2 ||
      !/[+\-−*/^=≤≥≠×÷√]/.test(candidate)
    ) {
      continue;
    }

    /*
     * Texte situé avant le segment mathématique.
     */
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        value: value.slice(
          lastIndex,
          match.index
        ),
      });
    }

    result.push({
      type: "math",
      value: candidate.trim(),
      display: false,
    });

    lastIndex = regex.lastIndex;
  }

  /*
   * Texte restant.
   */
  if (lastIndex < value.length) {
    result.push({
      type: "text",
      value: value.slice(lastIndex),
    });
  }

  return result;
}
/* ------------------------------------------------------------------ */
/* 4. Découpage $...$ / $$...$$                                        */
/* ------------------------------------------------------------------ */

function splitDollarMath(value: string): Segment[] {
  const result: Segment[] = [];
  const regex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }
    const isDisplay = match[1] !== undefined;
    result.push({
      type: "math",
      value: isDisplay ? match[1] : match[2],
      display: isDisplay,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < value.length) {
    result.push({ type: "text", value: value.slice(lastIndex) });
  }

  return result;
}

/* ------------------------------------------------------------------ */
/* 5. Rendu d'un segment math                                          */
/* ------------------------------------------------------------------ */

function renderMath(math: string, display: boolean, key: number): ReactNode {
  const isLatex = /\\[a-zA-Z]+/.test(math);
  const normalized = isLatex ? math : normalizeMathText(math);

  const errorFallback = (error: Error) => (
    <span
      title={error.message}
      style={{ color: "#dc2626", fontFamily: "monospace" }}
    >
      {math}
    </span>
  );

  if (display) {
    return (
      <BlockMath
        key={key}
        math={normalized}
        errorColor="#dc2626"
        renderError={errorFallback}
      />
    );
  }
  return (
    <InlineMath
      key={key}
      math={normalized}
      errorColor="#dc2626"
      renderError={errorFallback}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 6. Composant principal                                              */
/* ------------------------------------------------------------------ */

export function MathText({
  content,
  block = false,
  className = "",
}: MathTextProps) {
  if (content === null || content === undefined) return null;

  const value = String(content);

  // Cas A : contenu avec $...$ explicite
  if (value.includes("$")) {
    const parts = splitDollarMath(value);
    return (
      <span className={className}>
        {parts.map((part, i) =>
          part.type === "math" ? (
            renderMath(part.value, part.display || block, i)
          ) : (
            <span key={i}>{part.value}</span>
          )
        )}
      </span>
    );
  }

  // Cas B : contenu pur math
  if (isPureMath(value)) {
    const math = normalizeMathText(value);
    if (block) {
      return (
        <div className={className}>
          <BlockMath
            math={math}
            errorColor="#dc2626"
            renderError={() => <span style={{ color: "#dc2626" }}>{value}</span>}
          />
        </div>
      );
    }
    return (
      <span className={className}>
        <InlineMath
          math={math}
          errorColor="#dc2626"
          renderError={() => <span>{value}</span>}
        />
      </span>
    );
  }

  // Cas C : texte mixte → on découpe automatiquement
  const parts = splitPlainTextAndMath(value);

  // Aucun segment math trouvé → texte brut
  if (parts.every((p) => p.type === "text")) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.type === "math" ? (
          renderMath(part.value, block, i)
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </span>
  );
}

export default MathText;
