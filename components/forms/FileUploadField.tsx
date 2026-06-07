"use client";

import { Paperclip } from "lucide-react";

export function FileUploadField({
  label,
  file,
  onChange,
  accept,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-500">
      <Paperclip size={18} />
      {file?.name || label}
      <input className="hidden" type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0] || null)} />
    </label>
  );
}
