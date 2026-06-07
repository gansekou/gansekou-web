"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Download,
  HelpCircle,
  Quote,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { GansekouLogo } from "@/components/ui/GansekouLogo";
import { LoadingState } from "@/components/ui/LoadingState";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useI18n } from "@/hooks/useI18n";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/platform";

const benefits = [
  { title: "IA pedagogique", icon: Brain },
  { title: "Quiz intelligents", icon: Trophy },
  { title: "Enseignants", icon: Users },
  { title: "Offline", icon: Download },
];

const subjects = ["Mathematiques", "Physique", "Anglais", "SVT", "Histoire", "Francais"];
const testimonials = [
  "Gansekou m'aide a reviser vite et a comprendre mes erreurs.",
  "Les quiz donnent enfin un vrai rythme de progression aux eleves.",
  "Une experience claire pour suivre cours, questions et enseignants.",
];

type PremiumPlanId = "DECOUVERTE" | "EXCELLENCE" | "EXCELLENCE_PLUS";

type PremiumPlanCard = {
  id: PremiumPlanId;
  sourcePlan?: SubscriptionPlan;
  name: string;
  shortName: string;
  price_xaf: number;
  oldPrice?: number;
  priceSuffix?: string;
  duration_days?: number;
  description: string;
  features: Array<{ label: string; included: boolean }>;
  isAuthenticated: boolean;
  isCurrentPlan: boolean;
  isIncluded: boolean;
  ctaLabel: string;
  ctaHref: string;
  ctaDisabled: boolean;
  badge?: string;
};

export function SmartHomePage() {
  const { user, loading } = useCurrentUser();
  const { language } = useI18n(user || undefined);
  const copy = publicCopy(language);
  const enabledLoader = useMemo(
    () => async () => {
      if (!user) return { contents: [], plans: await platformService.payments.plans().catch(() => []) };
      const [contents, notifications, subscription] = await Promise.all([
        platformService.contents.featured().catch(() => []),
        platformService.notifications.mine().catch(() => []),
        platformService.payments.subscription().catch(() => null),
      ]);
      return { contents, notifications, subscription };
    },
    [user]
  );
  const { data } = useAsyncData(enabledLoader);

  if (!loading && user) {
    const contents = (data?.contents as Content[]) || [];
    const notifications = (data?.notifications as { id: string; title: string; message: string }[]) || [];
    return (
      <main className="premium-page min-h-screen">
        <PublicNav userName={`${user.prenom} ${user.nom}`} />
        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-12">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#071d3a] p-7 text-white shadow-2xl shadow-[#071d3a]/20 md:p-10">
            <div className="absolute right-8 top-8 hidden h-32 w-32 rounded-full border border-[#f6c445]/25 md:block" />
            <GansekouLogo variant="light" size="large" />
            <p className="mt-8 text-sm font-black uppercase tracking-[0.22em] text-[#f6c445]">{copy.resumeEyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              {copy.connectedTitle.replace("{name}", user.prenom)}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
              {copy.connectedBody}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="ds-button-premium">
                {copy.openSpace}
                <ArrowRight size={18} />
              </Link>
              <Link href="/courses" className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-3 font-black text-white transition hover:bg-white/15">
                {copy.resumeCourse}
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[["Streak", "7 jours"], ["Progression", "68%"], ["Quiz", "12"]].map(([label, value], index) => (
                <div key={`connected-stat-${label}-${index}`} className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-black text-[#f6c445]">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-5">
            <div className="ds-card rounded-[2rem] p-6">
              <h2 className="text-2xl font-black text-[#071d3a]">{copy.quickRecommendations}</h2>
              <div className="mt-5 space-y-3">
                {contents.slice(0, 4).map((item) => (
                  <Link key={`home-course-${item.id}`} href={`/courses/${item.id}`} className="ds-card-hover block rounded-2xl bg-slate-50 p-4 font-bold text-[#071d3a]">
                    {item.title || `Ressource ${item.id.slice(0, 8)}`}
                  </Link>
                ))}
                {!contents.length && (
                  <EmptyState title={copy.noRecommendations} message={copy.noRecommendationsBody} />
                )}
              </div>
            </div>
            <div className="ds-card rounded-[2rem] p-6">
              <h2 className="text-xl font-black text-[#071d3a]">{copy.latestNotifications}</h2>
              <div className="mt-4 space-y-3">
                {notifications.slice(0, 3).map((item) => (
                  <Link href="/notifications" key={`home-notification-${item.id}`} className="block rounded-2xl border border-slate-100 p-4">
                    <p className="font-black text-[#071d3a]">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.message}</p>
                  </Link>
                ))}
                {!notifications.length && <p className="text-sm font-bold text-slate-500">{copy.noUrgentAlert}</p>}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page min-h-screen overflow-hidden">
      <PublicNav />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:py-14">
        <div>
          <GansekouLogo variant="full" size="hero" />
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#f6c445]/50 bg-white/80 px-4 py-2 text-sm font-black text-[#071d3a] shadow-sm">
            <Sparkles size={16} className="text-[#f6c445]" />
            {copy.publicEyebrow}
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] text-[#071d3a] md:text-7xl">
            {copy.publicTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {copy.publicBody}
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="/register" className="ds-button-primary">
              {copy.startFree}
              <ArrowRight size={20} />
            </Link>
            <Link href="/premium" className="ds-button-premium">
              {copy.discoverPremium}
              <Star size={18} />
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] bg-[#071d3a] p-6 text-white shadow-2xl shadow-[#071d3a]/20">
          <div className="mb-5 flex items-center justify-between">
            <GansekouLogo variant="light" size="medium" />
            <PremiumBadge label={copy.premiumBadge} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={`benefit-${item.title}-${index}`} className="ds-card-hover rounded-3xl bg-white/10 p-5">
                  <Icon className="text-[#f6c445]" />
                  <p className="mt-4 text-xl font-black">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{copy.benefitBody}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-3xl bg-[#f6c445] p-5 text-[#071d3a]">
            <p className="font-black">Gansekou Premium</p>
            <p className="mt-2 text-sm font-bold">{copy.premiumShort}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 md:grid-cols-4">
        {[["25k+", "apprenants vises"], ["120+", "ressources"], ["24/7", "IA educative"], ["CM", "ancrage local"]].map(([value, label], index) => (
          <div key={`public-stat-${label}-${index}`} className="ds-card rounded-3xl p-6">
            <p className="text-3xl font-black text-[#071d3a]">{value}</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <SectionTitle eyebrow={copy.catalog} title={copy.catalogTitle} />
        <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {subjects.map((subject, index) => (
            <Link href="/subjects" key={`subject-card-${subject}-${index}`} className="ds-card ds-card-hover rounded-3xl p-5 font-black text-[#071d3a]">
              <BookOpen className="mb-4 text-[#f6c445]" />
              {subject}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 lg:grid-cols-3">
        {[["1", "Pose une question ou choisis un parcours."], ["2", "IA et quiz identifient tes priorites."], ["3", "Tu progresses avec objectifs, rappels et corrections."]].map(([step, text], index) => (
          <div key={`flow-step-${step}-${index}`} className="ds-card rounded-3xl p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6c445] font-black text-[#071d3a]">{step}</span>
            <p className="mt-5 text-lg font-black text-[#071d3a]">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <SectionTitle eyebrow={copy.trust} title={copy.trustTitle} />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {testimonials.map((quote, index) => (
            <div key={`testimonial-${index}-${quote.slice(0, 16)}`} className="ds-card rounded-3xl p-6">
              <Quote className="text-[#f6c445]" />
              <p className="mt-5 leading-7 text-slate-600">{quote}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 pb-16">
        <SectionTitle eyebrow="FAQ" title={copy.faqTitle} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {["Gansekou fonctionne-t-il avec un compte gratuit ?", "Premium debloque quoi ?", "Les contenus sont-ils disponibles hors ligne ?", "IA remplace-t-elle les enseignants ?"].map((question, index) => (
            <div key={`faq-${index}-${question.slice(0, 16)}`} className="ds-card rounded-3xl p-5">
              <HelpCircle className="text-[#f6c445]" />
              <p className="mt-3 font-black text-[#071d3a]">{question}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{copy.faqAnswer}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function PublicCoursesPage() {
  const { user } = useCurrentUser();
  const coursesLoader = useMemo(() => async () => {
    if (!user) return [] as Content[];
    return platformService.contents.approved();
  }, [user]);
  const { data, loading } = useAsyncData(coursesLoader);

  return (
    <main className="premium-page min-h-screen">
      <PublicNav userName={user ? `${user.prenom} ${user.nom}` : undefined} />
      <section className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="text-5xl font-black text-[#071d3a]">Parcours de cours Gansekou</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          Catalogue intelligent avec filtres premium, progression et ressources adaptees a votre profil.
        </p>
        {loading ? (
          <LoadingState label="Chargement des cours Gansekou..." />
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {((data || []) as Content[]).map((item) => (
              <Link key={`public-course-${item.id}`} href={`/courses/${item.id}`} className="ds-card ds-card-hover rounded-[2rem] p-6">
                <BookOpen className="text-[#f6c445]" />
                <p className="mt-5 font-black text-[#071d3a]">{item.title || item.content_type}</p>
              </Link>
            ))}
            {(!data || !data.length) && ["Mathematiques", "Physique", "Francais"].map((item, index) => (
              <div key={`course-fallback-${item}-${index}`} className="ds-card rounded-[2rem] p-6">
                <BookOpen className="text-[#f6c445]" />
                <p className="mt-5 font-black text-[#071d3a]">{item}</p>
                <p className="mt-2 text-sm text-slate-500">Apercu gratuit</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export function PublicPremiumPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { language } = useI18n(user || undefined);
  const copy = premiumPageCopy(language);
  const [paymentPlan, setPaymentPlan] = useState<PremiumPlanCard | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"MTN" | "ORANGE">("MTN");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [paymentMessage, setPaymentMessage] = useState("");
  const premiumLoader = useMemo(
    () => async () => {
      const plans = await platformService.payments.plans().catch(() => []);
      if (!user) return { plans, subscription: null };
      const subscription = await platformService.payments.subscription().catch(() => null);
      return { plans, subscription };
    },
    [user]
  );
  const { data } = useAsyncData(premiumLoader);
  const currentPlan = getCurrentPremiumPlan(data?.subscription || null);
  const cards = buildPremiumPlanCards({
    plans: data?.plans || [],
    currentPlan,
    isAuthenticated: Boolean(user),
    copy,
  });
  const subscription = data?.subscription?.subscription || null;
  const comparisonRows = premiumComparisonRows(copy);
  const reassuranceItems = [
    { title: copy.reassuranceLearnTitle, body: copy.reassuranceLearnBody, icon: Download },
    { title: copy.reassuranceTimeTitle, body: copy.reassuranceTimeBody, icon: Sparkles },
    { title: copy.reassuranceExamTitle, body: copy.reassuranceExamBody, icon: Trophy },
  ];
  const paymentTrustItems = [
    copy.paymentSecure,
    copy.paymentImmediate,
    copy.paymentMtn,
    copy.paymentOrange,
    copy.paymentNoCommitment,
    copy.paymentSimpleRenewal,
  ];

  async function submitPayment() {
    if (!paymentPlan?.sourcePlan) return;
    setPaymentStatus("loading");
    setPaymentMessage("");

    try {
      await platformService.payments.init({
        plan_id: paymentPlan.sourcePlan.id,
        phone_number: phoneNumber,
        payment_method: paymentMethod,
      });
      setPaymentStatus("success");
      setPaymentMessage(copy.paymentInitiated);
    } catch (error) {
      console.error("[premium] payment init failed", error);
      setPaymentStatus("error");
      setPaymentMessage(copy.paymentFailed);
    }
  }

  return (
    <main className="premium-page min-h-screen bg-[#f8fafc] text-[#071d3a]">
      <PublicNav userName={user ? `${user.prenom} ${user.nom}` : undefined} />
      <section className="relative overflow-hidden bg-[#071d3a]">
        <div className="absolute inset-x-0 top-0 h-32 bg-[#f6c445]/10" />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 text-white lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="relative">
            <GansekouLogo variant="light" size="large" />
            <p className="mt-8 text-sm font-black uppercase tracking-[0.22em] text-[#f6c445]">{copy.heroEyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">{copy.heroTitle}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">{copy.heroSubtitle}</p>
            <p className="mt-4 max-w-2xl leading-7 text-white/62">{copy.heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" className="ds-button-premium">{copy.heroPrimaryCta}</a>
              <a href="#comparison" className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 font-black text-white transition hover:bg-white/10">
                {copy.heroSecondaryCta}
              </a>
            </div>
          </div>
          <div className="relative rounded-[2rem] border border-white/12 bg-white/8 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f6c445]">{copy.heroCardEyebrow}</p>
            <div className="mt-5 grid gap-3">
              {[copy.heroWinCourses, copy.heroWinOffline, copy.heroWinPremium, copy.heroWinProgress].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                  <CheckCircle2 size={20} className="shrink-0 text-[#f6c445]" />
                  <span className="font-bold text-white/88">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        {!userLoading && user ? (
          <div className="rounded-[1.5rem] border border-[#f6c445]/50 bg-white p-5 shadow-xl shadow-[#071d3a]/5 md:flex md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#b88a00]">{copy.currentSubscription}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black">{planDisplayName(currentPlan, language)}</h2>
                {currentPlan !== "DECOUVERTE" ? (
                  <span className="rounded-full bg-[#f6c445] px-3 py-1 text-xs font-black">{copy.currentPlan}</span>
                ) : null}
              </div>
              <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600 sm:grid-cols-3">
                <span>{copy.status}: {subscription?.status || copy.freeStatus}</span>
                <span>{copy.expiresAt}: {formatPremiumDate(subscription?.expires_at, language)}</span>
                <span>{copy.renewsAt}: {subscription?.auto_renew ? formatPremiumDate(subscription.expires_at, language) : copy.noRenewal}</span>
              </div>
              {currentPlan !== "DECOUVERTE" ? (
                <p className="mt-3 text-sm font-black text-[#071d3a]">{copy.nextDue}: {formatPremiumDate(subscription?.expires_at, language)}</p>
              ) : null}
            </div>
            <Link href="/subscription" className="mt-5 inline-flex rounded-full bg-[#071d3a] px-5 py-3 font-black text-white md:mt-0">
              {copy.manageSubscription}
            </Link>
          </div>
        ) : null}

        <div id="plans" className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-center">
          {cards.map((plan, index) => (
            <div
              key={`premium-plan-${plan.id}-${plan.sourcePlan?.id || "static"}-${index}`}
              className={`relative overflow-hidden rounded-[1.5rem] border bg-white p-6 shadow-xl shadow-[#071d3a]/6 ${plan.id === "EXCELLENCE" ? "border-[#f6c445] p-7 shadow-2xl shadow-[#f6c445]/20 lg:scale-[1.04]" : "border-slate-200"} ${plan.isCurrentPlan ? "bg-[#fffdf5]" : ""}`}
            >
              <div className="flex min-h-8 items-center justify-between gap-3">
                {plan.badge ? <span className="rounded-full bg-[#f6c445] px-3 py-1 text-xs font-black">{plan.badge}</span> : <span />}
                {plan.isCurrentPlan ? <span className="rounded-full bg-[#071d3a] px-3 py-1 text-xs font-black text-white">{copy.currentPlan}</span> : null}
              </div>
              <h2 className="mt-5 text-2xl font-black">{plan.name}</h2>
              {plan.oldPrice ? <p className="mt-4 text-lg font-black text-slate-400 line-through">{formatFcfa(plan.oldPrice)}</p> : null}
              <p className="mt-2 text-4xl font-black">{formatPrice(plan, copy)}</p>
              <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
              <PlanCta plan={plan} copy={copy} onPremiumClick={() => setPaymentPlan(plan)} />
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={`${plan.id}-${feature.label}`} className="flex gap-3 text-sm">
                    <span className={feature.included ? "font-black text-[#0f5f3a]" : "font-black text-slate-300"}>
                      {feature.included ? "✓" : "✕"}
                    </span>
                    <span className={feature.included ? "font-bold text-slate-700" : "font-bold text-slate-400"}>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <section id="comparison" className="mt-16">
          <SectionTitle eyebrow={copy.comparisonEyebrow} title={copy.comparisonTitle} />
          <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-xl shadow-[#071d3a]/5">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 text-sm font-black text-slate-500">{copy.features}</th>
                  {cards.map((plan) => <th key={`head-${plan.id}`} className="p-4 text-sm font-black">{plan.shortName}</th>)}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
                    <td className="p-4 text-sm font-bold text-slate-600">{row.label}</td>
                    {row.values.map((value, valueIndex) => (
                      <td key={`${row.label}-${valueIndex}`} className={`p-4 text-lg font-black ${value ? "text-[#0f5f3a]" : "text-slate-300"}`}>
                        {value ? "✓" : "✕"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 rounded-[1.5rem] bg-[#071d3a] p-6 text-white shadow-2xl shadow-[#071d3a]/15 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f6c445]">{copy.paymentEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black">{copy.paymentTitle}</h2>
              <p className="mt-3 leading-7 text-white/70">{copy.paymentSubtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <PaymentLogo method="MTN" label={copy.mtnMobileMoney} />
                <PaymentLogo method="ORANGE" label={copy.orangeMoney} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentTrustItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm font-bold">
                  <CheckCircle2 size={18} className="shrink-0 text-[#f6c445]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <SectionTitle eyebrow={copy.whyEyebrow} title={copy.whyTitle} />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {reassuranceItems.map(({ title, body, icon: Icon }) => (
              <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-[#071d3a]/5">
                <Icon className="text-[#f6c445]" />
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionTitle eyebrow={copy.faqEyebrow} title={copy.faqTitle} />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {premiumFaq(copy).map((item) => (
              <details key={item.question} className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-lg shadow-[#071d3a]/4">
                <summary className="cursor-pointer text-base font-black">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </section>

      {paymentPlan ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071d3a]/70 p-4 backdrop-blur">
          <div className="w-full max-w-lg rounded-[1.5rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#b88a00]">{copy.paymentModalEyebrow}</p>
                <h2 className="mt-2 text-2xl font-black">{copy.paymentModalTitle}</h2>
                <p className="mt-2 text-sm font-bold text-slate-600">{paymentPlan.name} - {formatPrice(paymentPlan, copy)}</p>
              </div>
              <button type="button" className="rounded-full bg-slate-100 px-3 py-2 font-black" onClick={() => setPaymentPlan(null)}>×</button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(["MTN", "ORANGE"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-2xl border p-4 text-left transition ${paymentMethod === method ? "border-[#f6c445] bg-[#fff8db]" : "border-slate-200 bg-white"}`}
                >
                  <PaymentLogo method={method} label={method === "MTN" ? copy.mtnMobileMoney : copy.orangeMoney} />
                </button>
              ))}
            </div>
            <label className="mt-5 block text-sm font-black text-slate-700">
              {copy.phoneNumber}
              <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder={copy.phonePlaceholder}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-bold outline-none focus:border-[#f6c445]"
              />
            </label>
            {paymentMessage ? (
              <p className={`mt-4 rounded-2xl p-3 text-sm font-bold ${paymentStatus === "error" ? "bg-red-50 text-red-700" : "bg-[#eef8f1] text-[#0f5f3a]"}`}>
                {paymentMessage}
              </p>
            ) : null}
            <button
              type="button"
              disabled={!phoneNumber || paymentStatus === "loading"}
              onClick={() => void submitPayment()}
              className="ds-button-premium mt-5 w-full disabled:opacity-60"
            >
              {paymentStatus === "loading" ? copy.paymentLoading : copy.confirmPayment}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function PlanCta({
  plan,
  copy,
  onPremiumClick,
}: {
  plan: PremiumPlanCard;
  copy: ReturnType<typeof premiumPageCopy>;
  onPremiumClick: () => void;
}) {
  if (plan.ctaDisabled) {
    return (
      <button
        className="mt-6 w-full rounded-full bg-slate-100 px-5 py-3 font-black text-slate-500"
        type="button"
        disabled
      >
        {plan.ctaLabel}
      </button>
    );
  }

  if (plan.id !== "DECOUVERTE" && plan.isAuthenticated) {
    return (
      <button className="ds-button-premium mt-6 w-full" type="button" onClick={onPremiumClick} disabled={!plan.sourcePlan}>
        {plan.sourcePlan ? plan.ctaLabel : copy.planUnavailable}
      </button>
    );
  }

  return (
    <Link className="ds-button-premium mt-6 w-full" href={plan.ctaHref}>
      {plan.ctaLabel}
    </Link>
  );
}

function getCurrentPremiumPlan(subscriptionStatus: SubscriptionStatus | null): PremiumPlanId {
  const subscription = subscriptionStatus?.subscription;
  if (!subscriptionStatus?.is_premium || !subscription) return "DECOUVERTE";

  const status = typeof subscription.status === "string" ? subscription.status.toUpperCase() : null;
  if (status && status !== "ACTIVE") return "DECOUVERTE";

  const period = normalizeSubscriptionPeriod(subscription);
  if (period === "year") return "EXCELLENCE_PLUS";
  if (period === "month") return "EXCELLENCE";
  return "DECOUVERTE";
}

function normalizeSubscriptionPeriod(subscription: NonNullable<SubscriptionStatus["subscription"]>) {
  const rawPeriod = [
    subscription.period,
    subscription.plan_code,
    subscription.plan_name,
    subscription.plan?.code,
    subscription.plan?.name,
    subscription.plan?.period,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (rawPeriod.includes("year") || rawPeriod.includes("annual") || rawPeriod.includes("annuel")) {
    return "year";
  }
  if (rawPeriod.includes("month") || rawPeriod.includes("mensuel")) {
    return "month";
  }

  const duration = subscription.duration_days || subscription.plan?.duration_days;
  if (typeof duration === "number") {
    if (duration >= 330) return "year";
    if (duration >= 27 && duration <= 31) return "month";
  }

  return null;
}

function buildPremiumPlanCards({
  plans,
  currentPlan,
  isAuthenticated,
  copy,
}: {
  plans: SubscriptionPlan[];
  currentPlan: PremiumPlanId;
  isAuthenticated: boolean;
  copy: ReturnType<typeof premiumPageCopy>;
}): PremiumPlanCard[] {
  const activePlans = plans.filter((plan) => plan.is_active !== false);
  const monthlyPlan =
    activePlans.find((plan) => inferPlanPeriod(plan) === "month") || activePlans[0];
  const yearlyPlan =
    activePlans.find((plan) => inferPlanPeriod(plan) === "year") ||
    activePlans.find((plan) => plan.id !== monthlyPlan?.id) ||
    activePlans[activePlans.length - 1];

  const baseCards = [
    {
      id: "DECOUVERTE" as const,
      name: copy.discoveryName,
      shortName: copy.discoveryShort,
      price_xaf: 0,
      description: copy.discoveryDescription,
      features: planFeatures("DECOUVERTE", copy),
    },
    {
      id: "EXCELLENCE" as const,
      sourcePlan: monthlyPlan,
      name: copy.excellenceName,
      shortName: copy.excellenceShort,
      price_xaf: monthlyPlan?.price_xaf || 500,
      priceSuffix: copy.perMonth,
      duration_days: monthlyPlan?.duration_days || 30,
      description: copy.excellenceDescription,
      badge: copy.mostPopular,
      features: planFeatures("EXCELLENCE", copy),
    },
    {
      id: "EXCELLENCE_PLUS" as const,
      sourcePlan: yearlyPlan,
      name: copy.excellencePlusName,
      shortName: copy.excellencePlusShort,
      price_xaf: yearlyPlan?.price_xaf || 4500,
      oldPrice: 6000,
      priceSuffix: copy.perYear,
      duration_days: yearlyPlan?.duration_days || 365,
      description: copy.excellencePlusDescription,
      badge: copy.saveAnnual,
      features: planFeatures("EXCELLENCE_PLUS", copy),
    },
  ];

  return baseCards.map((plan) => {
    const isCurrentPlan = isAuthenticated && plan.id === currentPlan;
    const isIncluded =
      isAuthenticated &&
      !isCurrentPlan &&
      ((currentPlan === "EXCELLENCE" && plan.id === "DECOUVERTE") ||
        (currentPlan === "EXCELLENCE_PLUS" && plan.id !== "EXCELLENCE_PLUS"));
    return {
      ...plan,
      isAuthenticated,
      isCurrentPlan,
      isIncluded,
      ctaDisabled: isCurrentPlan || isIncluded,
      ctaLabel: ctaForPlan(plan.id, currentPlan, isAuthenticated, copy),
      ctaHref: hrefForPlan(plan.id, isAuthenticated),
      badge: isCurrentPlan ? copy.currentPlan : plan.badge,
    };
  });
}

function inferPlanPeriod(plan: SubscriptionPlan) {
  const label = `${plan.period || ""} ${plan.code || ""} ${plan.name || ""}`.toLowerCase();
  if (label.includes("year") || label.includes("annual") || label.includes("annuel")) return "year";
  if (label.includes("month") || label.includes("mensuel")) return "month";
  if (plan.duration_days >= 330) return "year";
  if (plan.duration_days >= 27 && plan.duration_days <= 31) return "month";
  return null;
}

function ctaForPlan(
  planId: PremiumPlanId,
  currentPlan: PremiumPlanId,
  isAuthenticated: boolean,
  copy: ReturnType<typeof premiumPageCopy>
) {
  if (!isAuthenticated) {
    if (planId === "DECOUVERTE") return copy.startFree;
    return copy.signInToSubscribe;
  }

  if (planId === currentPlan) return copy.currentPlan;
  if (currentPlan === "EXCELLENCE_PLUS" && planId !== "EXCELLENCE_PLUS") return copy.included;
  if (currentPlan === "EXCELLENCE" && planId === "DECOUVERTE") return copy.included;
  if (planId === "EXCELLENCE") return copy.upgradeToExcellence;
  if (planId === "EXCELLENCE_PLUS") {
    return currentPlan === "EXCELLENCE"
      ? copy.upgradeToExcellencePlus
      : copy.saveWithExcellencePlus;
  }
  return copy.included;
}

function hrefForPlan(planId: PremiumPlanId, isAuthenticated: boolean) {
  if (!isAuthenticated) return planId === "DECOUVERTE" ? "/register" : "/login";
  return "/subscription";
}

function planDisplayName(plan: PremiumPlanId, language: string) {
  if (plan === "EXCELLENCE") return "Gansekou Excellence";
  if (plan === "EXCELLENCE_PLUS") return "Gansekou Excellence+";
  return language === "EN" ? "Gansekou Discovery" : "Gansekou Découverte";
}

function formatFcfa(amount: number) {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

function formatPrice(plan: PremiumPlanCard, copy: ReturnType<typeof premiumPageCopy>) {
  if (plan.price_xaf === 0) return copy.freePrice;
  return `${formatFcfa(plan.price_xaf)}${plan.priceSuffix ? ` ${plan.priceSuffix}` : ""}`;
}

function formatPremiumDate(value: string | null | undefined, language: string) {
  if (!value) return language === "EN" ? "Not scheduled" : "Non planifiée";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return language === "EN" ? "Not scheduled" : "Non planifiée";
  return new Intl.DateTimeFormat(language === "EN" ? "en-US" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function PaymentLogo({ method, label }: { method: "MTN" | "ORANGE"; label: string }) {
  const isMtn = method === "MTN";
  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl px-4 py-3 font-black ${isMtn ? "bg-[#ffcc00] text-[#071d3a]" : "bg-[#ff7900] text-white"}`}>
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9 shrink-0">
        <rect width="48" height="48" rx="14" fill={isMtn ? "#071d3a" : "#ffffff"} />
        <text x="24" y="29" textAnchor="middle" fontSize={isMtn ? "11" : "8"} fontWeight="900" fill={isMtn ? "#ffcc00" : "#ff7900"}>
          {isMtn ? "MTN" : "OM"}
        </text>
      </svg>
      <span>{label}</span>
    </div>
  );
}

function planFeatures(plan: PremiumPlanId, copy: ReturnType<typeof premiumPageCopy>) {
  if (plan === "DECOUVERTE") {
    return [
      ...copy.discoveryIncluded.map((label) => ({ label, included: true })),
      ...copy.discoveryExcluded.map((label) => ({ label, included: false })),
    ];
  }

  if (plan === "EXCELLENCE") {
    return [
      { label: copy.allDiscovery, included: true },
      ...copy.excellenceIncluded.map((label) => ({ label, included: true })),
    ];
  }

  return [
    { label: copy.allExcellence, included: true },
    ...copy.excellencePlusIncluded.map((label) => ({ label, included: true })),
  ];
}

function premiumComparisonRows(copy: ReturnType<typeof premiumPageCopy>) {
  return [
    [copy.aiQuestions, true, true, true],
    [copy.courses, true, true, true],
    [copy.exercises, true, true, true],
    [copy.quizzes, true, true, true],
    [copy.subjects, true, true, true],
    [copy.pdfDownload, false, true, true],
    [copy.videoDownload, false, true, true],
    [copy.audioDownload, false, true, true],
    [copy.offlineMode, false, true, true],
    [copy.fullHistory, false, true, true],
    [copy.premiumContent, false, true, true],
    [copy.premiumQuizzes, false, true, true],
    [copy.priorityQuestions, false, true, true],
    [copy.prioritySupport, false, false, true],
  ].map(([label, discovery, excellence, excellencePlus]) => ({
    label: String(label),
    values: [Boolean(discovery), Boolean(excellence), Boolean(excellencePlus)],
  }));
}

function premiumFaq(copy: ReturnType<typeof premiumPageCopy>) {
  return [
    { question: copy.faqFreeQuestion, answer: copy.faqFreeAnswer },
    { question: copy.faqSubscriptionQuestion, answer: copy.faqSubscriptionAnswer },
    { question: copy.faqCancelQuestion, answer: copy.faqCancelAnswer },
    { question: copy.faqPaymentQuestion, answer: copy.faqPaymentAnswer },
    { question: copy.faqExpirationQuestion, answer: copy.faqExpirationAnswer },
  ];
}

function premiumPageCopy(language: string) {
  const fr = language !== "EN";
  return {
    heroEyebrow: fr ? "Gansekou Premium" : "Gansekou Premium",
    heroTitle: fr ? "Investissez dans votre réussite scolaire." : "Invest in your academic success.",
    heroSubtitle: fr
      ? "Accédez à davantage de cours, révisez même sans connexion Internet et obtenez une expérience d’apprentissage plus complète avec Gansekou Premium."
      : "Access more courses, revise even without an internet connection, and get a more complete learning experience with Gansekou Premium.",
    heroBody: fr
      ? "Des centaines de cours, exercices, sujets et évaluations conçus pour accompagner votre réussite tout au long de l’année scolaire."
      : "Hundreds of courses, exercises, past papers and assessments designed to support your success throughout the school year.",
    heroPrimaryCta: fr ? "Voir les offres" : "View plans",
    heroSecondaryCta: fr ? "Comparer les avantages" : "Compare benefits",
    heroCardEyebrow: fr ? "Ce que Premium change" : "What Premium changes",
    heroWinCourses: fr ? "Plus de cours et d’exercices adaptés à votre niveau" : "More courses and exercises adapted to your level",
    heroWinOffline: fr ? "Révisions possibles hors connexion" : "Revision available offline",
    heroWinPremium: fr ? "Contenus, quiz et sujets Premium" : "Premium content, quizzes and past papers",
    heroWinProgress: fr ? "Progression plus claire toute l’année" : "Clearer progress all year long",
    currentSubscription: fr ? "Votre abonnement actuel" : "Your current subscription",
    currentPlan: fr ? "Plan actuel" : "Current plan",
    status: fr ? "Statut" : "Status",
    expiresAt: fr ? "Expiration" : "Expires",
    renewsAt: fr ? "Renouvellement" : "Renewal",
    nextDue: fr ? "Prochaine échéance" : "Next due date",
    noRenewal: fr ? "Aucun renouvellement automatique" : "No automatic renewal",
    freeStatus: fr ? "Gratuit" : "Free",
    manageSubscription: fr ? "Gérer mon abonnement" : "Manage subscription",
    discoveryName: fr ? "Gansekou Découverte" : "Gansekou Discovery",
    discoveryShort: fr ? "Découverte" : "Discovery",
    excellenceName: "Gansekou Excellence",
    excellenceShort: "Excellence",
    excellencePlusName: "Gansekou Excellence+",
    excellencePlusShort: "Excellence+",
    freePrice: fr ? "0 FCFA" : "0 FCFA",
    perMonth: fr ? "/ mois" : "/ month",
    perYear: fr ? "/ an" : "/ year",
    discoveryDescription: fr ? "Pour découvrir Gansekou gratuitement." : "Discover Gansekou for free.",
    excellenceDescription: fr ? "La formule idéale pour progresser chaque mois sans limitation." : "The ideal plan to progress every month without limits.",
    excellencePlusDescription: fr ? "La formule annuelle pour les élèves ambitieux." : "The annual plan for ambitious students.",
    mostPopular: fr ? "⭐ LE PLUS POPULAIRE" : "⭐ MOST POPULAR",
    saveAnnual: fr ? "Économisez 1 500 FCFA" : "Save 1,500 FCFA",
    startFree: fr ? "Commencer gratuitement" : "Start for free",
    signInToSubscribe: fr ? "Se connecter pour s’abonner" : "Sign in to subscribe",
    upgradeToExcellence: fr ? "Passer à Excellence" : "Upgrade to Excellence",
    upgradeToExcellencePlus: fr ? "Passer à Excellence+" : "Upgrade to Excellence+",
    saveWithExcellencePlus: fr ? "Économiser avec Excellence+" : "Save with Excellence+",
    included: fr ? "Inclus" : "Included",
    planUnavailable: fr ? "Plan indisponible" : "Plan unavailable",
    allDiscovery: fr ? "TOUT Découverte +" : "EVERYTHING in Discovery +",
    allExcellence: fr ? "TOUT Excellence +" : "EVERYTHING in Excellence +",
    discoveryIncluded: [
      fr ? "Poser des questions à Kouma IA" : "Ask questions to Kouma AI",
      fr ? "Consulter les cours de son niveau" : "View courses for your level",
      fr ? "Accéder aux exercices de son niveau" : "Access exercises for your level",
      fr ? "Faire les quiz disponibles" : "Take available quizzes",
      fr ? "Consulter les sujets disponibles" : "View available past papers",
      fr ? "Recevoir des notifications" : "Receive notifications",
      fr ? "Suivre sa progression" : "Track your progress",
      fr ? "Tableau de bord personnel" : "Personal dashboard",
      fr ? "Recommandations pédagogiques" : "Learning recommendations",
    ],
    discoveryExcluded: [
      fr ? "Téléchargements" : "Downloads",
      fr ? "Mode hors ligne" : "Offline mode",
      fr ? "Contenus Premium" : "Premium content",
      fr ? "Priorité des questions" : "Question priority",
    ],
    excellenceIncluded: [
      fr ? "Téléchargement illimité PDF" : "Unlimited PDF downloads",
      fr ? "Téléchargement vidéos éducatives" : "Educational video downloads",
      fr ? "Téléchargement audios éducatifs" : "Educational audio downloads",
      fr ? "Lecture hors connexion" : "Offline reading",
      fr ? "Accès aux contenus Premium" : "Premium content access",
      fr ? "Accès aux quiz Premium" : "Premium quiz access",
      fr ? "Accès aux sujets Premium" : "Premium past paper access",
      fr ? "Historique complet" : "Full history",
      fr ? "Questions prioritaires" : "Priority questions",
      fr ? "Réponses IA plus rapides" : "Faster AI answers",
      fr ? "Badge Excellence" : "Excellence badge",
      fr ? "Accès anticipé aux nouveautés" : "Early access to new features",
    ],
    excellencePlusIncluded: [
      fr ? "Économie annuelle" : "Annual savings",
      fr ? "Badge Excellence+ exclusif" : "Exclusive Excellence+ badge",
      fr ? "Priorité maximale" : "Maximum priority",
      fr ? "Support prioritaire" : "Priority support",
      fr ? "Accès anticipé aux nouveautés" : "Early access to new features",
      fr ? "Distinction spéciale sur le profil" : "Special profile distinction",
      fr ? "Statut membre annuel" : "Annual member status",
    ],
    comparisonEyebrow: fr ? "Comparatif" : "Comparison",
    comparisonTitle: fr ? "Comparez clairement chaque formule" : "Clearly compare every plan",
    features: fr ? "Avantages" : "Benefits",
    aiQuestions: fr ? "Questions IA" : "AI questions",
    courses: fr ? "Cours" : "Courses",
    exercises: fr ? "Exercices" : "Exercises",
    quizzes: fr ? "Quiz" : "Quizzes",
    subjects: fr ? "Sujets" : "Past papers",
    pdfDownload: fr ? "Téléchargement PDF" : "PDF download",
    videoDownload: fr ? "Téléchargement vidéo" : "Video download",
    audioDownload: fr ? "Téléchargement audio" : "Audio download",
    offlineMode: fr ? "Mode hors ligne" : "Offline mode",
    fullHistory: fr ? "Historique complet" : "Full history",
    premiumContent: fr ? "Contenus Premium" : "Premium content",
    premiumQuizzes: fr ? "Quiz Premium" : "Premium quizzes",
    priorityQuestions: fr ? "Priorité des questions" : "Question priority",
    prioritySupport: fr ? "Support prioritaire" : "Priority support",
    paymentEyebrow: fr ? "Paiement Mobile Money" : "Mobile Money payment",
    paymentTitle: fr ? "Paiement simple et sécurisé" : "Simple and secure payment",
    paymentSubtitle: fr ? "Abonnez-vous en quelques secondes avec votre compte Mobile Money." : "Subscribe in seconds with your Mobile Money account.",
    mtnMobileMoney: "MTN Mobile Money",
    orangeMoney: "Orange Money",
    paymentSecure: fr ? "Paiement sécurisé" : "Secure payment",
    paymentImmediate: fr ? "Activation immédiate après confirmation" : "Immediate activation after confirmation",
    paymentMtn: fr ? "Compatible MTN Mobile Money" : "Supports MTN Mobile Money",
    paymentOrange: fr ? "Compatible Orange Money" : "Supports Orange Money",
    paymentNoCommitment: fr ? "Aucun engagement" : "No commitment",
    paymentSimpleRenewal: fr ? "Renouvellement simple" : "Simple renewal",
    whyEyebrow: fr ? "Réassurance" : "Confidence",
    whyTitle: fr ? "Pourquoi choisir Gansekou Premium ?" : "Why choose Gansekou Premium?",
    reassuranceLearnTitle: fr ? "Apprendre partout" : "Learn anywhere",
    reassuranceLearnBody: fr ? "Révisez même sans connexion Internet." : "Revise even without an internet connection.",
    reassuranceTimeTitle: fr ? "Gagner du temps" : "Save time",
    reassuranceTimeBody: fr ? "Accédez rapidement aux contenus adaptés à votre niveau." : "Quickly access content adapted to your level.",
    reassuranceExamTitle: fr ? "Préparer ses examens" : "Prepare for exams",
    reassuranceExamBody: fr ? "Travaillez avec davantage de sujets, exercices et évaluations." : "Practice with more past papers, exercises and assessments.",
    faqEyebrow: fr ? "Questions fréquentes" : "FAQ",
    faqTitle: fr ? "Tout savoir avant de s’abonner" : "Everything to know before subscribing",
    faqFreeQuestion: fr ? "Puis-je commencer gratuitement ?" : "Can I start for free?",
    faqFreeAnswer: fr ? "Oui. Gansekou Découverte permet de commencer sans payer et de tester les fonctionnalités essentielles." : "Yes. Gansekou Discovery lets you start without paying and try the essential features.",
    faqSubscriptionQuestion: fr ? "Comment fonctionne l’abonnement ?" : "How does the subscription work?",
    faqSubscriptionAnswer: fr ? "Choisissez Excellence au mois ou Excellence+ à l’année, confirmez le paiement Mobile Money, puis l’accès Premium est activé." : "Choose monthly Excellence or yearly Excellence+, confirm Mobile Money payment, and Premium access is activated.",
    faqCancelQuestion: fr ? "Puis-je annuler à tout moment ?" : "Can I cancel anytime?",
    faqCancelAnswer: fr ? "Oui. Vous gardez l’accès jusqu’à la fin de la période déjà payée." : "Yes. You keep access until the end of the period already paid for.",
    faqPaymentQuestion: fr ? "Comment payer ?" : "How do I pay?",
    faqPaymentAnswer: fr ? "Les paiements disponibles sont MTN Mobile Money et Orange Money." : "Available payment methods are MTN Mobile Money and Orange Money.",
    faqExpirationQuestion: fr ? "Que se passe-t-il après expiration ?" : "What happens after expiration?",
    faqExpirationAnswer: fr ? "Votre compte repasse sur Découverte. Vos données restent conservées et vous pouvez renouveler simplement." : "Your account returns to Discovery. Your data remains saved and you can renew easily.",
    paymentModalEyebrow: fr ? "Abonnement Premium" : "Premium subscription",
    paymentModalTitle: fr ? "Choisissez votre moyen de paiement" : "Choose your payment method",
    phoneNumber: fr ? "Numéro Mobile Money" : "Mobile Money number",
    phonePlaceholder: fr ? "Ex: 6 70 00 00 00" : "E.g. 6 70 00 00 00",
    confirmPayment: fr ? "Confirmer le paiement" : "Confirm payment",
    paymentLoading: fr ? "Initialisation..." : "Starting...",
    paymentInitiated: fr ? "Paiement initié. Confirmez la demande sur votre téléphone." : "Payment started. Confirm the request on your phone.",
    paymentFailed: fr ? "Impossible d’initialiser le paiement. Vérifiez le numéro et réessayez." : "Unable to start payment. Check the number and try again.",
  };
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.25em] text-[#b88a00]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black text-[#071d3a] md:text-4xl">{title}</h2>
    </div>
  );
}

function PublicNav({ userName }: { userName?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/82 px-5 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <GansekouLogo href="/" variant="full" size="medium" />
        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
          <Link href="/courses">Cours</Link>
          <Link href="/subjects">Sujets</Link>
          <Link href="/quizzes">Quiz</Link>
          <Link href="/premium">Premium</Link>
          {userName ? <Link href="/dashboard">Dashboard</Link> : <Link href="/login">Connexion</Link>}
        </nav>
        <Link href={userName ? "/dashboard" : "/register"} className="ds-button-primary hidden sm:inline-flex">
          {userName ? "Mon espace" : "Inscription"}
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/85 px-5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <GansekouLogo variant="full" size="medium" />
        <p className="max-w-xl text-sm leading-6 text-slate-500">Gansekou construit une experience educative premium, accessible et adaptee au contexte scolaire africain.</p>
        <div className="flex gap-4 text-sm font-bold text-slate-600">
          <Link href="/premium">Premium</Link>
          <Link href="/courses">Cours</Link>
          <Link href="/login">Connexion</Link>
        </div>
      </div>
    </footer>
  );
}

function publicCopy(language: string) {
  const fr = language !== "EN";
  return {
    resumeEyebrow: fr ? "Reprise intelligente" : "Smart resume",
    connectedTitle: fr ? "Continue ton apprentissage, {name}." : "Continue learning, {name}.",
    connectedBody: fr
      ? "Cours recommandes, quiz, progression et notifications sont regroupes pour avancer sans friction."
      : "Recommended courses, quizzes, progress and notifications are gathered so you can move forward smoothly.",
    openSpace: fr ? "Ouvrir mon espace" : "Open my workspace",
    resumeCourse: fr ? "Reprendre un cours" : "Resume a course",
    quickRecommendations: fr ? "Recommandations rapides" : "Quick recommendations",
    noRecommendations: fr ? "Votre parcours se prepare" : "Your path is being prepared",
    noRecommendationsBody: fr
      ? "Des recommandations personnalisees apparaitront des que votre profil d'apprentissage progresse."
      : "Personalized recommendations will appear as your learning profile grows.",
    latestNotifications: fr ? "Dernieres notifications" : "Latest notifications",
    noUrgentAlert: fr ? "Aucune alerte urgente. C'est un bon moment pour progresser." : "No urgent alert. This is a good moment to learn.",
    publicEyebrow: fr ? "Plateforme educative intelligente pour le Cameroun" : "Smart learning platform for Cameroon",
    publicTitle: fr ? "Apprendre mieux, progresser vite, viser plus haut." : "Learn better, progress faster, aim higher.",
    publicBody: fr
      ? "Gansekou rassemble cours, quiz, IA pedagogique, enseignants, progression et premium dans une experience moderne pensee pour les apprenants africains."
      : "Gansekou brings courses, quizzes, AI tutoring, teachers, progress and premium features into a modern experience for African learners.",
    startFree: fr ? "Commencer gratuitement" : "Start free",
    discoverPremium: fr ? "Decouvrir Premium" : "Discover Premium",
    premiumBadge: fr ? "EdTech premium" : "Premium EdTech",
    benefitBody: fr ? "Un parcours clair, rythme et adapte a ton niveau." : "A clear, paced path adapted to your level.",
    premiumShort: fr ? "Corriges avances, contenus hors ligne, IA pedagogique et suivi renforce." : "Advanced corrections, offline content, AI tutoring and stronger tracking.",
    catalog: fr ? "Catalogue" : "Catalog",
    catalogTitle: fr ? "Matieres populaires et cours recents" : "Popular subjects and recent courses",
    trust: fr ? "Confiance" : "Trust",
    trustTitle: fr ? "Une experience premium, claire et motivante" : "A premium, clear and motivating experience",
    faqTitle: fr ? "Questions frequentes" : "Frequently asked questions",
    faqAnswer: fr
      ? "Oui, cette experience est progressive et pensee pour apprendre avec clarte, sans complexite inutile."
      : "Yes, the experience is progressive and designed for clear learning without unnecessary complexity.",
  };
}
