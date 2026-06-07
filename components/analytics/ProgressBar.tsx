"use client";

export function ProgressBar({ label, value, detail }: { label: string; value: number; detail?: string }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm font-black">
        <span className="text-[#071d3a]">{label}</span>
        <span className="text-slate-500">{normalized}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="analytics-progress h-full rounded-full bg-gradient-to-r from-[#071d3a] via-[#0f5f3a] to-[#f6c445] transition-all duration-700" style={{ width: `${normalized}%` }} />
      </div>
      {detail ? <p className="mt-2 text-xs font-bold text-slate-500">{detail}</p> : null}
    </div>
  );
}
