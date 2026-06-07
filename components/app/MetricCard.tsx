import type { ComponentType } from "react";

export function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="rounded-[2rem] border border-[#0f5f3a]/10 bg-white p-6 shadow-xl shadow-[#082f1f]/5">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f5f3a]/10 text-[#0f5f3a]">
        <Icon size={24} />
      </div>
      <p className="text-3xl font-black text-[#082f1f]">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}
