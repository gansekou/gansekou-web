"use client";

import { Flame } from "lucide-react";

export function StreakCard({ days, best, title, detail }: { days: number; best: number; title: string; detail: string }) {
  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-[#071d3a]/5">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7df] text-[#b88a00]">
          <Flame size={28} />
        </span>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <h3 className="text-3xl font-black text-[#071d3a]">{days}</h3>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold leading-6 text-slate-500">{detail.replace("{best}", String(best))}</p>
    </section>
  );
}
