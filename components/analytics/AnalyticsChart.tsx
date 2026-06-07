"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";

export type ChartPoint = {
  label: string;
  value: number;
};

type AnalyticsChartProps = {
  title: string;
  data: ChartPoint[];
  type?: "bar" | "line" | "donut";
  emptyLabel: string;
};

export const AnalyticsChart = memo(function AnalyticsChart({ title, data, type = "bar", emptyLabel }: AnalyticsChartProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const safeData = useMemo(() => data.filter((item) => Number.isFinite(item.value)), [data]);
  const max = Math.max(...safeData.map((item) => item.value), 1);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <section ref={ref} className="ds-card ds-card-hover min-h-64 rounded-[1.5rem] p-5 premium-fade-in">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-[#071d3a]">{title}</h3>
        <span className="h-2 w-2 rounded-full bg-[#0f5f3a] shadow-[0_0_0_6px_rgba(15,95,58,0.09)]" />
      </div>
      {!visible ? (
        <div className="mt-5 h-40 rounded-2xl bg-slate-50" />
      ) : !safeData.length ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 text-sm font-bold text-slate-500">
          {emptyLabel}
        </div>
      ) : type === "donut" ? (
        <Donut data={safeData} />
      ) : type === "line" ? (
        <Line data={safeData} max={max} />
      ) : (
        <Bar data={safeData} max={max} />
      )}
    </section>
  );
});

function Bar({ data, max }: { data: ChartPoint[]; max: number }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="mt-5 space-y-3">
      {data.slice(0, 8).map((item, index) => {
        const width = Math.max(4, (item.value / max) * 100);
        const highlighted = active === item.label;
        return (
          <button
            key={`bar-${item.label}-${index}`}
            type="button"
            onBlur={() => setActive(null)}
            onFocus={() => setActive(item.label)}
            onMouseEnter={() => setActive(item.label)}
            onMouseLeave={() => setActive(null)}
            className="block w-full rounded-2xl p-1 text-left transition hover:bg-slate-50 focus:bg-slate-50"
            style={{ animationDelay: `${index * 55}ms` }}
          >
            <div className="mb-1 flex justify-between gap-3 text-xs font-black text-slate-500">
              <span className="truncate">{item.label}</span>
              <span className={highlighted ? "text-[#0f5f3a]" : ""}>{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#071d3a] via-[#0f5f3a] to-[#f6c445] transition-all duration-700"
                style={{ width: `${width}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Line({ data, max }: { data: ChartPoint[]; max: number }) {
  const gradientId = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);
  const width = 320;
  const height = 140;
  const points = data.map((item, index) => {
    const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
    const y = height - (item.value / max) * (height - 20) - 10;
    return { x, y, item };
  });
  const path = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="relative mt-5">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#071d3a" />
            <stop offset="65%" stopColor="#0f5f3a" />
            <stop offset="100%" stopColor="#f6c445" />
          </linearGradient>
        </defs>
        <polyline points={path} fill="none" stroke={`url(#${gradientId})`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="analytics-line-draw" />
        {points.map((point, index) => (
          <circle
            key={`${point.item.label}-${index}`}
            cx={point.x}
            cy={point.y}
            r={active === index ? "6" : "4"}
            fill="#f6c445"
            stroke="#071d3a"
            strokeWidth="2"
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
          />
        ))}
      </svg>
      {active !== null && points[active] ? (
        <div className="absolute right-3 top-3 rounded-2xl bg-[#071d3a] px-3 py-2 text-xs font-black text-white shadow-xl">
          {points[active].item.label}: {points[active].item.value}
        </div>
      ) : null}
    </div>
  );
}

function Donut({ data }: { data: ChartPoint[] }) {
  const [active, setActive] = useState<string | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const colors = ["#071d3a", "#0f5f3a", "#f6c445", "#94a3b8", "#c62828"];
  const circumference = 263.89;
  const segments = data.map((item, index) => {
    const previous = data.slice(0, index).reduce((sum, point) => sum + (point.value / total) * circumference, 0);
    return {
      ...item,
      dash: (item.value / total) * circumference,
      offset: previous,
    };
  });

  return (
    <div className="mt-5 grid gap-5 md:grid-cols-[140px_1fr] md:items-center">
      <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
        <circle cx="60" cy="60" r="42" fill="none" stroke="#eef2f7" strokeWidth="16" />
        {segments.map((item, index) => (
          <circle
            key={`donut-segment-${item.label}-${index}`}
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke={colors[index % colors.length]}
            strokeWidth={active === item.label ? "18" : "16"}
            strokeDasharray={`${item.dash} ${circumference}`}
            strokeDashoffset={-item.offset}
            strokeLinecap="round"
            className="transition-all duration-300"
            onMouseEnter={() => setActive(item.label)}
            onMouseLeave={() => setActive(null)}
          />
        ))}
      </svg>
      <div className="space-y-2">
        {data.slice(0, 5).map((item, index) => (
          <button
            type="button"
            key={`donut-legend-${item.label}-${index}`}
            onFocus={() => setActive(item.label)}
            onBlur={() => setActive(null)}
            onMouseEnter={() => setActive(item.label)}
            onMouseLeave={() => setActive(null)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1 text-sm font-bold transition ${active === item.label ? "bg-slate-50" : ""}`}
          >
            <span className="flex min-w-0 items-center gap-2 text-slate-600">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="font-black text-[#071d3a]">{Math.round((item.value / total) * 100)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
