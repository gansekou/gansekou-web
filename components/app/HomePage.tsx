"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Sparkles,
} from "lucide-react";

import { GansekouLogo } from "@/components/ui/GansekouLogo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";

import { HeroCarousel } from "@/components/app/HeroCarousel";
import { ContentCarousel } from "@/components/app/ContentCarousel";
import { WhyGansekou } from "@/components/app/WhyGansekou";

type Copy = ReturnType<typeof useHomeCopy>;

const navKeys = [
  ["home.navHome", "/"],
  ["home.navCourses", "/courses"],
  ["home.navQuizzes", "/quizzes"],
  ["home.navPremium", "/premium"],
] as const;


export function HomePage() {
  const { user, loading } = useCurrentUser();
  const { t } = useI18n(user || undefined);

  const copy = useHomeCopy(t);

  const isAuthenticated = Boolean(user);

  const displayName = [
    user?.prenom,
    user?.nom,
  ]
    .filter(Boolean)
    .join(" ");


  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#071d3a]">

      <PublicHomeNav
        copy={copy}
        loading={loading}
        isAuthenticated={isAuthenticated}
        displayName={displayName}
      />


      {/* HERO CAROUSEL */}
      <HeroCarousel
        isAuthenticated={isAuthenticated}
      />


      {/* CONTENUS PRINCIPAUX */}
      <section className="mx-auto max-w-7xl px-5 py-12">

        <ContentCarousel
          title="Cours populaires"
          icon={<BookOpen size={24}/>}
          href="/courses"
          items={[
            "Mathématiques",
            "Physique",
            "Chimie",
            "Français",
          ]}
        />


        <ContentCarousel
          title="Quiz à découvrir"
          icon={<GraduationCap size={24}/>}
          href="/quizzes"
          items={[
            "BEPC",
            "Probatoire",
            "Baccalauréat",
          ]}
        />


        <ContentCarousel
          title="Exercices pratiques"
          icon={<Layers3 size={24}/>}
          href="/exercises"
          items={[
            "Algèbre",
            "Géométrie",
            "Mécanique",
            "Électricité",
          ]}
        />

      </section>



      {/* KOUma IA */}
      <section className="bg-[#071d3a] px-5 py-14 text-white">

        <div className="
          mx-auto
          flex
          max-w-7xl
          flex-col
          gap-8
          md:flex-row
          md:items-center
          md:justify-between
        ">

          <div>

            <div className="flex items-center gap-3">

              <span className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#f6c445]
                text-[#071d3a]
              ">
                <Brain size={26}/>
              </span>


              <div>
                <p className="font-black text-[#f6c445]">
                  Kouma IA
                </p>

                <p className="text-sm text-white/60">
                  Assistant intelligent Gansekou
                </p>
              </div>

            </div>


            <h2 className="
              mt-5
              text-3xl
              font-black
              md:text-5xl
            ">
              Apprends avec ton assistant IA
            </h2>


            <p className="
              mt-4
              max-w-xl
              text-white/70
            ">
              Pose tes questions, comprends tes cours et progresse plus rapidement.
            </p>


            <Link
              href="/questions/new"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#f6c445]
                px-6
                py-3
                font-black
                text-[#071d3a]
              "
            >
              Poser une question
              <ArrowRight size={18}/>
            </Link>

          </div>


          <div className="
            rounded-3xl
            bg-white/10
            p-6
            backdrop-blur
          ">

            <Sparkles className="text-[#f6c445]"/>

            <p className="mt-4 text-lg font-bold">
              "Explique-moi ce théorème simplement"
            </p>

            <p className="mt-3 text-white/70">
              Kouma aide les élèves selon leur niveau.
            </p>

          </div>


        </div>

      </section>



      <WhyGansekou />



      <Footer />

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
