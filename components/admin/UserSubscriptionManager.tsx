
"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, ShieldCheck } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { userService } from "@/services/user.service";

type Props = {
  userId: string;
  onActivated?: () => Promise<void> | void;
};

export function UserSubscriptionManager({
  userId,
  onActivated,
}: Props) {
  const currentUser = useAuthStore((state) => state.user);

  const [period, setPeriod] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  if (currentUser?.role !== "PROMOTEUR") {
    return null;
  }

  async function activateSubscription() {
    const confirmed = window.confirm(
      period === "month"
        ? "Confirmer l’activation d’un abonnement mensuel de 30 jours pour cet utilisateur ?"
        : "Confirmer l’activation d’un abonnement annuel de 365 jours pour cet utilisateur ?",
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage(null);
    setError(false);

    try {
      const result = await userService.adminActivateSubscription(
        userId,
        period,
      );

      const expiration = new Date(result.expires_at).toLocaleDateString(
        "fr-FR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        },
      );

      setMessage(
        `Abonnement activé avec succès. Nouvelle échéance : ${expiration}.`,
      );

      await onActivated?.();
    } catch (cause) {
      setError(true);

      setMessage(
        cause instanceof ApiError
          ? cause.message
          : "Impossible d’activer l’abonnement.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ds-card rounded-[2rem] p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          <ShieldCheck size={22} />
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f5f3a]">
            Abonnement
          </p>

          <h3 className="mt-1 text-2xl font-black text-[#071d3a]">
            Activer un abonnement
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Réservé au promoteur. La durée s’ajoute à l’échéance
            actuelle si l’abonnement est encore actif.
          </p>
        </div>
      </div>

      <label
        htmlFor="admin-subscription-period"
        className="mt-5 block text-sm font-bold text-slate-700"
      >
        Type d’abonnement
      </label>

      <select
        id="admin-subscription-period"
        value={period}
        onChange={(event) =>
          setPeriod(event.target.value as "month" | "year")
        }
        disabled={loading}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
      >
        <option value="month">Mensuel — 30 jours</option>
        <option value="year">Annuel — 365 jours</option>
      </select>

      <button
        type="button"
        onClick={activateSubscription}
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f5f3a] px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <CalendarDays size={18} className="animate-pulse" />
        ) : (
          <CheckCircle2 size={18} />
        )}

        {loading
          ? "Activation en cours…"
          : "Valider l’activation"}
      </button>

      {message && (
        <p
          role={error ? "alert" : "status"}
          className={`mt-3 text-sm font-bold ${
            error ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
