"use client";

import { Zap } from "lucide-react";

export function TeacherXpCard({ xp }: { xp: number }) {
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  const progress = xp % 100;

  return (
    <section className="ds-card rounded-[1.5rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#b88a00]">XP et progression</p>
          <h3 className="mt-2 text-3xl font-black text-[#071d3a]">{xp} XP</h3>
          <p className="mt-1 text-sm font-bold text-slate-500">Niveau enseignant {level}</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7df] text-[#b88a00]">
          <Zap size={26} />
        </span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#f6c445] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
