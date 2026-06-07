"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Layers3,
  MessageCircleQuestion,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { GansekouLogo } from "@/components/ui/GansekouLogo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";

type Copy = ReturnType<typeof useHomeCopy>;

const navKeys = [
  ["home.navHome", "/"],
  ["home.navCourses", "/courses"],
  ["home.navQuizzes", "/quizzes"],
  ["home.navPremium", "/premium"],
  ["home.navAbout", "#about"],
] as const;

const featureItems = [
  ["home.featureCoursesTitle", "home.featureCoursesBody", BookOpen],
  ["home.featureExercisesTitle", "home.featureExercisesBody", ClipboardList],
  ["home.featureQuizzesTitle", "home.featureQuizzesBody", GraduationCap],
  ["home.featureExamsTitle", "home.featureExamsBody", Layers3],
  ["home.featureAiTitle", "home.featureAiBody", Brain],
  ["home.featureProgressTitle", "home.featureProgressBody", BarChart3],
] as const;

const audienceItems = [
  ["home.audienceStudentsTitle", "home.audienceStudentsBody", GraduationCap],
  ["home.audienceParentsTitle", "home.audienceParentsBody", Users],
  ["home.audienceTeachersTitle", "home.audienceTeachersBody", BookOpen],
  ["home.audienceSchoolsTitle", "home.audienceSchoolsBody", School],
] as const;

const contentItems = [
  ["home.contentCoursesTitle", "home.contentCoursesBody", "/courses", BookOpen],
  ["home.contentExercisesTitle", "home.contentExercisesBody", "/exercises", ClipboardList],
  ["home.contentQuizzesTitle", "home.contentQuizzesBody", "/quizzes", GraduationCap],
  ["home.contentSubjectsTitle", "home.contentSubjectsBody", "/subjects", Layers3],
] as const;

const koumaPoints = [
  "home.koumaPointSimple",
  "home.koumaPointLevel",
  "home.koumaPointQuestions",
  "home.koumaPointRecommendations",
] as const;

const teacherPoints = [
  "home.teacherPointSubjects",
  "home.teacherPointAnswers",
  "home.teacherPointContent",
  "home.teacherPointDashboard",
] as const;

const trustPoints = [
  "home.trustCurriculum",
  "home.trustCommunity",
  "home.trustDevices",
  "home.trustPayment",
  "home.trustSecurity",
] as const;

const faqItems = [
  ["home.faqFreeQuestion", "home.faqFreeAnswer"],
  ["home.faqAudienceQuestion", "home.faqAudienceAnswer"],
  ["home.faqWithoutPremiumQuestion", "home.faqWithoutPremiumAnswer"],
  ["home.faqPremiumQuestion", "home.faqPremiumAnswer"],
  ["home.faqPaymentQuestion", "home.faqPaymentAnswer"],
] as const;

export function HomePage() {
  const { user, loading } = useCurrentUser();
  const { t } = useI18n(user || undefined);
  const copy = useHomeCopy(t);
  const isAuthenticated = Boolean(user);
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#071d3a]">
      <PublicHomeNav copy={copy} isAuthenticated={isAuthenticated} displayName={displayName} loading={loading} />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#fff7df] to-transparent" />
        <div className="absolute left-0 top-24 h-1 w-full bg-gradient-to-r from-[#0f5f3a]/20 via-[#f6c445]/35 to-[#c62828]/15" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#b88a00]">{copy.heroEyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{copy.heroBody}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={isAuthenticated ? "/dashboard" : "/register"} className="ds-button-primary">
                {isAuthenticated ? copy.dashboardCta : copy.startFree}
                <ArrowRight size={18} />
              </Link>
              <Link href={isAuthenticated ? "/courses" : "/premium"} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 font-black text-[#071d3a] shadow-lg shadow-[#071d3a]/5 transition hover:border-[#f6c445]">
                {isAuthenticated ? copy.myCoursesCta : copy.discoverPremium}
              </Link>
            </div>
          </div>

          <HeroMockup copy={copy} />
        </div>
      </section>

      <HomeSection eyebrow={copy.featuresEyebrow} title={copy.featuresTitle}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featureItems.map(([titleKey, bodyKey, Icon]) => (
            <article key={titleKey} className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-xl shadow-[#071d3a]/5">
              <Icon className="text-[#f6c445]" size={28} />
              <h3 className="mt-5 text-xl font-black">{t(titleKey)}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t(bodyKey)}</p>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection id="about" eyebrow={copy.audienceEyebrow} title={copy.audienceTitle}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {audienceItems.map(([titleKey, bodyKey, Icon]) => (
            <article key={titleKey} className="rounded-[1.25rem] bg-[#071d3a] p-6 text-white shadow-xl shadow-[#071d3a]/10">
              <Icon className="text-[#f6c445]" size={28} />
              <h3 className="mt-5 text-xl font-black">{t(titleKey)}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">{t(bodyKey)}</p>
            </article>
          ))}
        </div>
      </HomeSection>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-6 shadow-xl shadow-[#071d3a]/5">
            <div className="rounded-3xl bg-[#071d3a] p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6c445] text-[#071d3a]">
                  <Brain size={26} />
                </span>
                <div>
                  <p className="text-sm font-black text-[#f6c445]">{copy.koumaName}</p>
                  <p className="text-xs font-bold text-white/60">{copy.koumaLabel}</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/80">
                {copy.koumaSampleQuestion}
              </div>
              <div className="ml-auto mt-3 max-w-[88%] rounded-2xl bg-[#fff7df] p-4 text-sm font-bold leading-6 text-[#071d3a]">
                {copy.koumaSampleAnswer}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#b88a00]">{copy.koumaEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">{copy.koumaTitle}</h2>
            <p className="mt-5 max-w-2xl leading-8 text-slate-600">{copy.koumaBody}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {koumaPoints.map((key) => (
                <div key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-700">
                  <CheckCircle2 size={18} className="shrink-0 text-[#0f5f3a]" />
                  {t(key)}
                </div>
              ))}
            </div>
            <Link href="/questions/new" className="ds-button-premium mt-7">
              {copy.askQuestion}
            </Link>
          </div>
        </div>
      </section>

      <HomeSection eyebrow={copy.contentEyebrow} title={copy.contentTitle}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {contentItems.map(([titleKey, bodyKey, href, Icon]) => (
            <article key={titleKey} className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-xl shadow-[#071d3a]/5">
              <Icon className="text-[#f6c445]" size={28} />
              <h3 className="mt-5 text-xl font-black">{t(titleKey)}</h3>
              <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{t(bodyKey)}</p>
              <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0f5f3a]">
                {copy.discover}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </HomeSection>

      <section className="bg-[#071d3a] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f6c445]">{copy.teacherEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">{copy.teacherTitle}</h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/70">{copy.teacherBody}</p>
            <Link href="/register" className="ds-button-premium mt-7">
              {copy.joinTeacher}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {teacherPoints.map((key) => (
              <div key={key} className="rounded-2xl bg-white/10 p-5 font-bold text-white/85">
                <CheckCircle2 className="mb-4 text-[#f6c445]" size={20} />
                {t(key)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeSection eyebrow={copy.premiumEyebrow} title={copy.premiumTitle} body={copy.premiumBody}>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [copy.discoveryPlan, copy.discoveryPrice],
            [copy.excellencePlan, copy.excellencePrice],
            [copy.excellencePlusPlan, copy.excellencePlusPrice],
          ].map(([name, price], index) => (
            <div key={name} className={`rounded-[1.25rem] border bg-white p-6 shadow-xl shadow-[#071d3a]/5 ${index === 1 ? "border-[#f6c445] ring-2 ring-[#f6c445]/35" : "border-slate-200"}`}>
              {index === 1 ? <span className="rounded-full bg-[#f6c445] px-3 py-1 text-xs font-black">{copy.popular}</span> : null}
              <h3 className="mt-5 text-xl font-black">{name}</h3>
              <p className="mt-3 text-3xl font-black">{price}</p>
            </div>
          ))}
        </div>
        <Link href="/premium" className="ds-button-primary mt-7">
          {copy.viewPremium}
        </Link>
      </HomeSection>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#b88a00]">{copy.trustEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">{copy.trustTitle}</h2>
            <p className="mt-5 leading-8 text-slate-600">{copy.trustBody}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {trustPoints.map((key) => (
              <div key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 font-bold text-slate-700">
                <ShieldCheck size={19} className="shrink-0 text-[#0f5f3a]" />
                {t(key)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeSection eyebrow={copy.faqEyebrow} title={copy.faqTitle}>
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map(([questionKey, answerKey]) => (
            <details key={questionKey} className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-lg shadow-[#071d3a]/4">
              <summary className="cursor-pointer text-base font-black">{t(questionKey)}</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t(answerKey)}</p>
            </details>
          ))}
        </div>
      </HomeSection>

      <footer className="border-t border-slate-200 bg-white px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <GansekouLogo href="/" variant="full" size="medium" />
            <p className="mt-4 text-sm font-black text-slate-500">{copy.footerSlogan}</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm font-black text-slate-600">
            <Link href="/">{copy.navHome}</Link>
            <Link href="/courses">{copy.navCourses}</Link>
            <Link href="/quizzes">{copy.navQuizzes}</Link>
            <Link href="/premium">{copy.navPremium}</Link>
            <Link href="/login">{copy.login}</Link>
            <Link href="/register">{copy.register}</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function PublicHomeNav({
  copy,
  isAuthenticated,
  displayName,
  loading,
}: {
  copy: Copy;
  isAuthenticated: boolean;
  displayName: string;
  loading: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/88 px-5 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <GansekouLogo href="/" variant="full" size="medium" />
        <nav className="hidden items-center gap-6 text-sm font-black text-slate-600 lg:flex">
          {navKeys.map(([key, href]) => (
            <Link key={key} href={href} className="transition hover:text-[#071d3a]">
              {copy.nav[key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {!loading && isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hidden rounded-full bg-[#071d3a] px-4 py-2 text-sm font-black text-white sm:inline-flex">
                {copy.dashboard}
              </Link>
              <Link href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff7df] text-sm font-black text-[#071d3a] ring-1 ring-[#f6c445]/50" aria-label={copy.profile}>
                {initials(displayName)}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-black text-slate-600 sm:inline-flex">
                {copy.login}
              </Link>
              <Link href="/register" className="rounded-full bg-[#f6c445] px-4 py-2 text-sm font-black text-[#071d3a] shadow-lg shadow-[#f6c445]/25">
                {copy.startFree}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function HeroMockup({ copy }: { copy: Copy }) {
  return (
    <div className="relative">
      <div className="absolute -right-2 -top-3 rounded-full bg-[#f6c445] px-4 py-2 text-xs font-black shadow-xl shadow-[#f6c445]/25">
        {copy.heroBadge}
      </div>
      <div className="rounded-[1.75rem] border border-slate-200 bg-[#071d3a] p-4 shadow-2xl shadow-[#071d3a]/18">
        <div className="rounded-[1.35rem] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b88a00]">{copy.mockDashboard}</p>
              <h2 className="mt-2 text-2xl font-black">{copy.mockWelcome}</h2>
            </div>
            <Sparkles className="text-[#f6c445]" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <p className="text-sm font-black">{copy.mockProgress}</p>
              <div className="mt-4 h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[72%] rounded-full bg-[#0f5f3a]" />
              </div>
              <p className="mt-3 text-xs font-bold text-slate-500">{copy.mockProgressDetail}</p>
            </div>
            <div className="rounded-2xl bg-[#fff7df] p-4">
              <BookOpen className="text-[#b88a00]" size={22} />
              <p className="mt-3 text-sm font-black">{copy.mockCourse}</p>
              <p className="mt-1 text-xs font-bold text-slate-600">{copy.mockCourseDetail}</p>
            </div>
            <div className="rounded-2xl bg-[#eef8f1] p-4">
              <GraduationCap className="text-[#0f5f3a]" size={22} />
              <p className="mt-3 text-sm font-black">{copy.mockQuiz}</p>
              <p className="mt-1 text-xs font-bold text-slate-600">{copy.mockQuizDetail}</p>
            </div>
            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <MessageCircleQuestion className="text-[#071d3a]" size={22} />
              <p className="mt-3 text-sm font-black">{copy.mockAi}</p>
              <p className="mt-1 text-xs font-bold text-slate-600">{copy.mockAiDetail}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeSection({
  id,
  eyebrow,
  title,
  body,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-5 py-14">
      <div className="mb-7 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#b88a00]">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl">{title}</h2>
        {body ? <p className="mt-4 leading-8 text-slate-600">{body}</p> : null}
      </div>
      {children}
    </section>
  );
}

function initials(name: string) {
  const value = name.trim();
  if (!value) return "G";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function useHomeCopy(t: (key: string) => string) {
  return {
    nav: Object.fromEntries(navKeys.map(([key]) => [key, t(key)])) as Record<(typeof navKeys)[number][0], string>,
    navHome: t("home.navHome"),
    navCourses: t("home.navCourses"),
    navQuizzes: t("home.navQuizzes"),
    navPremium: t("home.navPremium"),
    login: t("home.login"),
    register: t("home.register"),
    dashboard: t("home.dashboard"),
    profile: t("home.profile"),
    startFree: t("home.startFree"),
    discoverPremium: t("home.discoverPremium"),
    dashboardCta: t("home.dashboardCta"),
    myCoursesCta: t("home.myCoursesCta"),
    heroEyebrow: t("home.heroEyebrow"),
    heroTitle: t("home.heroTitle"),
    heroBody: t("home.heroBody"),
    heroBadge: t("home.heroBadge"),
    mockDashboard: t("home.mockDashboard"),
    mockWelcome: t("home.mockWelcome"),
    mockProgress: t("home.mockProgress"),
    mockProgressDetail: t("home.mockProgressDetail"),
    mockCourse: t("home.mockCourse"),
    mockCourseDetail: t("home.mockCourseDetail"),
    mockQuiz: t("home.mockQuiz"),
    mockQuizDetail: t("home.mockQuizDetail"),
    mockAi: t("home.mockAi"),
    mockAiDetail: t("home.mockAiDetail"),
    featuresEyebrow: t("home.featuresEyebrow"),
    featuresTitle: t("home.featuresTitle"),
    audienceEyebrow: t("home.audienceEyebrow"),
    audienceTitle: t("home.audienceTitle"),
    koumaEyebrow: t("home.koumaEyebrow"),
    koumaTitle: t("home.koumaTitle"),
    koumaBody: t("home.koumaBody"),
    koumaName: t("home.koumaName"),
    koumaLabel: t("home.koumaLabel"),
    koumaSampleQuestion: t("home.koumaSampleQuestion"),
    koumaSampleAnswer: t("home.koumaSampleAnswer"),
    askQuestion: t("home.askQuestion"),
    contentEyebrow: t("home.contentEyebrow"),
    contentTitle: t("home.contentTitle"),
    discover: t("home.discover"),
    teacherEyebrow: t("home.teacherEyebrow"),
    teacherTitle: t("home.teacherTitle"),
    teacherBody: t("home.teacherBody"),
    joinTeacher: t("home.joinTeacher"),
    premiumEyebrow: t("home.premiumEyebrow"),
    premiumTitle: t("home.premiumTitle"),
    premiumBody: t("home.premiumBody"),
    discoveryPlan: t("home.discoveryPlan"),
    discoveryPrice: t("home.discoveryPrice"),
    excellencePlan: t("home.excellencePlan"),
    excellencePrice: t("home.excellencePrice"),
    excellencePlusPlan: t("home.excellencePlusPlan"),
    excellencePlusPrice: t("home.excellencePlusPrice"),
    popular: t("home.popular"),
    viewPremium: t("home.viewPremium"),
    trustEyebrow: t("home.trustEyebrow"),
    trustTitle: t("home.trustTitle"),
    trustBody: t("home.trustBody"),
    faqEyebrow: t("home.faqEyebrow"),
    faqTitle: t("home.faqTitle"),
    footerSlogan: t("home.footerSlogan"),
  };
}
