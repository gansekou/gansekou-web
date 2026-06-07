import Link from "next/link";

export function HeroPanel({ eyebrow, title, body, actionHref, actionLabel }: { eyebrow: string; title: string; body: string; actionHref?: string; actionLabel?: string }) {
  return (
    <section className="premium-surface rounded-[2rem] p-7 text-white">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-black md:text-5xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-white/75">{body}</p>
      {actionHref && actionLabel ? <Link href={actionHref} className="ds-button-premium mt-5 inline-flex">{actionLabel}</Link> : null}
    </section>
  );
}

export function ActionCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="ds-card ds-card-hover rounded-[2rem] p-6">
      <p className="text-xl font-black text-[#071d3a]">{title}</p>
      <p className="mt-2 text-sm font-bold text-slate-500">{body}</p>
    </Link>
  );
}

