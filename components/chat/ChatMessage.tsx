"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

// Fonction de normalisation améliorée
function normalizeLatex(content: string) {
  let normalized = content;

  // Étape 1: Remplacer les \(...\) par $...$ (inline math)
  normalized = normalized.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, math) => `$${math.trim()}$`
  );

  // Étape 2: Remplacer les \[...\] par $$...$$ (display math)
  normalized = normalized.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, math) => `$$${math.trim()}$$`
  );

  // Étape 3: Gérer les cas où des parenthèses simples sont utilisées
  // (comme dans votre exemple: (\frac{2}{5} + \frac{1}{5}))
  normalized = normalized.replace(
    /\(([^()]*?\\frac[^()]*?)\)/g,
    (_, math) => `$${math.trim()}$`
  );

  // Étape 4: Gérer les crochets simples
  normalized = normalized.replace(
    /\[\s*([\s\S]*?\\frac[\s\S]*?)\s*\]/g,
    (_, math) => `$$${math.trim()}$$`
  );

  // Étape 5: Nettoyer les cas où il y a déjà des $ autour des formules
  // pour éviter les doubles dollars
  normalized = normalized.replace(/\$\s*\$(\w)/g, '$$$1');
  normalized = normalized.replace(/(\w)\$\s*\$/, '$1$$');

  return normalized;
}

type Props = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "USER";

  return (
    <div
      className={`
        flex
        ${isUser ? "justify-end" : "justify-start"}
        mb-4
      `}
    >
      <div
        className={`
          max-w-[85%]
          rounded-2xl
          px-5
          py-4
          text-sm
          leading-7
          ${
            isUser
              ? "bg-emerald-600 text-white"
              : "bg-white text-slate-800 shadow-sm border border-slate-100"
          }
        `}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1({ children }) {
              return <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>;
            },
            h2({ children }) {
              return <h2 className="text-lg font-bold mt-4 mb-2">{children}</h2>;
            },
            h3({ children }) {
              return <h3 className="text-base font-bold mt-3 mb-2">{children}</h3>;
            },
            p({ children }) {
              return <p className="mb-3">{children}</p>;
            },
            ul({ children }) {
              return <ul className="list-disc ml-6 mb-3">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal ml-6 mb-3">{children}</ol>;
            },
            li({ children }) {
              return <li className="mb-1">{children}</li>;
            },
            strong({ children }) {
              return <strong className="font-bold">{children}</strong>;
            },
            code({ children, className }) {
              return (
                <code
                  className={
                    className
                      ? className
                      : `
                        bg-slate-100
                        rounded
                        px-1
                        py-0.5
                        text-pink-600
                      `
                  }
                >
                  {children}
                </code>
              );
            },
            blockquote({ children }) {
              return (
                <blockquote
                  className="
                    border-l-4
                    border-emerald-500
                    pl-4
                    italic
                    my-3
                  "
                >
                  {children}
                </blockquote>
              );
            },
          }}
        >
          {normalizeLatex(message.content)}
        </ReactMarkdown>

        <div
          className="
            text-xs
            opacity-50
            mt-3
          "
        >
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </div>
      </div>
    </div>
  );
}
