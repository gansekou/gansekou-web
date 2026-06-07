"use client";

import Link from "next/link";
import { Command, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchItem = {
  label: string;
  href: string;
  group: string;
};

const items: SearchItem[] = [
  { label: "Dashboard", href: "/dashboard", group: "Gansekou" },
  { label: "Cours", href: "/courses", group: "Apprendre" },
  { label: "Exercices", href: "/exercises", group: "Apprendre" },
  { label: "Sujets", href: "/subjects", group: "Apprendre" },
  { label: "Quiz", href: "/quizzes", group: "Evaluation" },
  { label: "Notifications", href: "/notifications", group: "Compte" },
  { label: "Premium", href: "/premium", group: "Compte" },
  { label: "IA", href: "/ai", group: "Assistant" },
  { label: "Statistiques", href: "/analytics", group: "Pilotage" },
];

export function GlobalSearch({ placeholder }: { placeholder: string }) {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const task = window.setTimeout(() => {
      const stored = window.localStorage.getItem("gansekou_search_history");
      if (!stored) return;

      try {
        setHistory(JSON.parse(stored) as string[]);
      } catch {
        setHistory([]);
      }
    }, 0);

    return () => window.clearTimeout(task);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (!typing && event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items.filter((item) => history.includes(item.href)).concat(items.slice(0, 4)).slice(0, 5);
    }
    return items.filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(normalized)).slice(0, 6);
  }, [history, query]);

  function remember(href: string) {
    const next = [href, ...history.filter((item) => item !== href)].slice(0, 5);
    setHistory(next);
    window.localStorage.setItem("gansekou_search_history", JSON.stringify(next));
    setQuery("");
  }

  return (
    <div className="group relative hidden min-w-[260px] max-w-md flex-1 md:block">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 pl-11 pr-4 text-sm font-bold text-[#071d3a] outline-none transition focus:border-[#f6c445] focus:ring-4 focus:ring-[#f6c445]/15"
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-400 lg:flex">
        <Command size={12} />K
      </span>
      <div className="invisible absolute left-0 right-0 top-14 z-50 rounded-3xl border border-slate-200 bg-white/95 p-2 opacity-0 shadow-2xl shadow-[#071d3a]/15 backdrop-blur-xl transition group-focus-within:visible group-focus-within:opacity-100">
        {results.map((item, index) => (
          <Link
            key={`global-search-${item.group}-${item.href}-${item.label}-${index}`}
            href={item.href}
            onClick={() => remember(item.href)}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black text-[#071d3a] transition hover:bg-slate-50"
          >
            <span>{item.label}</span>
            <span className="text-xs font-bold text-slate-400">{item.group}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
