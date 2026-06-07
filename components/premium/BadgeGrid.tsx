"use client";

import { Award, Lock } from "lucide-react";

type BadgeItem = {
  id?: string;
  badge_id?: string;
  code?: string;
  name_fr?: string;
  name_en?: string;
  required_points?: number;
  badge?: {
    name_fr?: string;
    name_en?: string;
    required_points?: number;
  };
};

export function BadgeGrid({
  badges,
  language,
  title,
  lockedLabel,
}: {
  badges: BadgeItem[];
  language: string;
  title: string;
  lockedLabel: string;
}) {
  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-[#071d3a]/5">
      <h3 className="text-xl font-black text-[#071d3a]">{title}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {badges.map((item, index) => {
          const badge = item.badge || item;
          const name = language === "EN" ? badge.name_en : badge.name_fr;
          const locked = !item.badge && Boolean(item.required_points);
          return (
            <div key={item.id || item.badge_id || item.code || index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${locked ? "bg-slate-200 text-slate-500" : "bg-[#fff7df] text-[#b88a00]"}`}>
                  {locked ? <Lock size={20} /> : <Award size={20} />}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-black text-[#071d3a]">{name || item.code || lockedLabel}</p>
                  <p className="text-xs font-bold text-slate-500">{locked ? lockedLabel : "Gansekou"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
