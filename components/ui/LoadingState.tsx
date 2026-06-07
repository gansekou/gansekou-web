import { GansekouLogo } from "@/components/ui/GansekouLogo";

export function LoadingState({
  label = "Chargement...",
  logo = true,
}: {
  label?: string;
  logo?: boolean;
}) {
  return (
    <div className="grid min-h-[45vh] place-items-center">
      <div className="glass-card w-full max-w-sm rounded-[2rem] p-8 text-center">
        {logo && (
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white shadow-xl shadow-[#082f1f]/10">
            <div className="animate-pulse">
              <GansekouLogo variant="icon" size="large" />
            </div>
          </div>
        )}
        <p className="font-black text-[#082f1f]">{label}</p>
        <div className="mt-5 grid gap-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-[#0f5f3a]/10" />
          <div className="mx-auto h-3 w-2/3 animate-pulse rounded-full bg-[#f6c445]/30" />
        </div>
      </div>
    </div>
  );
}
