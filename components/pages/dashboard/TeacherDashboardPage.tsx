"use client";

import { ActionCard, HeroPanel } from "@/components/pages/shared/cards";
import { isTeacherPending } from "@/lib/permissions";
import type { PageData } from "@/types/platform";
import type { User } from "@/types/user";

export function TeacherDashboardPage({ user }: { user: User; data: PageData }) {
  const pending = isTeacherPending(user);
  return (
    <>
      <HeroPanel
        eyebrow="Studio enseignant"
        title={pending ? "Compte enseignant en validation" : "Pilotez vos cours et reponses"}
        body={pending ? "Vous pouvez preparer vos matieres et contenus. Les reponses eleves seront ouvertes apres validation." : "Accedez aux questions, matieres, contenus et actions rapides."}
        actionHref="/analytics"
        actionLabel="Voir les statistiques"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href="/teacher/questions/pending" title="Questions a traiter" body="Voir la file disponible" />
        <ActionCard href="/teacher/questions/assigned" title="Questions assignees" body="Reprendre vos reponses" />
        <ActionCard href="/teacher/subjects" title="Matieres" body="Gerer vos matieres" />
        <ActionCard href="/teacher/contents" title="Contenus" body="Gerer vos cours" />
      </section>
    </>
  );
}

