"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Download,
  MessageCircleQuestion,
  Plus,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { canAccessTeacherStudio, isAdminRole } from "@/lib/permissions";
import type { User } from "@/types/user";

type NativeExperienceLayerProps = {
  user?: User | null;
  language: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function NativeExperienceLayer({ user, language }: NativeExperienceLayerProps) {
  const pathname = usePathname();
  const labels = nativeLabels(language);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const actions = useMemo(() => quickActions(user, labels), [labels, user]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
  }

  return (
    <>
      <div
        key={pathname}
        className="route-progress fixed left-0 top-0 z-[70] h-1 bg-[linear-gradient(90deg,#f6c445,#26b37a,#60a5fa)]"
        aria-hidden="true"
      />

      {installPrompt && (
        <button
          type="button"
          onClick={installApp}
          className="fixed bottom-24 left-4 z-50 hidden items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-3 text-sm font-black text-[#071d3a] shadow-2xl shadow-[#071d3a]/15 backdrop-blur-xl md:inline-flex"
        >
          <Download size={17} />
          {labels.install}
        </button>
      )}

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#f6c445] text-[#071d3a] shadow-2xl shadow-[#f6c445]/30 transition hover:-translate-y-1 lg:bottom-7"
        aria-label={labels.openActions}
      >
        <Plus size={25} />
      </button>

      {sheetOpen && (
        <div className="fixed inset-0 z-[80] bg-[#071d3a]/30 backdrop-blur-sm" role="presentation" onClick={() => setSheetOpen(false)}>
          <section
            className="mobile-safe-bottom absolute inset-x-0 bottom-0 rounded-t-[2rem] border border-white/70 bg-white/95 p-5 shadow-2xl shadow-[#071d3a]/20 backdrop-blur-xl md:bottom-6 md:left-auto md:right-6 md:w-[25rem] md:rounded-[2rem]"
            role="dialog"
            aria-modal="true"
            aria-label={labels.openActions}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0f5f3a]">{labels.context}</p>
                <h2 className="text-xl font-black text-[#071d3a]">{labels.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#071d3a]"
                aria-label={labels.close}
              >
                <X size={19} />
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {actions.map((action) => (
                <Link
                  key={`quick-action-${action.href}-${action.label}`}
                  href={action.href}
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-[#f6c445] hover:bg-white"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0f5f3a] shadow-sm">
                    <action.icon size={20} />
                  </span>
                  <span>
                    <span className="block font-black text-[#071d3a]">{action.label}</span>
                    <span className="mt-1 block text-sm font-bold text-slate-500">{action.detail}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function quickActions(user: User | null | undefined, labels: ReturnType<typeof nativeLabels>) {
  if (user && isAdminRole(user)) {
    return [
      { href: "/admin/users", label: labels.users, detail: labels.usersDetail, icon: Sparkles },
      { href: "/admin/contents/review", label: labels.review, detail: labels.reviewDetail, icon: BookOpen },
      { href: "/admin/stats", label: labels.analytics, detail: labels.analyticsDetail, icon: Trophy },
    ];
  }

  if (user && canAccessTeacherStudio(user)) {
    return [
      { href: "/teacher/contents/new", label: labels.createContent, detail: labels.createContentDetail, icon: BookOpen },
      { href: "/teacher/questions/pending", label: labels.answer, detail: labels.answerDetail, icon: MessageCircleQuestion },
      { href: "/teacher/performance", label: labels.performance, detail: labels.performanceDetail, icon: Trophy },
    ];
  }

  return [
    { href: "/ai", label: labels.askKouma, detail: labels.askKoumaDetail, icon: Brain },
    { href: "/quizzes", label: labels.quiz, detail: labels.quizDetail, icon: Trophy },
    { href: "/courses", label: labels.continue, detail: labels.continueDetail, icon: BookOpen },
  ];
}

function nativeLabels(language: string) {
  const fr = language !== "EN";
  return {
    install: fr ? "Installer Gansekou" : "Install Gansekou",
    openActions: fr ? "Ouvrir les actions rapides" : "Open quick actions",
    close: fr ? "Fermer" : "Close",
    context: fr ? "Actions rapides" : "Quick actions",
    title: fr ? "Continuer sans friction" : "Continue without friction",
    askKouma: fr ? "Demander a Kouma" : "Ask Kouma",
    askKoumaDetail: fr ? "Recevoir une explication adaptee." : "Get an adaptive explanation.",
    quiz: fr ? "Lancer un quiz" : "Start a quiz",
    quizDetail: fr ? "S'entrainer avec feedback instantane." : "Practice with instant feedback.",
    continue: fr ? "Continuer un cours" : "Continue a course",
    continueDetail: fr ? "Reprendre la prochaine ressource." : "Resume the next resource.",
    createContent: fr ? "Creer un contenu" : "Create content",
    createContentDetail: fr ? "Publier une ressource premium." : "Publish a premium resource.",
    answer: fr ? "Repondre aux eleves" : "Answer learners",
    answerDetail: fr ? "Traiter les questions prioritaires." : "Handle priority questions.",
    performance: fr ? "Voir l'impact" : "View impact",
    performanceDetail: fr ? "XP, vues et progression eleves." : "XP, views and learner progress.",
    users: fr ? "Piloter les utilisateurs" : "Manage users",
    usersDetail: fr ? "Roles, validations et activite." : "Roles, approvals and activity.",
    review: fr ? "Reviser les contenus" : "Review content",
    reviewDetail: fr ? "Moderation et publication." : "Moderation and publishing.",
    analytics: fr ? "Analytics live" : "Live analytics",
    analyticsDetail: fr ? "Sante, activite et croissance." : "Health, activity and growth.",
  };
}
