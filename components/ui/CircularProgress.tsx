"use client";

type CircularProgressProps = {
  value: number;
  label: string;
  detail?: string;
  size?: number;
};

export function CircularProgress({ value, label, detail, size = 148 }: CircularProgressProps) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg className="-rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#f6c445"
            strokeLinecap="round"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-[#071d3a]">{normalized}%</span>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">XP</span>
        </div>
      </div>
      <div>
        <p className="text-lg font-black text-[#071d3a]">{label}</p>
        {detail ? <p className="mt-1 text-sm font-bold leading-6 text-slate-500">{detail}</p> : null}
      </div>
    </div>
  );
}
