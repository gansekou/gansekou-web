"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/hooks/useI18n";
import { userService } from "@/services/user.service";
import type { GansekouRole, User } from "@/types/user";

const roles: GansekouRole[] = [
  "ELEVE",
  "ENSEIGNANT_EN_ATTENTE",
  "ENSEIGNANT",
  "ADMIN",
  "ADMINISTRATEUR",
  "PROMOTEUR",
];

export function UserRoleManager({
  user,
  onUpdated,
  reload,
}: {
  user: User;
  onUpdated?: (user: User) => void;
  reload?: () => Promise<void>;
}) {
  const { language, t, formatRole } = useI18n();
  const [role, setRole] = useState<GansekouRole>(user.role);
  const [status, setStatus] = useState<string | null>(null);
  const isPendingTeacher = user.role === "ENSEIGNANT_EN_ATTENTE";

  async function updateRole(nextRole: GansekouRole) {
    setStatus(language === "EN" ? "Updating..." : "Mise a jour...");
    try {
      const updated = await userService.adminUpdateUserRole(user.id, nextRole);
      setRole(updated.role);
      onUpdated?.(updated);
      await reload?.();
      setStatus(t("admin.roleUpdated"));
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Mise a jour impossible.");
    }
  }

  return (
    <section className="ds-card rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f5f3a]">{t("admin.changeRole")}</p>
          <h3 className="mt-2 text-2xl font-black text-[#071d3a]">{formatRole(role)}</h3>
        </div>
        {isPendingTeacher && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => updateRole("ENSEIGNANT")} className="inline-flex items-center gap-2 rounded-full bg-[#0f5f3a] px-4 py-3 text-sm font-black text-white">
              <CheckCircle2 size={17} />
              {t("admin.approveTeacher")}
            </button>
            <button type="button" onClick={() => updateRole("ELEVE")} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-3 text-sm font-black text-red-700">
              <XCircle size={17} />
              {t("admin.rejectTeacher")}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as GansekouRole)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none"
        >
          {roles.map((item, index) => (
            <option key={`role-manager-${item}-${index}`} value={item}>
              {formatRole(item)}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => updateRole(role)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071d3a] px-5 py-3 font-black text-white">
          <ShieldCheck size={18} />
          {t("action.save")}
        </button>
      </div>

      {user.proof_url && (
        <a href={user.proof_url} target="_blank" rel="noreferrer" className="mt-4 block text-sm font-black text-[#0f5f3a]">
          {t("admin.teacherProof")}
        </a>
      )}
      {status && <p className="mt-3 text-sm font-bold text-slate-500">{status}</p>}
    </section>
  );
}
