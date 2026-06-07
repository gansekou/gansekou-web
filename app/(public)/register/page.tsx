"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Globe2,
  Lock,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { AuthShell } from "@/components/layouts/AuthShell";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const text = {
  fr: {
    title: "Créer un compte",
    subtitle:
      "Rejoins Gansekou et commence à apprendre avec une plateforme pensée pour ta réussite.",
    nom: "Nom",
    prenom: "Prénom",
    email: "Adresse email",
    phone: "Téléphone",
    genre: "Genre",
    age: "Âge",
    password: "Mot de passe",
    register: "Créer mon compte",
    google: "Continuer avec Google",
    already: "Déjà inscrit ?",
    login: "Se connecter",
    loading: "Création du compte...",
    male: "Masculin",
    female: "Féminin",
    other: "Autre",
  },
  en: {
    title: "Create account",
    subtitle:
      "Join Gansekou and start learning with a platform built for your success.",
    nom: "Last name",
    prenom: "First name",
    email: "Email address",
    phone: "Phone",
    genre: "Gender",
    age: "Age",
    password: "Password",
    register: "Create my account",
    google: "Continue with Google",
    already: "Already registered?",
    login: "Login",
    loading: "Creating account...",
    male: "Male",
    female: "Female",
    other: "Other",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [language, setLanguage] = useState<"fr" | "en">("fr");

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    genre: "",
    age: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);

  const t = text[language];

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading("email");

    try {
      const session = await authService.registerEmail({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email.trim(),
        phone: form.phone,
        genre: form.genre,
        age: Number(form.age),
        password: form.password,
        preferred_language: language === "fr" ? "FR" : "EN",
        role: "ELEVE",
      });

      setSession({
        user: session.user,
        token: session.token,
      });

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          language === "fr"
            ? "Création du compte impossible. Vérifie tes informations."
            : "Unable to create account. Please check your information."
        );
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

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        language === "fr"
          ? "Connexion Google impossible. Réessaie."
          : "Google login failed. Please try again."
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <AuthShell title={t.title} subtitle={t.subtitle}>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
          className="premium-action inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#082f1f] shadow-sm"
        >
          <Globe2 size={16} />
          {language === "fr" ? "EN" : "FR"}
        </button>
      </div>

      <LoadingButton
        type="button"
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

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#082f1f]">
              {t.prenom}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <UserRound size={20} className="text-slate-400" />
              <input
                required
                placeholder="Marcel"
                className="w-full bg-transparent outline-none"
                value={form.prenom}
                onChange={(event) => updateField("prenom", event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#082f1f]">
              {t.nom}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <UserRound size={20} className="text-slate-400" />
              <input
                required
                placeholder="Pouomegne"
                className="w-full bg-transparent outline-none"
                value={form.nom}
                onChange={(event) => updateField("nom", event.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#082f1f]">
            {t.email}
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Mail size={20} className="text-slate-400" />
            <input
              type="email"
              required
              placeholder="user@example.com"
              className="w-full bg-transparent outline-none"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-[#082f1f]">
            {t.phone}
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Phone size={20} className="text-slate-400" />
            <input
              required
              placeholder="+237 6XX XXX XXX"
              className="w-full bg-transparent outline-none"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#082f1f]">
              {t.genre}
            </label>
            <select
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold outline-none"
              value={form.genre}
              onChange={(event) => updateField("genre", event.target.value)}
            >
              <option value="">---</option>
              <option value="MASCULIN">{t.male}</option>
              <option value="FEMININ">{t.female}</option>
              <option value="AUTRE">{t.other}</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#082f1f]">
              {t.age}
            </label>
            <input
              type="number"
              min={5}
              max={100}
              required
              placeholder="18"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold outline-none"
              value={form.age}
              onChange={(event) => updateField("age", event.target.value)}
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
              minLength={6}
              placeholder="••••••••"
              className="w-full bg-transparent outline-none"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
          </div>
        </div>

        <input type="hidden" name="role" value="ELEVE" />

        <LoadingButton
          type="submit"
          disabled={loading !== null}
          loading={loading === "email"}
          loadingLabel={t.loading}
          variant="primary"
          className="group w-full px-6 py-4"
        >
          {t.register}
          {loading !== "email" ? (
            <ArrowRight
              size={20}
              className="transition group-hover:translate-x-1"
            />
          ) : null}
        </LoadingButton>

        <p className="text-center text-sm text-slate-600">
          {t.already}{" "}
          <Link href="/login" className="font-black text-[#0f5f3a]">
            {t.login}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
