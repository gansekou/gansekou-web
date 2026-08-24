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

  // Plus récent → plus ancien
  const sortedUsers = [...users].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

    return dateB - dateA;
  });

  const filtered = sortedUsers.filter((user) => {
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

    return level?.name_fr || level?.name_en || "—";
  };

  const getProfileUrl = (profileUrl?: string | null) => {
    if (!profileUrl) return null;

    return platformService.uploads.publicFileUrl(profileUrl);
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(parsed);
  };

  const getInitials = (user: User) =>
    `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();

  return (
    <section className="rounded-[2rem] bg-white p-4 shadow-xl shadow-[#082f1f]/5 sm:p-6 md:p-7">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-[#082f1f] sm:text-2xl">
              Utilisateurs
            </h3>

            <span className="rounded-full bg-[#082f1f] px-3 py-1 text-xs font-black text-white">
              {users.length}
            </span>
          </div>

          <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} au total
          </p>
        </div>

        {/* Recherche + filtre */}
        <div className="grid w-full gap-2 md:w-auto md:grid-cols-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("common.search")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-[#082f1f] md:w-64"
          />

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-[#082f1f] md:w-56"
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

      {/* ========================= */}
      {/* DESKTOP / TABLETTE        */}
      {/* ========================= */}

      <div className="mt-6 hidden md:block">
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1.15fr_1.15fr_1.15fr_0.9fr_1.05fr] bg-slate-50 px-5 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
            <span>Utilisateur</span>
            <span>Téléphone</span>
            <span>Niveau</span>
            <span>Rôle</span>
            <span>Statut</span>
            <span>Inscrit le</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const avatarUrl = getProfileUrl(item.profile_url);

              return (
                <Link
                  key={item.id}
                  href={`/admin/users/${item.id}`}
                  className="grid grid-cols-[2fr_1.15fr_1.15fr_1.15fr_0.9fr_1.05fr] items-center px-5 py-3.5 transition hover:bg-slate-50"
                >
                  {/* Utilisateur */}
                  <div className="flex min-w-0 items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${item.prenom} ${item.nom}`}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#082f1f] text-xs font-black text-white">
                        {getInitials(item)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#082f1f]">
                        {item.prenom} {item.nom}
                      </p>

                      <p className="truncate text-[11px] font-semibold text-slate-400">
                        {item.email || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Téléphone */}
                  <span className="text-xs font-bold text-slate-600">
                    {item.phone || "—"}
                  </span>

                  {/* Niveau */}
                  <span className="text-xs font-bold text-slate-600">
                    {getLevelName(item.level_id)}
                  </span>

                  {/* Rôle */}
                  <span
                    className={`text-xs font-black ${
                      item.role === "ENSEIGNANT_EN_ATTENTE"
                        ? "text-[#b88a00]"
                        : "text-slate-500"
                    }`}
                  >
                    {formatRole(item.role)}
                  </span>

                  {/* Statut */}
                  <span
                    className={`text-[11px] font-black ${
                      item.status === "ACTIVE"
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {item.status}
                  </span>

                  {/* Date */}
                  <span className="text-xs font-bold text-slate-500">
                    {formatDate(item.created_at)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* ANDROID / MOBILE          */}
      {/* ========================= */}

      <div className="mt-5 space-y-2.5 md:hidden">
        {filtered.map((item) => {
          const avatarUrl = getProfileUrl(item.profile_url);

          return (
            <Link
              key={item.id}
              href={`/admin/users/${item.id}`}
              className="block rounded-2xl border border-slate-100 bg-slate-50 p-3.5 transition active:scale-[0.99] hover:bg-white"
            >
              {/* Ligne principale */}
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${item.prenom} ${item.nom}`}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#082f1f] text-xs font-black text-white">
                    {getInitials(item)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-[#082f1f]">
                    {item.prenom} {item.nom}
                  </p>

                  <p className="truncate text-[11px] font-semibold text-slate-400">
                    {item.email || "Email non renseigné"}
                  </p>
                </div>

                <span className="text-lg font-black text-slate-300">
                  ›
                </span>
              </div>

              {/* Informations */}
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-200 pt-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                    Téléphone
                  </p>

                  <p className="mt-0.5 truncate text-xs font-bold text-slate-600">
                    {item.phone || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                    Niveau
                  </p>

                  <p className="mt-0.5 truncate text-xs font-bold text-slate-600">
                    {getLevelName(item.level_id)}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                    Rôle
                  </p>

                  <p
                    className={`mt-0.5 truncate text-xs font-black ${
                      item.role === "ENSEIGNANT_EN_ATTENTE"
                        ? "text-[#b88a00]"
                        : "text-slate-600"
                    }`}
                  >
                    {formatRole(item.role)}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                    Inscrit le
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-500">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </div>

              {/* Statut */}
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                    item.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.status}
                </span>

                <span className="text-[10px] font-bold text-slate-400">
                  Voir le profil →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Aucun résultat */}
      {filtered.length === 0 && (
        <div className="py-10 text-center text-sm font-bold text-slate-400">
          Aucun utilisateur trouvé.
        </div>
      )}
    </section>
  );
}
