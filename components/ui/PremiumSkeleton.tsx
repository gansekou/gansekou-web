"use client";

export function PremiumSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={`premium-skeleton-${rows}-${index}`} className="skeleton h-16 rounded-2xl" />
      ))}
    </div>
  );
}
