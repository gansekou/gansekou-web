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
/* 0. Utilitaires                                                      */
/* ------------------------------------------------------------------ */

const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
};

/** Retire les accents pour tester des mots-clés sans faux négatifs. */
function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Vrai si le caractère peut appartenir à une expression mathématique. */
function isMathChar(c: string): boolean {
  return /[a-zA-Z0-9+\-*/^_=().,√≤≥≠±×÷{}\s²³⁴⁵⁶⁷⁸⁹⁰¹]/.test(c);
}

/* ------------------------------------------------------------------ */
/* 1. Conversion des fractions (parenthèses imbriquées gérées)         */
/* ------------------------------------------------------------------ */

/**
 * Convertit `num / den` en `\frac{num}{den}` en gérant :
 *   - les parenthèses imbriquées
 *   - les numérateurs/dénominateurs simples (lettres/chiffres)
 *   - les espaces autour du `/`
 *
 * On parcourt le texte de gauche à droite ; à chaque `/` rencontré,
 * on remonte pour trouver le début du numérateur, puis on descend
 * pour trouver la fin du dénominateur, en suivant la profondeur
 * des parenthèses.
 */
function convertFractions(input: string): string {
  let result = "";
  let i = 0;

  while (i < input.length) {
    // Cherche le prochain '/'
    const slash = input.indexOf("/", i);

    if (slash === -1) {
      result += input.slice(i);
      break;
    }

    // ---------- Numérateur ----------
    let numStart = slash - 1;
    // recule sur les espaces
    while (numStart >= 0 && input[numStart] === " ") numStart--;

    if (numStart < 0) {
      // pas de numérateur → on garde le '/' tel quel
      result += input.slice(i, slash + 1);
      i = slash + 1;
      continue;
    }

    if (input[numStart] === ")") {
      // parenthèses : on remonte en suivant la profondeur
      let depth = 1;
      numStart--;
      while (numStart >= 0 && depth > 0) {
        if (input[numStart] === ")") depth++;
        else if (input[numStart] === "(") depth--;
        numStart--;
      }
      numStart++; // on était allé un cran trop loin
      if (input[numStart] !== "(") {
        // parenthèse non équilibrée → on abandonne cette conversion
        result += input.slice(i, slash + 1);
        i = slash + 1;
        continue;
      }
    } else {
      // run simple de lettres/chiffres
      while (numStart >= 0 && /[a-zA-Z0-9]/.test(input[numStart])) numStart--;
      numStart++;
      // rien trouvé → on garde le '/'
      if (numStart === slash) {
        result += input.slice(i, slash + 1);
        i = slash + 1;
        continue;
      }
    }

    // ---------- Dénominateur ----------
    let denStart = slash + 1;
    while (denStart < input.length && input[denStart] === " ") denStart++;

    if (denStart >= input.length) {
      result += input.slice(i, slash + 1);
      i = slash + 1;
      continue;
    }

    let denEnd = denStart;

    if (input[denStart] === "(") {
      let depth = 1;
      denEnd++;
      while (denEnd < input.length && depth > 0) {
        if (input[denEnd] === "(") depth++;
        else if (input[denEnd] === ")") depth--;
        denEnd++;
      }
      denEnd--; // on était allé un cran trop loin
      if (input[denEnd] !== ")") {
        // parenthèse non équilibrée → on abandonne
        result += input.slice(i, slash + 1);
        i = slash + 1;
        continue;
      }
    } else {
      while (denEnd < input.length && /[a-zA-Z0-9]/.test(input[denEnd])) {
        denEnd++;
      }
      denEnd--; // dernier caractère valide
      if (denEnd < denStart) {
        result += input.slice(i, slash + 1);
        i = slash + 1;
        continue;
      }
    }

    const numerator = input.slice(numStart, slash).trim();
    const denominator = input.slice(denStart, denEnd + 1).trim();

    // Sécurité : ni vide ni identique à la chaîne entière
    if (!numerator || !denominator) {
      result += input.slice(i, slash + 1);
      i = slash + 1;
      continue;
    }

    result += input.slice(i, numStart);
    result += `\\frac{${numerator}}{${denominator}}`;
    i = denEnd + 1;
  }

  return result;
}

/* ------------------------------------------------------------------ */
/* 2. Normalisation d'un texte contenant des maths en LaTeX            */
/* ------------------------------------------------------------------ */

function normalizeMathText(value: string): string {
  let text = value.trim();

  // ---------- 1. Signes Unicode ----------
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

  // ---------- 2. Puissances Unicode : x² → x^{2} ----------
  text = text.replace(
    /([a-zA-Z0-9)])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,
    (_m, base: string, power: string) => {
      const converted = [...power]
        .map((c) => SUPERSCRIPTS[c] ?? c)
        .join("");
      return `${base}^{${converted}}`;
    }
  );

  // ---------- 3. Puissances parenthésées : x^(2) → x^{2} ----------
  text = text.replace(/([a-zA-Z0-9)])\^\(([^()]*)\)/g, "$1^{$2}");

  // ---------- 4. Fractions (parenthèses imbriquées gérées) ----------
  text = convertFractions(text);

  // ---------- 5. Racines carrées (après les puissances/fractions) ----------
  // √(...) — on autorise un niveau d'imbrication simple
  text = text.replace(/√\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, "\\sqrt{$1}");
  text = text.replace(/√\s*([0-9]+(?:[.,][0-9]+)?)/g, "\\sqrt{$1}");
  text = text.replace(/√\s*([a-zA-Z][a-zA-Z0-9]*)/g, "\\sqrt{$1}");

  return text;
}

/* ------------------------------------------------------------------ */
/* 3. Détection d'une expression purement mathématique                 */
/* ------------------------------------------------------------------ */

function isPureMath(value: string): boolean {
  const v = value.trim();
  if (!v) return false;

  const unaccented = stripAccents(v);

  // Mots-clés typiques du français → ce n'est pas une formule pure
  if (
    /\b(?:le|la|les|un|une|des|dans|avec|est|soit|on|calcule|determiner|resoudre|montrer|verifier|donner|exprimer|suivant|pour|tout|appartient|intervalle|solution|solutions|equation|inequation|fonction|nombre|valeurs)\b/i.test(
      unaccented
    )
  ) {
    return false;
  }

  // LaTeX explicite
  if (/\\[a-zA-Z]+/.test(v)) return true;

  // Signal mathématique explicite
  const hasMathSignal =
    /[+\-*/^_=√π∞≤≥≠±×÷]/.test(v) ||
    /\([^)]*[a-zA-Z][^)]*\)/.test(v) ||
    /[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(v);

  if (!hasMathSignal) return false;

  // Seuls caractères autorisés
  const allowed =
    /^[a-zA-Z0-9\s+\-*/^_=().,{}[\]|<>≤≥≠±×÷√π∞∑∏∫°'′″²³⁴⁵⁶⁷⁸⁹⁰¹]+$/;

  return allowed.test(v);
}

/* ------------------------------------------------------------------ */
/* 4. Segmentation d'un texte mixte (tokenizer manuel)                 */
/* ------------------------------------------------------------------ */

type Segment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean };

/**
 * Découpe un texte en segments texte / math en suivant la profondeur
 * des parenthèses, au lieu d'une regex récursive (non supportée en JS).
 */
function splitPlainTextAndMath(value: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;
  let buffer = "";
  let inMath = false;

  const flush = () => {
    if (!buffer) return;
    const trimmed = buffer.trim();
    if (
      inMath &&
      trimmed.length >= 2 &&
      /[+\-*/^=≤≥≠×÷√²³⁴⁵⁶⁷⁸⁹]/.test(trimmed)
    ) {
      segments.push({ type: "math", value: trimmed, display: false });
    } else {
      segments.push({ type: "text", value: buffer });
    }
    buffer = "";
  };

  while (i < value.length) {
    const c = value[i];

    if (!inMath) {
      // Peut-on démarrer un run math ?
      if (/[a-zA-Z(√]/.test(c)) {
        // Fenêtre de 80 char pour vérifier la présence d'un opérateur
        const window = value.slice(i, i + 80);
        if (/[+\-*/^=≤≥≠×÷√²³⁴⁵⁶⁷⁸⁹]/.test(window)) {
          // On s'assure qu'on n'est pas au milieu d'un mot
          const prev = i > 0 ? value[i - 1] : " ";
          if (/[\s(,;:[{]/.test(prev) || i === 0) {
            flush();
            inMath = true;
            buffer += c;
            i++;
            continue;
          }
        }
      }
    } else {
      // Fin du run math ?
      if (!isMathChar(c)) {
        // On tolère un espace s'il est suivi d'un caractère math
        inMath = false;
        flush();
        buffer += c;
        i++;
        continue;
      }
      buffer += c;
      i++;
      continue;
    }

    buffer += c;
    i++;
  }
  flush();
  return segments;
}

/* ------------------------------------------------------------------ */
/* 5. Découpage $...$ / $$...$$                                        */
/* ------------------------------------------------------------------ */

function splitDollarMath(value: string): Segment[] {
  const result: Segment[] = [];
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
/* 6. Rendu d'un segment math                                          */
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
/* 7. Composant principal                                              */
/* ------------------------------------------------------------------ */

export function MathText({
  content,
  block = false,
  className = "",
}: MathTextProps) {
  if (content === null || content === undefined) return null;

  const value = String(content);

  // --- Cas A : contenu balisé avec $...$ ou $$...$$ ---
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

  // --- Cas B : expression purement mathématique ---
  if (isPureMath(value)) {
    const math = normalizeMathText(value);
    if (block) {
      return (
        <div className={className}>
          <BlockMath
            math={math}
            errorColor="#dc2626"
            renderError={() => (
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

  // --- Cas C : texte mixte → segmentation automatique ---
  const parts = splitPlainTextAndMath(value);

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
