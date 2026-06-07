"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function RecommendationEngine({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: Array<{ id: string; title: string; href: string; detail?: string }>;
  emptyLabel: string;
}) {
  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-[#071d3a]/5">
      <h3 className="flex items-center gap-2 text-xl font-black text-[#071d3a]"><Sparkles size={20} />{title}</h3>
      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <Link key={`engine-${index}-${item.id}-${item.href}`} href={item.href} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 transition hover:bg-white">
            <span className="min-w-0">
              <span className="block truncate font-black text-[#071d3a]">{item.title}</span>
              {item.detail && <span className="text-sm font-bold text-slate-500">{item.detail}</span>}
            </span>
            <ArrowRight size={18} className="text-[#0f5f3a]" />
          </Link>
        ))}
      </div>
      {!items.length && <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">{emptyLabel}</p>}
    </section>
  );
}
