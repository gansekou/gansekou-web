import { Crown } from "lucide-react";

export function PremiumBadge() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border border-[#f6c445]/50 bg-[#fff7df] p-2 text-[#082f1f] shadow-sm"
      title="Premium"
      aria-label="Premium"
    >
      <Crown size={16} className="text-[#c99716]" />
    </span>
  );
}
