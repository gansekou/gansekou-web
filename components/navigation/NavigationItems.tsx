"use client";

import type { ComponentType } from "react";
import type { TranslationKey } from "@/types/i18n";
import type { User } from "@/types/user";
import {
  Home,
  BookOpen,
  ClipboardList,
  Trophy,
  Brain,
  CreditCard,
  User as UserIcon,
  Settings,
  LogOut,
  School,
  Bell,
  BarChart3,
  Users,
  Shield,
  CheckCircle2,
  MessageCircleQuestion,
  PenSquare,
  LayoutDashboard,
  FileText,
  HelpCircle,
} from "lucide-react";

import {
  isAdminRole,
  canAccessTeacherStudio,
  canAnswerStudentQuestions,
} from "@/lib/permissions";

export type NavigationItem = {
  key: TranslationKey | string;
  href?: string;
  icon: ComponentType<{ size?: number }>;
  divider?: boolean;
  danger?: boolean;
};

export type NavigationSection = {
  id: string;
  items: NavigationItem[];
};

/* ============================================================
   ELEVE
============================================================ */

const studentMain: NavigationItem[] = [
  {
    key: "nav.home",
    href: "/",
    icon: Home,
  },
  {
    key: "nav.dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "nav.courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    key: "nav.exercises",
    href: "/exercises",
    icon: ClipboardList,
  },
  {
    key: "nav.epreuves",
    href: "/subjects",
    icon: FileText,
  }
  {
    key: "nav.quizzes",
    href: "/quizzes",
    icon: Trophy,
  },
  {
    key: "nav.myQuestions",
    href: "/questions",
    icon: HelpCircle,
  },
  {
    key: "nav.premium",
    href: "/premium",
    icon: CreditCard,
  },
];

const studentBottom: NavigationItem[] = [
  {
    key: "Profil",
    href: "/profile",
    icon: UserIcon,
  },
  {
    key: "nav.settings",
    href: "/settings",
    icon: Settings,
  },
  {
    key: "Déconnexion",
    icon: LogOut,
    danger: true,
  },
];

/* ============================================================
   ENSEIGNANT
============================================================ */

const teacherMain: NavigationItem[] = [
  {
    key: "nav.dashboard",
    href: "/teacher/dashboard",
    icon: Home,
  },
  {
    key: "nav.mySubjects",
    href: "/teacher/subjects",
    icon: School,
  },
  {
    key: "nav.myContents",
    href: "/teacher/contents",
    icon: BookOpen,
  },
  {
    key: "nav.createContent",
    href: "/teacher/contents/new",
    icon: PenSquare,
  },
  {
    key: "nav.quizzes",
    href: "/quizzes",
    icon: Trophy,
  },
];

if (true) {
    teacherMain.push({
        key: "nav.pendingQuestions",
        href: "/teacher/questions/pending",
        icon: MessageCircleQuestion,
    });

    teacherMain.push({
        key: "nav.assignedQuestions",
        href: "/teacher/questions/assigned",
        icon: CheckCircle2,
    });
}

teacherMain.push(
    {
        key: "nav.stats",
        href: "/analytics",
        icon: BarChart3,
    },
    {
        key: "nav.notifications",
        href: "/notifications",
        icon: Bell,
    }
);

const teacherBottom: NavigationItem[] = [
  {
    key: "Profil",
    href: "/profile",
    icon: UserIcon,
  },
  {
    key: "nav.settings",
    href: "/settings",
    icon: Settings,
  },
  {
    key: "Déconnexion",
    icon: LogOut,
    danger: true,
  },
];

/* ============================================================
   ADMIN / ADMINISTRATEUR / PROMOTEUR
============================================================ */

const adminMain: NavigationItem[] = [
  {
    key: "nav.dashboard",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    key: "nav.users",
    href: "/admin/users",
    icon: Users,
  },
  {
    key: "nav.courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    key: "nav.exercises",
    href: "/exercises",
    icon: ClipboardList,
  },
  {
    key: "nav.subjects",
    href: "/subjects",
    icon: School,
  },
  {
    key: "nav.quizzes",
    href: "/quizzes",
    icon: Trophy,
  },
  {
    key: "nav.reviewContents",
    href: "/admin/contents",
    icon: Shield,
  },
  {
    key: "nav.education",
    href: "/admin/education",
    icon: BookOpen,
  },
  {
    key: "nav.payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    key: "nav.stats",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    key: "nav.notifications",
    href: "/notifications",
    icon: Bell,
  },
];

const adminBottom: NavigationItem[] = [
  {
    key: "Profil",
    href: "/profile",
    icon: UserIcon,
  },
  {
    key: "nav.settings",
    href: "/settings",
    icon: Settings,
  },
  {
    key: "Déconnexion",
    icon: LogOut,
    danger: true,
  },
];

/* ============================================================
   HELPERS
============================================================ */

function getTeacherNavigation(user: User): NavigationSection[] {
  const items = [...teacherMain];

  if (!canAnswerStudentQuestions(user)) {
    return [
      {
        id: "main",
        items: items.filter(
          (item) =>
            item.href !== "/teacher/questions/pending" &&
            item.href !== "/teacher/questions/assigned"
        ),
      },
      {
        id: "bottom",
        items: teacherBottom,
      },
    ];
  }

  return [
    {
      id: "main",
      items,
    },
    {
      id: "bottom",
      items: teacherBottom,
    },
  ];
}

/* ============================================================
   PUBLIC API
============================================================ */

export function getNavigation(user?: User | null): NavigationSection[] {
  if (!user) {
    return [
      {
        id: "main",
        items: studentMain,
      },
      {
        id: "bottom",
        items: studentBottom,
      },
    ];
  }

  if (isAdminRole(user)) {
    return [
      {
        id: "main",
        items: adminMain,
      },
      {
        id: "bottom",
        items: adminBottom,
      },
    ];
  }

  if (canAccessTeacherStudio(user)) {
    return getTeacherNavigation(user);
  }

  return [
    {
      id: "main",
      items: studentMain,
    },
    {
      id: "bottom",
      items: studentBottom,
    },
  ];
}

/* ============================================================
   EXPORTS
============================================================ */

export {
  studentMain,
  teacherMain,
  adminMain,
  studentBottom,
  teacherBottom,
  adminBottom,
};
