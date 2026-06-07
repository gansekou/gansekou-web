"use client";

import { useId } from "react";

export function ProgressRing({ label, value, size = 136 }: { label: string; value: number; size?: number }) {
  const gradientId = useId().replace(/:/g, "");
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" viewBox="0 0 120 120">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#071d3a" />
              <stop offset="55%" stopColor="#0f5f3a" />
              <stop offset="100%" stopColor="#f6c445" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (normalized / 100) * circumference}
            className="analytics-ring transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-[#071d3a]">{normalized}%</span>
      </div>
      <p className="mt-2 text-center text-sm font-black text-slate-600">{label}</p>
    </div>
  );
}
