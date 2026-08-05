import type { GansekouRole } from "@/types/user";

export type NavigationTitle = {
  title: string;
  mobileTitle?: string;
};

export const navigationTitles: Record<string, NavigationTitle> = {
  /* ===========================
     ETUDIANT
  =========================== */

  "/dashboard": {
    title: "Tableau de bord",
    mobileTitle: "Dashboard",
  },

  "/courses": {
    title: "Cours",
  },

  "/exercises": {
    title: "Exercices",
  },

  "/subjects": {
    title: "Matières",
  },

  "/quizzes": {
    title: "Quiz",
  },

  "/questions": {
    title: "Mes questions",
  },

  "/analytics": {
    title: "Statistiques",
  },

  "/notifications": {
    title: "Notifications",
  },

  "/premium": {
    title: "Abonnement",
  },

  "/settings": {
    title: "Paramètres",
  },

  "/profile": {
    title: "Mon profil",
  },

  "/ai": {
    title: "Kouma IA",
  },

  /* ===========================
     ENSEIGNANT
  =========================== */

  "/teacher/dashboard": {
    title: "Tableau enseignant",
    mobileTitle: "Dashboard",
  },

  "/teacher/subjects": {
    title: "Mes matières",
  },

  "/teacher/contents": {
    title: "Mes contenus",
  },

  "/teacher/contents/new": {
    title: "Créer un contenu",
  },

  "/teacher/questions/pending": {
    title: "Questions élèves",
  },

  "/teacher/questions/assigned": {
    title: "Mes réponses",
  },

  /* ===========================
     ADMIN
  =========================== */

  "/admin/dashboard": {
    title: "Administration",
  },

  "/admin/users": {
    title: "Utilisateurs",
  },

  "/admin/contents": {
    title: "Validation contenus",
  },

  "/admin/payments": {
    title: "Paiements",
  },

  "/admin/education": {
    title: "Éducation",
  },
};

/* =======================================================
   Retourne le titre correspondant à une route
======================================================= */

export function getNavigationTitle(pathname: string): NavigationTitle {
  if (navigationTitles[pathname]) {
    return navigationTitles[pathname];
  }

  const keys = Object.keys(navigationTitles).sort(
    (a, b) => b.length - a.length
  );

  for (const key of keys) {
    if (pathname.startsWith(key + "/")) {
      return navigationTitles[key];
    }
  }

  return {
    title: "GANSEKOU",
    mobileTitle: "GANSEKOU",
  };
}

/* =======================================================
   Dashboard par rôle
======================================================= */

export function getDashboardRoute(role?: GansekouRole): string {
  switch (role) {
    case "ADMIN":
    case "ADMINISTRATEUR":
    case "PROMOTEUR":
      return "/admin/dashboard";

    case "ENSEIGNANT":
    case "ENSEIGNANT_EN_ATTENTE":
      return "/teacher/dashboard";

    default:
      return "/dashboard";
  }
}
