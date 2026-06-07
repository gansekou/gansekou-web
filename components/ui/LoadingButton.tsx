"use client";

import { forwardRef } from "react";
import { Check, Loader2 } from "lucide-react";

type LoadingButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type LoadingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  success?: boolean;
  loadingLabel?: string;
  variant?: LoadingButtonVariant;
  children: React.ReactNode;
};

const variants: Record<LoadingButtonVariant, string> = {
  primary: "bg-[#0f5f3a] text-white shadow-[0_14px_34px_rgba(15,95,58,0.18)] hover:bg-[#082f1f]",
  secondary: "border border-slate-200 bg-white text-[#071d3a] shadow-sm hover:bg-slate-50",
  danger: "bg-red-600 text-white shadow-[0_14px_34px_rgba(220,38,38,0.18)] hover:bg-red-700",
  ghost: "bg-transparent text-[#071d3a] hover:bg-slate-100",
};

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loading = false,
      success = false,
      loadingLabel,
      variant = "primary",
      disabled,
      className = "",
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        className={[
          "premium-action inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black transition",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {success && !loading ? <Check size={18} /> : null}
        <span>{loading && loadingLabel ? loadingLabel : children}</span>
      </button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
