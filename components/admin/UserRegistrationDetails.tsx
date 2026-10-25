
"use client";

import {
  CalendarDays,
  Clock3,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { User } from "@/types/user";

type Props = {
  user: User;
};

function display(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Non renseigné";
  }

  return String(value);
}

function formatDate(value?: string | null): string {
  if (!value) return "Non disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Non disponible";

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InformationItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={17} />
        <p className="text-xs font-bold uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-sm font-black text-[#071d3a]">
        {value}
      </p>
    </div>
  );
}

export function UserRegistrationDetails({ user }: Props) {
  return (
    <section className="ds-card rounded-[2rem] p-6 md:p-7">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
          <UserRound size={22} />
        </div>

        <div>
          <h3 className="text-2xl font-black text-[#071d3a]">
            Informations d’inscription
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Coordonnées, statut du compte et dates enregistrées par
            GANSEKOU.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InformationItem
          icon={UserRound}
          label="Nom"
          value={display(user.nom)}
        />

        <InformationItem
          icon={UserRound}
          label="Prénom"
          value={display(user.prenom)}
        />

        <InformationItem
          icon={Mail}
          label="Adresse e-mail"
          value={display(user.email)}
        />

        <InformationItem
          icon={Phone}
          label="Téléphone"
          value={display(user.phone)}
        />

        <InformationItem
          icon={UserRound}
          label="Genre"
          value={display(user.genre)}
        />

        <InformationItem
          icon={CalendarDays}
          label="Âge"
          value={user.age == null ? "Non renseigné" : `${user.age} ans`}
        />

        <InformationItem
          icon={ShieldCheck}
          label="Rôle actuel"
          value={display(user.role)}
        />

        <InformationItem
          icon={ShieldCheck}
          label="Statut du compte"
          value={display(user.status)}
        />

        <InformationItem
          icon={Globe}
          label="Langue préférée"
          value={display(user.preferred_language)}
        />

        <InformationItem
          icon={GraduationCap}
          label="Identifiant du niveau"
          value={display(user.level_id)}
        />

        <InformationItem
          icon={GraduationCap}
          label="Identifiant de l’établissement"
          value={display(user.school_id)}
        />

        <InformationItem
          icon={MapPin}
          label="Identifiant de l’adresse"
          value={display(user.address_id)}
        />

        <InformationItem
          icon={CalendarDays}
          label="Date d’inscription"
          value={formatDate(user.created_at)}
        />

        <InformationItem
          icon={Clock3}
          label="Dernière modification du profil"
          value={formatDate(user.updated_at)}
        />
      </div>
    </section>
  );
}
