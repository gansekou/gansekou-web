import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { GansekouLogo } from "@/components/ui/GansekouLogo";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: LucideIcon;
};

export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#0f5f3a]/20 bg-white/75 p-8 text-center shadow-lg shadow-[#082f1f]/5">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8faf5] ring-1 ring-[#0f5f3a]/10">
        {Icon ? <Icon className="text-[#0f5f3a]" size={28} /> : <GansekouLogo variant="icon" size="medium" />}
      </div>
      <p className="mt-5 text-xl font-black text-[#082f1f]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-6 text-slate-500">
        {message}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-full bg-[#0f5f3a] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0f5f3a]/20"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
