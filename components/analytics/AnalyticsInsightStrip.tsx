"use client";

import { Sparkles } from "lucide-react";

export function AnalyticsInsightStrip({
  title,
  insights,
}: {
  title: string;
  insights: string[];
}) {
  const visibleInsights = insights.filter(Boolean).slice(0, 3);
  if (!visibleInsights.length) return null;

  return (
    <section className="grid gap-3 rounded-[1.5rem] border border-[#f6c445]/35 bg-gradient-to-r from-[#fff7df] via-white to-[#eef8f2] p-4 premium-fade-in md:grid-cols-[auto_1fr] md:items-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071d3a] text-[#f6c445] shadow-xl shadow-[#071d3a]/15">
        <Sparkles size={20} />
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b88a00]">{title}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {visibleInsights.map((insight, index) => (
            <span key={`analytics-insight-${index}-${insight}`} className="rounded-full bg-white/80 px-4 py-2 text-sm font-black text-[#071d3a] shadow-sm">
              {insight}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
