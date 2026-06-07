"use client";

import { Paperclip } from "lucide-react";

export function TeacherProofUpload({
  file,
  label,
  notice,
  onChange,
}: {
  file: File | null;
  label: string;
  notice: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <span className="flex items-center gap-2 font-black text-[#071d3a]">
        <Paperclip size={18} />
        {file?.name || label}
      </span>
      <span className="mt-2 block text-sm font-bold leading-6 text-slate-500">{notice}</span>
      <input
        className="hidden"
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
    </label>
  );
}
