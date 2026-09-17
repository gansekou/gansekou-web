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
/* 1. Normalisation du pseudo-LaTeX / Unicode vers du LaTeX valide     */
/* ------------------------------------------------------------------ */

const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
};

/**
 * Convertit un texte contenant des notations mathématiques « humaines »
 * (√, π, ², 4/5, …) en LaTeX compréhensible par KaTeX.
 *
 * ⚠️ Important : on n'applique cette fonction QUE sur du contenu qui
 * n'est PAS déjà du LaTeX (pas de `\` déjà présent), sinon on risque
 * de casser les commandes existantes.
 */
function normalizeMathText(value: string): string {
  let text = value.trim();

  // 1. Racines carrées Unicode : √3, √(x+1), √x
  text = text.replace(/√\s*\(([^()]*)\)/g, "\\sqrt{$1}");
  text = text.replace(/√\s*([0-9]+(?:[.,][0-9]+)?)/g, "\\sqrt{$1}");
  text = text.replace(/√\s*([a-zA-Z][a-zA-Z0-9]*)/g, "\\sqrt{$1}");

  // 2. Fractions entre parenthèses : (a+b)/(c+d)
  text = text.replace(
    /\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g,
    "\\frac{$1}{$2}"
  );

  // 3. Fractions simples : 4/5, -4/5, 3,5/2
  //    On évite les URLs (pas de `/` entouré de lettres).
  text = text.replace(
    /(^|[\s=(+\-*×])(-?\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)(?=$|[\s),+\-*×])/g,
    (_match, prefix, num, den) => `${prefix}\\frac{${num}}{${den}}`
  );

  // 4. Puissances Unicode : x² -> x^{2}
  text = text.replace(
    /([a-zA-Z0-9)])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,
    (_m, base: string, power: string) => {
      const converted = [...power]
        .map((c) => SUPERSCRIPTS[c] ?? c)
        .join("");
      return `${base}^{${converted}}`;
    }
  );

  // 5. Puissances parenthésées : x^(2) -> x^{2}
  text = text.replace(/([a-zA-Z0-9)])\^\(([^()]*)\)/g, "$1^{$2}");

  // 6. Symboles mathématiques courants
  text = text
    .replace(/π/g, "\\pi ")
    .replace(/∞/g, "\\infty ")
    .replace(/≤/g, "\\leq ")
    .replace(/≥/g, "\\geq ")
    .replace(/≠/g, "\\neq ")
    .replace(/±/g, "\\pm ")
    .replace(/×/g, "\\times ");

  return text;
}

/* ------------------------------------------------------------------ */
/* 2. Détection : le texte contient-il des maths ?                     */
/* ------------------------------------------------------------------ */

/**
 * Détection volontairement conservatrice : on ne veut PAS traiter
 * `mon_fichier` ou `snake_case` comme des maths.
 */
function containsMathSyntax(value: string): boolean {
  // Déjà du LaTeX explicite
  if (/\\[a-zA-Z]+/.test(value)) return true;

  // Symboles Unicode mathématiques non ambigus
  if (/[√π∞≤≥≠±]/.test(value)) return true;

  // Exposants Unicode
  if (/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(value)) return true;

  // Fraction numérique isolée : 4/5, -3/2, 3,5/2
  if (/(^|[\s=(])-?\d+(?:[.,]\d+)?\s*\/\s*\d+(?:[.,]\d+)?($|[\s)])/.test(value)) {
    return true;
  }

  // Puissance explicite : x^2, x^{2}, x^(2)
  if (/[a-zA-Z0-9)]\s*\^\s*[\(\{\d a-zA-Z]/.test(value)) return true;

  // Indice explicite : x_1, x_{n}
  if (/[a-zA-Z]\s*_\s*[\(\{\d a-zA-Z]/.test(value)) return true;

  return false;
}

/* ------------------------------------------------------------------ */
/* 3. Découpage texte / segments $...$                                 */
/* ------------------------------------------------------------------ */

type Segment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean };

function splitTextAndMath(value: string): Segment[] {
  const result: Segment[] = [];

  // Supporte $...$ (inline) et $$...$$ (display)
  const regex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        value: value.slice(lastIndex, match.index),
      });
    }

    const isDisplay = match[1] !== undefined;
    const math = isDisplay ? match[1] : match[2];

    result.push({
      type: "math",
      value: math,
      display: isDisplay,
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < value.length) {
    result.push({
      type: "text",
      value: value.slice(lastIndex),
    });
  }

  return result;
}

/* ------------------------------------------------------------------ */
/* 4. Rendu sûr d'un segment math                                      */
/* ------------------------------------------------------------------ */

function renderMath(
  math: string,
  display: boolean,
  key: number
): ReactNode {
  // Si c'est déjà du LaTeX (contient `\`), on ne normalise pas.
  // Sinon, on applique la normalisation Unicode → LaTeX.
  const normalized = /\\[a-zA-Z]+/.test(math)
    ? math
    : normalizeMathText(math);

  const commonProps = {
    math: normalized,
    errorColor: "#dc2626",
    renderError: (error: Error) => (
      <span
        title={error.message}
        style={{ color: "#dc2626", fontFamily: "monospace" }}
      >
        {math}
      </span>
    ),
  } as const;

  if (display) {
    return <BlockMath key={key} {...commonProps} />;
  }
  return <InlineMath key={key} {...commonProps} />;
}

/* ------------------------------------------------------------------ */
/* 5. Composant principal                                              */
/* ------------------------------------------------------------------ */

export function MathText({
  content,
  block = false,
  className = "",
}: MathTextProps) {
  if (content === null || content === undefined) {
    return null;
  }

  const value = String(content);

  // Cas 1 : contenu avec des segments $...$ explicites
  if (value.includes("$")) {
    const parts = splitTextAndMath(value);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (part.type === "math") {
            return renderMath(part.value, part.display || block, index);
          }
          return <span key={index}>{part.value}</span>;
        })}
      </span>
    );
  }

  // Cas 2 : expression mathématique détectée automatiquement
  if (containsMathSyntax(value)) {
    const math = normalizeMathText(value);

    if (block) {
      return (
        <div className={className}>
          <BlockMath
            math={math}
            errorColor="#dc2626"
            renderError={(error) => (
              <span style={{ color: "#dc2626" }}>{value}</span>
            )}
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

  // Cas 3 : texte normal
  return <span className={className}>{value}</span>;
}

export default MathText;
