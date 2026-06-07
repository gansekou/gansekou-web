import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] p-5 md:p-8">
      <section className="mx-auto grid max-w-6xl gap-5">
        <div className="premium-surface rounded-[2rem] p-7">
          <div className="h-4 w-44 rounded-full bg-white/20" />
          <div className="mt-5 h-10 w-3/4 rounded-2xl bg-white/20" />
          <div className="mt-4 h-4 w-2/3 rounded-full bg-white/15" />
        </div>
        <section className="grid gap-4 md:grid-cols-4">
          <PremiumSkeleton rows={4} />
        </section>
      </section>
    </main>
  );
}
