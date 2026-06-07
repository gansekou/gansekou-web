import { GansekouLogo } from "@/components/ui/GansekouLogo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f8faf5]">
      <div className="absolute inset-0 gansekou-pattern opacity-50" />

      <section className="relative mx-auto grid min-h-screen max-w-7xl px-6 py-8 lg:grid-cols-2">
        <div className="hidden flex-col justify-between rounded-[2rem] bg-[#082f1f] p-10 text-white shadow-2xl shadow-[#082f1f]/20 lg:flex">
          <GansekouLogo href="/" variant="light" size="large" />

          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">
              Gansekou Web
            </p>
            <h1 className="max-w-xl text-5xl font-black leading-tight">
              Une nouvelle manière d’apprendre au Cameroun.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">
              Cours, quiz, IA éducative, enseignants, progression et premium
              dans une plateforme moderne.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {["IA", "Quiz", "Cours"].map((item, index) => (
              <div key={`auth-feature-${item}-${index}`} className="rounded-3xl bg-white/10 p-5">
                <p className="text-2xl font-black">{item}</p>
                <p className="mt-1 text-sm text-white/60">Inclus</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="glass-card w-full max-w-md rounded-[2rem] p-8">
            <div className="mb-8 lg:hidden">
              <GansekouLogo href="/" variant="full" size="large" />
            </div>

            <h2 className="text-3xl font-black text-[#082f1f]">{title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
