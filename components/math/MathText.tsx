"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

type MathTextProps = {
  content?: string | null;
  block?: boolean;
  className?: string;
};

function normalizeMathText(value: string): string {
  let text = value.trim();

  /*
   * ------------------------------------------------------------
   * 1. Racines carrées Unicode
   * ------------------------------------------------------------
   *
   * √3      -> \sqrt{3}
   * √(x+1)  -> \sqrt{x+1}
   */
  text = text.replace(/√\s*\(([^()]*)\)/g, "\\sqrt{$1}");
  text = text.replace(/√\s*([0-9]+(?:[.,][0-9]+)?)/g, "\\sqrt{$1}");
  text = text.replace(
    /√\s*([a-zA-Z][a-zA-Z0-9]*)/g,
    "\\sqrt{$1}"
  );

  /*
   * ------------------------------------------------------------
   * 2. Fractions simples déjà présentes dans la base
   * ------------------------------------------------------------
   *
   * 4/5       -> \frac{4}{5}
   * -4/5      -> -\frac{4}{5}
   *
   * On évite les fractions faisant partie d'une URL.
   */
  text = text.replace(
    /(^|[\s=(+\-×*])(-?\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)(?=$|[\s),+\-×*])/g,
    "$1\\\\frac{$2}{$3}"
  );

  /*
   * ------------------------------------------------------------
   * 3. Fractions entre parenthèses
   * ------------------------------------------------------------
   *
   * (a+b)/(c+d)
   * -> \frac{a+b}{c+d}
   */
  text = text.replace(
    /\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g,
    "\\\\frac{$1}{$2}"
  );

  /*
   * ------------------------------------------------------------
   * 4. Puissances écrites avec Unicode
   * ------------------------------------------------------------
   *
   * x² -> x^2
   * x³ -> x^3
   * x⁴ -> x^4
   */
  const superscriptMap: Record<string, string> = {
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

  text = text.replace(
    /([a-zA-Z0-9)])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,
    (_, base: string, power: string) => {
      const converted = [...power]
        .map((char) => superscriptMap[char] ?? char)
        .join("");

      return `${base}^{${converted}}`;
    }
  );

  /*
   * ------------------------------------------------------------
   * 5. Puissances avec parenthèses
   * ------------------------------------------------------------
   *
   * x^(2)
   * -> x^{2}
   *
   * e^(iπ/3)
   * -> e^{iπ/3}
   */
  text = text.replace(
    /([a-zA-Z0-9)])\^\(([^()]*)\)/g,
    "$1^{$2}"
  );

  /*
   * ------------------------------------------------------------
   * 6. Indices simples
   * ------------------------------------------------------------
   *
   * x_1
   * x_n
   *
   * On laisse les expressions déjà écrites en LaTeX.
   */

  /*
   * ------------------------------------------------------------
   * 7. Symboles mathématiques courants
   * ------------------------------------------------------------
   */
  text = text
    .replace(/π/g, "\\pi")
    .replace(/∞/g, "\\infty")
    .replace(/≤/g, "\\leq")
    .replace(/≥/g, "\\geq")
    .replace(/≠/g, "\\neq")
    .replace(/±/g, "\\pm")
    .replace(/×/g, "\\times");

  /*
   * ------------------------------------------------------------
   * 8. Valeur absolue / module
   *
   * |z| reste lisible.
   *
   * On ne transforme pas automatiquement toutes les barres,
   * car elles peuvent appartenir au texte.
   */

  /*
   * ------------------------------------------------------------
   * 9. Espacement autour de + et -
   * ------------------------------------------------------------
   *
   * Permet notamment d'avoir :
   *
   * 4/5 + i
   * -> \frac{4}{5}+i
   */

  return text;
}

function containsMathSyntax(value: string): boolean {
  return (
    value.includes("\\") ||
    /[√π∞≤≥≠±×^_]/.test(value) ||
    /\d+\s*\/\s*\d+/.test(value)
  );
}

function splitTextAndMath(value: string): Array<{
  type: "text" | "math";
  value: string;
}> {
  const result: Array<{
    type: "text" | "math";
    value: string;
  }> = [];

  /*
   * Support :
   *
   * $x^2+1$
   * $\\frac{1}{2}$
   */
  const regex = /\$([^$]+)\$/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        value: value.slice(lastIndex, match.index),
      });
    }

    result.push({
      type: "math",
      value: match[1],
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

export function MathText({
  content,
  block = false,
  className = "",
}: MathTextProps) {
  if (!content) {
    return null;
  }

  const value = String(content);

  /*
   * Si le contenu contient explicitement $...$,
   * on sépare texte et mathématiques.
   */
  if (value.includes("$")) {
    const parts = splitTextAndMath(value);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (part.type === "math") {
            return (
              <InlineMath
                key={index}
                math={normalizeMathText(part.value)}
              />
            );
          }

          return (
            <span key={index}>
              {part.value}
            </span>
          );
        })}
      </span>
    );
  }

  /*
   * Si le contenu ressemble à une expression mathématique,
   * on la rend directement avec KaTeX.
   */
  if (containsMathSyntax(value)) {
    const math = normalizeMathText(value);

    if (block) {
      return (
        <div className={className}>
          <BlockMath math={math} />
        </div>
      );
    }

    return (
      <span className={className}>
        <InlineMath math={math} />
      </span>
    );
  }

  /*
   * Texte normal.
   */
  return (
    <span className={className}>
      {value}
    </span>
  );
}

export default MathText;
