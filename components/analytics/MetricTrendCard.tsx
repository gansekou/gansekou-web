"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function MetricTrendCard({
  title,
  value,
  trend,
  detail,
}: {
  title: string;
  value: string | number;
  trend?: number;
  detail?: string;
}) {
  const positive = (trend ?? 0) >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <section className="ds-card rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{title}</p>
        {trend !== undefined ? (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black ${positive ? "bg-[#e8f5ee] text-[#0f5f3a]" : "bg-red-50 text-red-700"}`}>
            <Icon size={14} />
            {Math.abs(trend)}%
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-3xl font-black text-[#071d3a]">{value}</p>
      {detail ? <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{detail}</p> : null}
    </section>
  );
}
