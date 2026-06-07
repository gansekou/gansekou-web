"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import { useI18n } from "@/hooks/useI18n";
import type { PageData } from "@/types/platform";
import type { User } from "@/types/user";

export function AdminUsersPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const users = await platformService.users.all().catch(() => [] as User[]);
    return { users };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement des utilisateurs..." load={load}>
      {({ data }) => <UserTable users={(data.users as User[]) || []} />}
    </AuthenticatedPage>
  );
}

function UserTable({ users }: { users: User[] }) {
  const { t, formatRole } = useI18n();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const filtered = users.filter((user) => {
    const label = `${user.prenom} ${user.nom} ${user.email || ""}`.toLowerCase();
    return (!query || label.includes(query.toLowerCase())) && (!role || user.role === role);
  });

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h3 className="text-2xl font-black text-[#082f1f]">Utilisateurs</h3>
        <div className="grid gap-2 md:grid-cols-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("common.search")} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none" />
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none">
            <option value="">{t("common.role")}</option>
            {["ELEVE", "ENSEIGNANT_EN_ATTENTE", "ENSEIGNANT", "ADMIN", "ADMINISTRATEUR", "PROMOTEUR"].map((item) => <option key={item} value={item}>{formatRole(item)}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {filtered.map((item) => (
          <Link key={item.id} href={`/admin/users/${item.id}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 hover:bg-white">
            <span className="font-black text-[#082f1f]">{item.prenom} {item.nom}</span>
            <span className={`text-sm font-bold ${item.role === "ENSEIGNANT_EN_ATTENTE" ? "text-[#b88a00]" : "text-slate-500"}`}>{formatRole(item.role)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

