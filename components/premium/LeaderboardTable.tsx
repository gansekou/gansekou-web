"use client";

import { Trophy } from "lucide-react";

export type LeaderboardRow = {
  user_id: string;
  name: string;
  role: string;
  points: number;
  level_label?: string;
};

export function LeaderboardTable({ title, rows, emptyLabel }: { title: string; rows: LeaderboardRow[]; emptyLabel: string }) {
  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-[#071d3a]/5">
      <h3 className="flex items-center gap-2 text-xl font-black text-[#071d3a]"><Trophy size={20} />{title}</h3>
      <div className="mt-5 grid gap-2">
        {rows.map((row, index) => (
          <div key={`leaderboard-${index}-${row.user_id}`} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl font-black ${index < 3 ? "bg-[#f6c445] text-[#071d3a]" : "bg-white text-slate-500"}`}>
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate font-black text-[#071d3a]">{row.name}</p>
              <p className="truncate text-sm font-bold text-slate-500">{row.level_label || row.role}</p>
            </div>
            <p className="font-black text-[#0f5f3a]">{row.points.toLocaleString()} XP</p>
          </div>
        ))}
      </div>
      {!rows.length && <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">{emptyLabel}</p>}
    </section>
  );
}
