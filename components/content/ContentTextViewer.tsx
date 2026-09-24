
"use client";

import { useMemo } from "react";
import { MathText } from "@/components/math/MathText";

type ContentTextViewerProps = {
  content: string;
};

type TextBlock =
  | {
      type: "heading";
      content: string;
      level: 1 | 2 | 3;
    }
  | {
      type: "paragraph";
      content: string;
    }
  | {
      type: "list";
      content: string;
      ordered: boolean;
      index?: number;
    }
  | {
      type: "separator";
    };

function normalizeContent(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function isMainHeading(line: string): boolean {
  return (
    /^EXERCICES?\s+AVANCÉS?/i.test(line) ||
    /^EXERCICES?\s+AVANCES?/i.test(line)
  );
}

function isExerciseHeading(line: string): boolean {
  return /^EXERCICE\s+\d+/i.test(line);
}

function isPartHeading(line: string): boolean {
  return /^PARTIE\s+[A-Z]/i.test(line);
}

function isNumberedQuestion(line: string): boolean {
  return /^\d+[.)]\s+/.test(line);
}

function isBullet(line: string): boolean {
  return /^[-•]\s+/.test(line);
}

function parseTextBlocks(content: string): TextBlock[] {
  const lines = normalizeContent(content).split("\n");
  const blocks: TextBlock[] = [];
  let paragraph: string[] = [];

  function flushParagraph() {
    const value = paragraph.join(" ").replace(/\s+/g, " ").trim();

    if (value) {
      blocks.push({
        type: "paragraph",
        content: value,
      });
    }

    paragraph = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (isMainHeading(line)) {
      flushParagraph();
      blocks.push({
        type: "heading",
        content: line,
        level: 1,
      });
      continue;
    }

    if (isExerciseHeading(line)) {
      flushParagraph();
      blocks.push({
        type: "heading",
        content: line,
        level: 2,
      });
      continue;
    }

    if (isPartHeading(line)) {
      flushParagraph();
      blocks.push({
        type: "heading",
        content: line,
        level: 3,
      });
      continue;
    }

    if (isNumberedQuestion(line)) {
      flushParagraph();
      blocks.push({
        type: "list",
        content: line.replace(/^\d+[.)]\s+/, ""),
        ordered: true,
        index: Number(line.match(/^\d+/)?.[0] ?? 1),
      });
      continue;
    }

    if (isBullet(line)) {
      flushParagraph();
      blocks.push({
        type: "list",
        content: line.replace(/^[-•]\s+/, ""),
        ordered: false,
      });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();

  return blocks;
}

export function ContentTextViewer({
  content,
}: ContentTextViewerProps) {
  const blocks = useMemo(
    () => parseTextBlocks(content),
    [content]
  );

  if (!content.trim()) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
        Aucun contenu textuel disponible.
      </div>
    );
  }

  return (
    <article
      className="
        mx-auto w-full max-w-5xl
        rounded-[1.5rem] border border-slate-200
        bg-white p-4 shadow-sm
        sm:p-6 lg:p-8
      "
    >
      <div className="space-y-5 text-[15px] leading-7 text-slate-700 sm:text-base">
        {blocks.map((block, index) => {
          if (block.type === "separator") {
            return (
              <hr
                key={index}
                className="border-slate-200"
              />
            );
          }

          if (block.type === "heading") {
            if (block.level === 1) {
              return (
                <h1
                  key={index}
                  className="
                    border-b border-slate-200 pb-4
                    text-center text-lg font-black
                    uppercase tracking-tight text-[#071d3a]
                    sm:text-2xl
                  "
                >
                  <MathText content={block.content} />
                </h1>
              );
            }

            if (block.level === 2) {
              return (
                <h2
                  key={index}
                  className="
                    mt-8 rounded-xl border-l-4
                    border-[#d4a72c] bg-[#071d3a]/[0.04]
                    px-4 py-3 text-base font-black
                    uppercase leading-6 text-[#071d3a]
                    sm:text-lg
                  "
                >
                  <MathText content={block.content} />
                </h2>
              );
            }

            return (
              <h3
                key={index}
                className="
                  mt-6 text-sm font-black uppercase
                  tracking-wide text-[#071d3a]
                  sm:text-base
                "
              >
                <MathText content={block.content} />
              </h3>
            );
          }

          if (block.type === "list") {
            return (
              <div
                key={index}
                className="
                  flex items-start gap-3
                  rounded-xl border border-slate-100
                  bg-slate-50/70 px-3 py-3
                  sm:px-4
                "
              >
                {block.ordered ? (
                  <span
                    className="
                      mt-0.5 flex h-6 min-w-6 items-center
                      justify-center rounded-full
                      bg-[#071d3a] text-xs font-black text-white
                    "
                  >
                    {block.index}
                  </span>
                ) : (
                  <span
                    className="
                      mt-2 h-2 w-2 min-w-2 rounded-full
                      bg-[#d4a72c]
                    "
                  />
                )}

                <div className="min-w-0 flex-1">
                  <MathText content={block.content} />
                </div>
              </div>
            );
          }

          return (
            <p
              key={index}
              className="
                whitespace-normal break-words
                leading-8
              "
            >
              <MathText content={block.content} />
            </p>
          );
        })}
      </div>
    </article>
  );
}
