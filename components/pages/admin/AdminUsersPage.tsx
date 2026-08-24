"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import { useI18n } from "@/hooks/useI18n";
import type { PageData } from "@/types/platform";
import type { User } from "@/types/user";
import type { Level } from "@/types/platform";

export function AdminUsersPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const [users, levels] = await Promise.all([
      platformService.users.all().catch(() => [] as User[]),
      platformService.education.levels().catch(() => [] as Level[]),
    ]);
  
    return { users, levels };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement des utilisateurs..." load={load}>
      {({ data }) => (
        <UserTable
          users={(data.users as User[]) || []}
          levels={(data.levels as Level[]) || []}
        />
      )}
    </AuthenticatedPage>
  );
}

function UserTable({
  users,
  levels,
}: {
  users: User[];
  levels: Level[];
}) {
  const { t, formatRole } = useI18n();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");

  const filtered = users.filter((user) => {
    const label =
      `${user.prenom} ${user.nom} ${user.email || ""} ${user.phone || ""}`.toLowerCase();

    return (
      (!query || label.includes(query.toLowerCase())) &&
      (!role || user.role === role)
    );
  });

  const getLevelName = (levelId?: string | null) => {
    if (!levelId) return "—";

    const level = levels.find((item) => item.id === levelId);

    return level?.name_fr || "—";
  };

  const getProfileUrl = (profileUrl?: string | null) => {
    if (!profileUrl) return null;

    return platformService.uploads.publicFileUrl(profileUrl);
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h3 className="text-2xl font-black text-[#082f1f]">
            Utilisateurs
          </h3>

          <p className="mt-1 text-sm font-bold text-slate-500">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} au total
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("common.search")}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none"
          />

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none"
          >
            <option value="">{t("common.role")}</option>

            {[
              "ELEVE",
              "ENSEIGNANT_EN_ATTENTE",
              "ENSEIGNANT",
              "ADMIN",
              "ADMINISTRATEUR",
              "PROMOTEUR",
            ].map((item) => (
              <option key={item} value={item}>
                {formatRole(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[1000px] overflow-hidden rounded-2xl border border-slate-100">
          <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr_1.2fr] bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
            <span>Utilisateur</span>
            <span>Téléphone</span>
            <span>Niveau</span>
            <span>Rôle</span>
            <span>Statut</span>
            <span>Inscrit le</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const avatarUrl = getProfileUrl(item.profile_url);
              const initials =
                `${item.prenom?.[0] || ""}${item.nom?.[0] || ""}`.toUpperCase();

              return (
                <Link
                  key={item.id}
                  href={`/admin/users/${item.id}`}
                  className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1fr_1.2fr] items-center px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${item.prenom} ${item.nom}`}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#082f1f] text-sm font-black text-white">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-black text-[#082f1f]">
                        {item.prenom} {item.nom}
                      </p>

                      <p className="truncate text-xs font-semibold text-slate-400">
                        {item.email || "—"}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-slate-600">
                    {item.phone || "—"}
                  </span>

                  <span className="text-sm font-bold text-slate-600">
                    {getLevelName(item.level_id)}
                  </span>

                  <span
                    className={`text-sm font-bold ${
                      item.role === "ENSEIGNANT_EN_ATTENTE"
                        ? "text-[#b88a00]"
                        : "text-slate-500"
                    }`}
                  >
                    {formatRole(item.role)}
                  </span>

                  <span
                    className={`text-xs font-black ${
                      item.status === "ACTIVE"
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="text-sm font-bold text-slate-500">
                    {formatDate(item.created_at)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-10 text-center text-sm font-bold text-slate-400">
          Aucun utilisateur trouvé.
        </div>
      )}
    </section>
  );
}
