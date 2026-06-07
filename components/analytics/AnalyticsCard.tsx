"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type AnalyticsCardProps = {
  title: string;
  value: string | number;
  description?: string;
  tone?: "blue" | "green" | "gold" | "red";
  trend?: number;
  badge?: string;
};

const tones = {
  blue: "bg-[#071d3a] text-white",
  green: "bg-[#e8f5ee] text-[#0f5f3a]",
  gold: "bg-[#fff7df] text-[#071d3a]",
  red: "bg-red-50 text-red-700",
};

export function AnalyticsCard({
  title,
  value,
  description,
  tone = "green",
  trend,
  badge,
}: AnalyticsCardProps) {
  const animatedValue = useAnimatedValue(value);
  const trendTone =
    trend === undefined || trend === 0
      ? "bg-slate-100 text-slate-500"
      : trend > 0
        ? "bg-[#e8f5ee] text-[#0f5f3a]"
        : "bg-red-50 text-red-700";
  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <section className="ds-card ds-card-hover group relative overflow-hidden rounded-[1.5rem] p-5 premium-fade-in">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#071d3a] via-[#0f5f3a] to-[#f6c445] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-black tabular-nums text-[#071d3a]">{animatedValue}</p>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${trend === undefined ? tones[tone] : trendTone}`}>
          {trend === undefined ? badge || statusGlyph(tone) : (
            <>
              <TrendIcon size={14} />
              {Math.abs(trend)}%
            </>
          )}
        </span>
      </div>
      {description ? <p className="mt-3 text-sm font-bold leading-6 text-slate-500">{description}</p> : null}
    </section>
  );
}

function statusGlyph(tone: AnalyticsCardProps["tone"]) {
  if (tone === "red") return "!";
  if (tone === "gold") return "+";
  return "+";
}

function useAnimatedValue(value: string | number) {
  const target = typeof value === "number" ? value : null;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === null) return;

    const duration = 650;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return useMemo(() => (target === null ? value : current), [current, target, value]);
}
