"use client";

import type { Level } from "@/types/education";
import type { Language } from "@/types/i18n";

export function StudentLevelStep({
  levels,
  language,
  value,
  label,
  onChange,
}: {
  levels: Level[];
  language: Language;
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-black text-[#071d3a]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-[#0f5f3a]"
        required
      >
        <option value="">{label}</option>
        {levels.map((level) => (
          <option key={level.id} value={level.id}>
            {language === "EN" ? level.name_en : level.name_fr}
          </option>
        ))}
      </select>
    </label>
  );
}
