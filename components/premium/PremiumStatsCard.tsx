"use client";

import type { ComponentType } from "react";
import { ArrowUpRight } from "lucide-react";
import { AnimatedCounter } from "@/components/premium/AnimatedCounter";

export function PremiumStatsCard({
  icon: Icon,
  label,
  value,
  detail,
  suffix,
  tone = "green",
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  detail?: string;
  suffix?: string;
  tone?: "green" | "gold" | "blue" | "red";
}) {
  const colors = {
    green: "from-[#0f5f3a]/12 to-white text-[#0f5f3a]",
    gold: "from-[#f6c445]/20 to-white text-[#b88a00]",
    blue: "from-[#071d3a]/12 to-white text-[#071d3a]",
    red: "from-red-100 to-white text-red-700",
  };

  return (
    <section className={`rounded-[1.5rem] border border-white/70 bg-gradient-to-br ${colors[tone]} p-5 shadow-xl shadow-[#071d3a]/5`}>
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon size={21} className="text-current" />
        </span>
        <ArrowUpRight size={18} className="opacity-60" />
      </div>
      <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#071d3a]">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      {detail && <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{detail}</p>}
    </section>
  );
}
