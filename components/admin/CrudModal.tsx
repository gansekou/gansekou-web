"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/hooks/useI18n";
import type { User } from "@/types/user";

type CrudModalProps = {
  title: string;
  children: ReactNode;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
  user?: User;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
};

export function CrudModal({
  title,
  children,
  submitLabel,
  loading = false,
  error,
  user,
  onClose,
  onSubmit,
}: CrudModalProps) {
  const { t } = useI18n(user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071d3a]/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[1.75rem] bg-white shadow-2xl shadow-[#071d3a]/25">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#b88a00]">
              Gansekou Admin
            </p>
            <h3 className="mt-1 text-2xl font-black text-[#071d3a]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex size-10 items-center justify-center rounded-full bg-slate-100 text-[#071d3a] transition hover:bg-slate-200 disabled:opacity-50"
            aria-label={t("action.cancel")}
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="grid gap-4">{children}</div>
          {error && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#071d3a] shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
          >
            {t("action.cancel")}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-full bg-[#0f5f3a] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0f5f3a]/20 transition hover:bg-[#0b4b2e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("common.loading") : submitLabel || t("action.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
