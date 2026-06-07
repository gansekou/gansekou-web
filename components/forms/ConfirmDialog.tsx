"use client";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#082f1f]/40 p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-[#082f1f]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full bg-slate-100 px-5 py-3 font-black text-[#082f1f]">
            Annuler
          </button>
          <button type="button" onClick={onConfirm} className="rounded-full bg-red-600 px-5 py-3 font-black text-white">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
