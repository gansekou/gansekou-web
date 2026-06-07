"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe2, Lock, Mail } from "lucide-react";
import { AuthShell } from "@/components/layouts/AuthShell";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { AuthTokenMissingError, BackendProfileMissingError, authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const text = {
  fr: {
    title: "Connexion",
    subtitle: "Connecte-toi à ton espace Gansekou pour continuer ton apprentissage.",
    email: "Adresse email",
    password: "Mot de passe",
    login: "Se connecter",
    google: "Continuer avec Google",
    noAccount: "Pas encore de compte ?",
    register: "Créer un compte",
    loading: "Connexion en cours...",
    invalid: "Email ou mot de passe incorrect.",
    network: "Connexion reseau impossible. Verifiez votre connexion puis reessayez.",
    googleError: "Connexion Google impossible.",
  },
  en: {
    title: "Login",
    subtitle: "Sign in to your Gansekou account and continue learning.",
    email: "Email address",
    password: "Password",
    login: "Login",
    google: "Continue with Google",
    noAccount: "No account yet?",
    register: "Create account",
    loading: "Signing in...",
    invalid: "Invalid email or password.",
    network: "Network connection failed. Check your connection and try again.",
    googleError: "Google login failed.",
  },
};

function authLog(message: string) {
  if (process.env.NODE_ENV !== "production") console.info(message);
}

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);

  const t = text[language];

  async function handleEmailLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading("email");

    try {
      const session = await authService.loginWithEmail(email, password, {
        preferred_language: language === "fr" ? "FR" : "EN",
        role: "ELEVE",
      });

      setSession({
        user: session.user,
        token: session.token,
      });
      authLog("[login-email] setSession done");

      authLog("[login-email] redirect dashboard");
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(resolveAuthError(err, t));
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogleLogin() {
    if (loading) return;
    setError("");
    setLoading("google");

    try {
      const session = await authService.loginWithGoogle({
        preferred_language: language === "fr" ? "FR" : "EN",
        role: "ELEVE",
      });

      setSession({
        user: session.user,
        token: session.token,
      });
      authLog("[login-google] setSession done");

      authLog("[login-google] redirect dashboard");
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);

      setError(resolveAuthError(err, t, t.googleError));
    } finally {
      setLoading(null);
    }
  }

  return (
    <AuthShell title={t.title} subtitle={t.subtitle}>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
          className="premium-action inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#082f1f] shadow-sm"
        >
          <Globe2 size={16} />
          {language === "fr" ? "EN" : "FR"}
        </button>
      </div>

      <LoadingButton
        onClick={handleGoogleLogin}
        disabled={loading !== null}
        loading={loading === "google"}
        loadingLabel={t.loading}
        variant="secondary"
        className="mb-5 w-full px-6 py-4"
      >
        {loading !== "google" ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f6c445] text-xs font-black">
            G
          </span>
        ) : null}
        {t.google}
      </LoadingButton>

      <div className="mb-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Email
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#082f1f]">
            {t.email}
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Mail size={20} className="text-slate-400" />
            <input
              type="email"
              required
              placeholder="exemple@email.com"
              className="w-full bg-transparent outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#082f1f]">
            {t.password}
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Lock size={20} className="text-slate-400" />
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-transparent outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>

        <LoadingButton
          type="submit"
          disabled={loading !== null}
          loading={loading === "email"}
          loadingLabel={t.loading}
          variant="primary"
          className="group w-full px-6 py-4"
        >
          {t.login}
          {loading !== "email" ? (
            <ArrowRight size={20} className="transition group-hover:translate-x-1" />
          ) : null}
        </LoadingButton>

        <p className="text-center text-sm text-slate-600">
          {t.noAccount}{" "}
          <Link href="/register" className="font-black text-[#0f5f3a]">
            {t.register}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function resolveAuthError(
  error: unknown,
  labels: typeof text.fr,
  fallback = labels.invalid
) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code.includes("network-request-failed")) return labels.network;
  if (code.includes("popup-closed-by-user")) return "Connexion Google annulee.";
  if (code.includes("cancelled-popup-request")) return "Une connexion Google est deja en cours.";
  if (code.includes("unauthorized-domain")) return "Domaine non autorise dans Firebase Authentication.";
  if (
    code.includes("invalid-credential") ||
    code.includes("wrong-password") ||
    code.includes("user-not-found")
  ) {
    return labels.invalid;
  }

  if (error instanceof AuthTokenMissingError) {
    return "Connexion Firebase reussie, mais le token de session est indisponible. Reessayez.";
  }

  if (error instanceof BackendProfileMissingError) {
    return error.message;
  }

  return fallback;
}
