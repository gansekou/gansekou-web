import { Crown } from "lucide-react";

export function PremiumBadge({ label = "Premium" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#f6c445]/50 bg-[#fff7df] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#082f1f] shadow-sm">
      <Crown size={14} className="text-[#c99716]" />
      {label}
    </span>
  );
}
