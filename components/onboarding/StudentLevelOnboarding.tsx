"use client";

import Link from "next/link";

export function StudentLevelOnboarding({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-6 py-10">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#0f5f3a]/10">
            <span className="text-4xl">🎓</span>
          </div>

          <h1 className="text-3xl font-black text-[#071d3a]">
            Bienvenue sur Gansekou
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Avant d'accéder à votre espace de travail, vous devez renseigner
            votre niveau d'étude.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6">
          <h2 className="font-black text-[#071d3a]">
            Pourquoi cette information est-elle nécessaire ?
          </h2>

          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <li>✅ Afficher uniquement les cours correspondant à votre programme.</li>
            <li>✅ Proposer des exercices et des évaluations adaptés.</li>
            <li>✅ Générer des recommandations pertinentes avec Kouma IA.</li>
            <li>✅ Suivre correctement votre progression scolaire.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/settings"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0f5f3a] px-8 py-3 text-base font-bold text-white transition hover:bg-[#0b4b2d]"
          >
            Renseigner mon niveau d'étude
          </Link>

          <p className="text-center text-sm text-slate-500">
            Vous pourrez modifier cette information ultérieurement depuis les
            paramètres de votre profil.
          </p>
        </div>

        {children && (
          <div className="mt-8 border-t border-slate-200 pt-8">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
