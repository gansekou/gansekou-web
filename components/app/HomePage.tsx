"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
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

import { Footer } from "@/components/app/Footer";

const navKeys = [
  ["home.navHome", "/"],
  ["home.navCourses", "/courses"],
  ["home.navQuizzes", "/quizzes"],
  ["home.navPremium", "/premium"],
] as const;


export function HomePage() {
  const { user, loading } = useCurrentUser();
  const { t } = useI18n(user || undefined);


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
  isAuthenticated,
  displayName,
  loading,
}: {
  isAuthenticated: boolean;
  displayName: string;
  loading: boolean;
}) {
 const { t } = useI18n();
    return (
      <header className="
        sticky
        top-0
        z-40
        border-b
        border-slate-200
        bg-white/90
        px-5
        py-4
        backdrop-blur-xl
      ">
  
        <div className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
        ">
  
          <GansekouLogo
            href="/"
            variant="full"
            size="medium"
          />
  
  
          <nav className="
            hidden
            gap-6
            text-sm
            font-black
            text-slate-600
            lg:flex
          ">
  
            {navKeys.map(([key, href]) => (
  
              <Link
                key={key}
                href={href}
                className="hover:text-[#071d3a]"
              >
                t(key)
              </Link>
  
            ))}
  
          </nav>
  
  
  
          <div className="flex items-center gap-3">
  
  
            {!loading && isAuthenticated ? (
  
              <>
  
                <Link
                  href="/dashboard"
                  className="
                    rounded-full
                    bg-[#071d3a]
                    px-5
                    py-2
                    text-sm
                    font-black
                    text-white
                  "
                >
                  Dashboard
                </Link>
  
  
                <div className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[#fff7df]
                  font-black
                ">
                  {initials(displayName)}
                </div>
  
              </>
  
  
            ) : (
  
              <>
  
                <Link
                  href="/login"
                  className="
                    hidden
                    text-sm
                    font-black
                    text-slate-600
                    sm:block
                  "
                >
                  Connexion
                </Link>
  
  
                <Link
                  href="/register"
                  className="
                    rounded-full
                    bg-[#f6c445]
                    px-5
                    py-2
                    text-sm
                    font-black
                    text-[#071d3a]
                  "
                >
                  Commencer
                </Link>
  
              </>
  
            )}
  
          </div>
  
  
        </div>
  
      </header>
    );
  }
  
  function initials(name:string){
  
    if(!name) return "G";
  
    return name
      .split(" ")
      .slice(0,2)
      .map(v=>v[0])
      .join("")
      .toUpperCase();


}
