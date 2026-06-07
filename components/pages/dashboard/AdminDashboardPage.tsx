"use client";

import { ActionCard, HeroPanel } from "@/components/pages/shared/cards";
import type { PageData } from "@/types/platform";
import type { User } from "@/types/user";

export function AdminDashboardPage({ user }: { user: User; data: PageData }) {
  return (
    <>
      <HeroPanel
        eyebrow="Administration Gansekou"
        title={`Console ${user.prenom || "admin"}`}
        body="Accedez aux actions de gestion, validations, contenus et utilisateurs."
        actionHref="/analytics"
        actionLabel="Voir les statistiques"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href="/admin/users" title="Utilisateurs" body="Gerer les comptes et roles" />
        <ActionCard href="/admin/contents" title="Contenus" body="Moderation et catalogue" />
        <ActionCard href="/admin/education" title="Education" body="Cycles, niveaux et matieres" />
        <ActionCard href="/admin/schools" title="Ecoles" body="Gestion des etablissements" />
      </section>
    </>
  );
}

