"use client";

import { ActionCard, HeroPanel } from "@/components/pages/shared/cards";
import { KoumaChat } from "@/components/chat/KoumaChat";

import type { Content } from "@/types/content";
import type { PageData, Quiz } from "@/types/platform";
import type { User } from "@/types/user";


export function StudentDashboardPage({
  user,
  data
}: {
  user: User;
  data: PageData;
}) {


  const contents =
    (data.contents as Content[]) || [];


  const quizzes =
    (data.quizzes as Quiz[]) || [];



  const recommendedContent =
    contents.find(
      (content) =>
        content.level_id === user.level_id
    )
    ||
    contents[0];



  const recommendedQuiz =
    quizzes.find(
      (quiz) =>
        quiz.level_id === user.level_id
    )
    ||
    quizzes[0];



  return (

    <div className="space-y-6">


      <HeroPanel
        eyebrow="Espace élève"
        title={`Bienvenue ${user.prenom || "Gansekou"}`}
        body="Retrouvez vos cours, posez vos questions et continuez votre parcours."
        actionHref="/analytics"
        actionLabel="Voir les statistiques"
      />



      {/* =========================
          KOUMA IA
      ========================= */}


      <section
        className="
        rounded-[1.5rem]
        bg-white
        p-6
        shadow-xl
        shadow-[#082f1f]/5
        "
      >


        <div className="mb-5">


          <p
            className="
            text-sm
            font-black
            uppercase
            tracking-[0.2em]
            text-[#0f5f3a]
            "
          >
            Assistant intelligent
          </p>



          <h2
            className="
            mt-2
            text-2xl
            font-black
            text-[#071d3a]
            "
          >
            🤖 Kouma IA
          </h2>



          <p
            className="
            mt-2
            text-sm
            font-bold
            text-slate-500
            "
          >
            Pose tes questions et apprends avec ton assistant pédagogique personnel.
          </p>


        </div>



        <div
          className="
          h-[500px]
          overflow-hidden
          rounded-3xl
          border
          border-slate-100
          "
        >

          <KoumaChat />

        </div>



      </section>





      {/* =========================
          ACTIONS RAPIDES
      ========================= */}


      <section
        className="
        grid
        gap-4
        md:grid-cols-2
        xl:grid-cols-4
        "
      >


        <ActionCard
          href={
            recommendedContent
            ?
            `/courses/${recommendedContent.id}`
            :
            "/courses"
          }
          title="Reprendre"
          body="Ouvrir un cours recommandé"
        />



        <ActionCard
          href={
            recommendedQuiz
            ?
            `/quizzes/${recommendedQuiz.id}`
            :
            "/quizzes"
          }
          title="Quiz"
          body="Lancer une évaluation"
        />



        <ActionCard
          href="/questions/new"
          title="Nouvelle question"
          body="Demander une aide IA ou enseignant"
        />



        <ActionCard
          href="/courses"
          title="Cours"
          body="Explorer le catalogue"
        />


      </section>


    </div>

  );

}
