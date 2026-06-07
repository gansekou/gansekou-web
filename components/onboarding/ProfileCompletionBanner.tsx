"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function ProfileCompletionBanner({
  title,
  href,
  action,
}: {
  title: string;
  href: string;
  action: string;
}) {
  return (
    <section className="ds-card flex flex-col justify-between gap-4 rounded-[2rem] border-[#f6c445]/60 bg-[#fff8db] p-5 md:flex-row md:items-center">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 shrink-0 text-[#b88a00]" />
        <p className="max-w-3xl font-bold leading-7 text-[#071d3a]">{title}</p>
      </div>
      <Link href={href} className="ds-button-premium shrink-0">
        {action}
      </Link>
    </section>
  );
}
