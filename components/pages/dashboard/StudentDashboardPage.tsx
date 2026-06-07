"use client";

import { ActionCard, HeroPanel } from "@/components/pages/shared/cards";
import type { Content } from "@/types/content";
import type { PageData, Quiz } from "@/types/platform";
import type { User } from "@/types/user";

export function StudentDashboardPage({ user, data }: { user: User; data: PageData }) {
  const contents = (data.contents as Content[]) || [];
  const quizzes = (data.quizzes as Quiz[]) || [];
  const recommendedContent = contents.find((content) => content.level_id === user.level_id) || contents[0];
  const recommendedQuiz = quizzes.find((quiz) => quiz.level_id === user.level_id) || quizzes[0];

  return (
    <>
      <HeroPanel
        eyebrow="Espace eleve"
        title={`Bienvenue ${user.prenom || "Gansekou"}`}
        body="Retrouvez vos cours, posez vos questions et continuez votre parcours."
        actionHref="/analytics"
        actionLabel="Voir les statistiques"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href={recommendedContent ? `/courses/${recommendedContent.id}` : "/courses"} title="Reprendre" body="Ouvrir un cours recommande" />
        <ActionCard href={recommendedQuiz ? `/quizzes/${recommendedQuiz.id}` : "/quizzes"} title="Quiz" body="Lancer une evaluation" />
        <ActionCard href="/questions/new" title="Nouvelle question" body="Demander une aide IA ou enseignant" />
        <ActionCard href="/courses" title="Cours" body="Explorer le catalogue" />
      </section>
    </>
  );
}

