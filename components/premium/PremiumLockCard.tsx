"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

type PremiumLockCardProps = {
  title: string;
  body: string;
  cta: string;
};

export function PremiumLockCard({ title, body, cta }: PremiumLockCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-[#f6c445]/50 bg-[#fff7df] p-5 shadow-xl shadow-[#f6c445]/10">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071d3a] text-[#f6c445]">
          <Lock size={20} />
        </span>
        <div>
          <p className="flex items-center gap-2 text-lg font-black text-[#071d3a]">
            <Sparkles size={18} />
            {title}
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{body}</p>
          <Link href="/premium" className="ds-button-premium mt-4">
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
