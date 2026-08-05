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
    href: "/dashboard",
    icon: Home,
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
    key: "nav.quizzes",
    href: "/quizzes",
    icon: Trophy,
  },
  {
    key: "nav.aiQuestions",
    href: "/ai",
    icon: Brain,
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
  {
    key: "nav.aiQuestions",
    href: "/ai",
    icon: Brain,
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
