"use client";

export function XPProgressBar({
  xp,
  level,
  label,
}: {
  xp: number;
  level: string;
  label: string;
}) {
  const progress = xp % 500;
  const percent = Math.min(100, (progress / 500) * 100);

  return (
    <section className="rounded-[1.5rem] bg-[#071d3a] p-6 text-white shadow-2xl shadow-[#071d3a]/20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f6c445]">{label}</p>
          <h3 className="mt-2 text-4xl font-black">{xp.toLocaleString()} XP</h3>
          <p className="mt-1 text-sm font-bold text-white/65">{level}</p>
        </div>
        <span className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-black">{Math.round(percent)}%</span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#f6c445] to-white transition-all duration-700" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
