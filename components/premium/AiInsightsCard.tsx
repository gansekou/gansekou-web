"use client";

import { Brain } from "lucide-react";

export function AiInsightsCard({ title, insights }: { title: string; insights: string[] }) {
  return (
    <section className="rounded-[1.5rem] bg-gradient-to-br from-[#071d3a] to-[#0f5f3a] p-6 text-white shadow-2xl shadow-[#071d3a]/15">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <Brain size={22} />
        </span>
        <h3 className="text-xl font-black">{title}</h3>
      </div>
      <div className="mt-5 grid gap-3">
        {insights.map((item, index) => (
          <p key={`ai-insight-${index}-${item}`} className="rounded-2xl bg-white/10 p-4 text-sm font-bold leading-6 text-white/80">{item}</p>
        ))}
      </div>
    </section>
  );
}
