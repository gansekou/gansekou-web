"use client";

export function OnboardingProgress({ step }: { step: number }) {
  return (
    <div className="grid grid-cols-3 gap-2" aria-hidden="true">
      {[1, 2, 3].map((item, index) => (
        <span
          key={`onboarding-progress-${item}-${index}`}
          className={`h-2 rounded-full ${item <= step ? "bg-[#0f5f3a]" : "bg-slate-200"}`}
        />
      ))}
    </div>
  );
}
