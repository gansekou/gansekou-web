
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import {
  userService,
  type AdminUserSubscriptionStatus,
} from "@/services/user.service";

type Props = {
  userId: string;
  onActivated?: () => Promise<void> | void;
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Impossible de récupérer les informations d’abonnement.";
}

export function UserSubscriptionManager({
  userId,
  onActivated,
}: Props) {
  const currentUser = useAuthStore((state) => state.user);

  const [period, setPeriod] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [subscription, setSubscription] =
    useState<AdminUserSubscriptionStatus | null>(null);

  const refreshStatus = useCallback(async () => {
    setLoadingStatus(true);
    setStatusError(null);

    try {
      const result = await userService.adminGetSubscriptionStatus(userId);
      setSubscription(result);
    } catch (cause) {
      setSubscription(null);
      setStatusError(getErrorMessage(cause));
    } finally {
      setLoadingStatus(false);
    }
  }, [userId]);

  useEffect(() => {
    if (currentUser?.role === "PROMOTEUR") {
      void refreshStatus();
    }
  }, [currentUser?.role, refreshStatus]);

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

      setMessage(
        `Abonnement activé. Nouvelle échéance : ${formatDate(result.expires_at)}.`,
      );

      await refreshStatus();
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

  const activeSubscription =
    subscription?.is_premium && subscription.subscription
      ? subscription.subscription
      : null;

  return (
    <section className="ds-card rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <ShieldCheck size={22} />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f5f3a]">
              Abonnement
            </p>

            <h3 className="mt-1 text-2xl font-black text-[#071d3a]">
              Statut Premium
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Informations réservées au promoteur.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void refreshStatus()}
          disabled={loadingStatus}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loadingStatus ? "animate-spin" : ""}
          />
          Actualiser
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
        {loadingStatus ? (
          <p className="text-sm font-semibold text-slate-500">
            Chargement du statut Premium…
          </p>
        ) : statusError ? (
          <div role="alert">
            <p className="font-bold text-red-700">
              Statut Premium indisponible
            </p>
            <p className="mt-1 text-sm text-red-600">{statusError}</p>
            <p className="mt-2 text-sm text-slate-500">
              Actualise les informations avant de te fier au statut.
            </p>
          </div>
        ) : activeSubscription ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Crown size={20} className="text-amber-500" />
              <span className="font-black text-emerald-700">
                Abonné Premium
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                ACTIF
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Formule
                </p>
                <p className="mt-1 font-black text-slate-800">
                  {activeSubscription.plan_name || "Premium"}
                  {activeSubscription.period
                    ? ` — ${activeSubscription.period === "year" ? "Annuel" : activeSubscription.period === "month" ? "Mensuel" : activeSubscription.period}`
                    : ""}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Temps restant
                </p>
                <p className="mt-1 flex items-center gap-2 font-black text-slate-800">
                  <Clock3 size={17} />
                  {subscription.remaining_days} jour
                  {subscription.remaining_days > 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Expiration de l’abonnement
                </p>
                <p className="mt-1 font-black text-slate-800">
                  {formatDate(activeSubscription.expires_at)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Début de l’abonnement
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {formatDate(activeSubscription.starts_at)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Renouvellement automatique
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {activeSubscription.auto_renew ? "Activé" : "Désactivé"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <XCircle size={22} className="mt-0.5 text-slate-400" />
            <div>
              <p className="font-black text-slate-800">
                Pas d’abonnement Premium actif
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Cet utilisateur ne possède actuellement aucun abonnement
                Premium valide.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h4 className="text-lg font-black text-[#071d3a]">
          Activer ou prolonger l’abonnement
        </h4>

        <p className="mt-2 text-sm text-slate-600">
          La durée sélectionnée sera ajoutée à l’échéance actuelle si
          l’abonnement est encore valide.
        </p>

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
          disabled={loading || loadingStatus || Boolean(statusError)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f5f3a] px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <CalendarDays size={18} className="animate-pulse" />
          ) : (
            <CheckCircle2 size={18} />
          )}

          {loading ? "Activation en cours…" : "Valider l’activation"}
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
      </div>
    </section>
  );
}
