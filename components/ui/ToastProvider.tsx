"use client";

import { CheckCircle2, Info, Sparkles, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ToastKind = "success" | "error" | "info" | "reward";

export type GansekouToast = {
  id?: string;
  title: string;
  message?: string;
  kind?: ToastKind;
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  reward: Sparkles,
};

const tones = {
  success: "border-[#0f5f3a]/20 bg-[#eef8f2] text-[#0f5f3a]",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-[#071d3a]/15 bg-white text-[#071d3a]",
  reward: "border-[#f6c445]/50 bg-[#fff7df] text-[#071d3a]",
};

export function notifyGansekou(toast: GansekouToast) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("gansekou-toast", { detail: toast }));
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Array<GansekouToast & { id: string }>>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<GansekouToast>).detail;
      const id = detail.id || `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current.slice(-3), { ...detail, id }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, detail.kind === "reward" ? 5200 : 3800);
    };
    window.addEventListener("gansekou-toast", onToast);
    return () => window.removeEventListener("gansekou-toast", onToast);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-[80] grid w-[calc(100%-2rem)] max-w-sm gap-3" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const kind = toast.kind || "info";
        const Icon = icons[kind];
        return (
          <section key={toast.id} className={`premium-toast rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${tones[kind]}`}>
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                <Icon size={19} />
              </span>
              <div>
                <p className="font-black">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-sm font-bold opacity-70">{toast.message}</p> : null}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
