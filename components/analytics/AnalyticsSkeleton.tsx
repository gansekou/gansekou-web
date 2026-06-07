"use client";

export function AnalyticsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: cards }, (_, index) => (
        <div key={`analytics-skeleton-${cards}-${index}`} className="ds-card rounded-[1.5rem] p-5">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="mt-5 flex items-end justify-between">
            <div className="skeleton h-9 w-20 rounded-xl" />
            <div className="skeleton h-7 w-14 rounded-full" />
          </div>
          <div className="mt-5 grid gap-2">
            <div className="skeleton h-3 rounded-full" />
            <div className="skeleton h-3 w-2/3 rounded-full" />
          </div>
        </div>
      ))}
    </section>
  );
}
