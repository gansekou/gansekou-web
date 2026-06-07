"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Brain,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Home,
  LogOut,
  MessageCircleQuestion,
  School,
  Settings,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { GansekouLogo } from "@/components/ui/GansekouLogo";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { OfflineStatus } from "@/components/ui/OfflineStatus";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useI18n } from "@/hooks/useI18n";
import { useNotifications } from "@/hooks/useNotifications";
import {
  canAnswerStudentQuestions,
  canAccessTeacherStudio,
  isAdminRole,
} from "@/lib/permissions";
import type { TranslationKey } from "@/types/i18n";
import type { User } from "@/types/user";

type NavItem = { key: TranslationKey; href: string; icon: React.ComponentType<{ size?: number }> };

const studentNavItems: NavItem[] = [
  { key: "nav.home", href: "/dashboard", icon: Home },
  { key: "nav.courses", href: "/courses", icon: BookOpen },
  { key: "nav.exercises", href: "/exercises", icon: ClipboardList },
  { key: "nav.subjects", href: "/subjects", icon: School },
  { key: "nav.quizzes", href: "/quizzes", icon: Trophy },
  { key: "nav.aiQuestions", href: "/ai", icon: Brain },
  { key: "nav.myQuestions", href: "/questions", icon: MessageCircleQuestion },
  { key: "nav.stats", href: "/analytics", icon: BarChart3 },
  { key: "nav.notifications", href: "/notifications", icon: Bell },
  { key: "nav.premium", href: "/premium", icon: CreditCard },
  { key: "nav.settings", href: "/settings", icon: Settings },
];

const teacherNavItems: NavItem[] = [
  { key: "nav.dashboard", href: "/teacher/dashboard", icon: Home },
  { key: "nav.pendingQuestions", href: "/teacher/questions/pending", icon: MessageCircleQuestion },
  { key: "nav.assignedQuestions", href: "/teacher/questions/assigned", icon: CheckCircle2 },
  { key: "nav.mySubjects", href: "/teacher/subjects", icon: BookOpen },
  { key: "nav.myContents", href: "/teacher/contents", icon: BookOpen },
  { key: "nav.createContent", href: "/teacher/contents/new", icon: Brain },
  { key: "nav.stats", href: "/analytics", icon: BarChart3 },
  { key: "nav.notifications", href: "/notifications", icon: Bell },
  { key: "nav.settings", href: "/settings", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { key: "nav.dashboard", href: "/admin/dashboard", icon: Home },
  { key: "nav.users", href: "/admin/users", icon: Users },
  { key: "nav.courses", href: "/courses", icon: BookOpen },
  { key: "nav.exercises", href: "/exercises", icon: ClipboardList },
  { key: "nav.subjects", href: "/subjects", icon: School },
  { key: "nav.quizzes", href: "/quizzes", icon: Trophy },
  { key: "nav.reviewContents", href: "/admin/contents", icon: Shield },
  { key: "nav.education", href: "/admin/education", icon: BookOpen },
  { key: "nav.payments", href: "/admin/payments", icon: CreditCard },
  { key: "nav.stats", href: "/analytics", icon: BarChart3 },
  { key: "nav.notifications", href: "/notifications", icon: Bell },
  { key: "nav.settings", href: "/settings", icon: Settings },
];

type DashboardShellProps = {
  children: React.ReactNode;
  user?: User | null;
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, t, formatRole } = useI18n(user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [loggingOut, setLoggingOut] = useState(false);
  const { unreadCount } = useNotifications(Boolean(user), 60000);
  const displayName =
    [user?.prenom, user?.nom].filter(Boolean).join(" ") || "Gansekou";
  const navItems =
    user && isAdminRole(user)
        ? adminNavItems
      : user && canAccessTeacherStudio(user)
        ? teacherNavItems.filter((item) =>
            canAnswerStudentQuestions(user) ||
            !["/teacher/questions/pending", "/teacher/questions/assigned"].includes(item.href)
          )
        : studentNavItems;

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("gansekou_theme");
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      clearSession();
      await authService.logout();
    } catch (error) {
      console.error("[dashboard] logout error", error);
      clearSession();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf5] text-[#082f1f]">
      <OfflineStatus label={language === "EN" ? "Offline mode: your current work is kept locally until sync returns." : "Mode hors ligne : votre travail en cours reste local jusqu'a la synchronisation."} />
      <div className="fixed inset-0 gansekou-pattern opacity-40" />

      <div className="relative grid min-h-screen lg:grid-cols-[290px_1fr]">
        <aside className="hidden border-r border-[#0f5f3a]/10 bg-white/80 p-6 backdrop-blur-xl lg:block">
          <GansekouLogo href="/" variant="full" size="large" />

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={`desktop-${item.key}-${item.href}`}
                  href={item.href}
                  className={`premium-action flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition ${
                    isActive
                      ? "bg-[#0f5f3a] text-white shadow-lg shadow-[#0f5f3a]/20"
                      : "text-slate-600 hover:bg-[#0f5f3a] hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-[2rem] bg-[#082f1f] p-5 text-white shadow-2xl shadow-[#082f1f]/15">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6c445] text-[#082f1f]">
              <Shield size={24} />
            </div>
            <p className="text-lg font-black">{t("premium.brand")}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              {t("premium.sidebar")}
            </p>
            <Link
              href="/premium"
              className="mt-5 inline-flex w-full justify-center rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#082f1f]"
            >
              {t("premium.cta")}
            </Link>
          </div>

          <LoadingButton
            onClick={handleLogout}
            loading={loggingOut}
            loadingLabel={language === "EN" ? "Signing out..." : "Deconnexion..."}
            variant="ghost"
            className="mt-8 w-full justify-start px-4 py-3 text-red-600 hover:bg-red-50"
          >
            {!loggingOut && <LogOut size={20} />}
            {t("auth.logout")}
          </LoadingButton>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#0f5f3a]/10 bg-[#f8faf5]/80 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f5f3a]">
                  {formatRole(user?.role)}
                </p>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  {t("dashboard.welcome")}, {displayName}
                </h1>
              </div>

              <div className="flex flex-1 items-center justify-end gap-3">
                <GlobalSearch placeholder={t("search.placeholder")} />
                <Link
                  href="/notifications"
                  className="premium-action relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"
                  aria-label={t("nav.notifications")}
                >
                  <Bell size={20} />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#d94b2b] px-1.5 py-0.5 text-center text-[10px] font-black text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </Link>
                <UserAvatar name={displayName} src={user?.profile_url} />
                <Link
                  href="/settings"
                  className="premium-action flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"
                >
                  <Settings size={20} />
                </Link>
                <LoadingButton
                  onClick={handleLogout}
                  loading={loggingOut}
                  variant="secondary"
                  className="h-12 w-12 rounded-2xl bg-white p-0 text-red-600 shadow-sm lg:hidden"
                  aria-label={t("auth.logout")}
                >
                  {!loggingOut && <LogOut size={20} />}
                </LoadingButton>
              </div>
            </div>
          </header>

          <div className="px-4 pb-28 pt-5 md:p-6 lg:pb-6">
            {children}
          </div>
        </section>
      </div>
      <nav className="mobile-safe-bottom fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-[1.5rem] border border-slate-200 bg-white/92 p-2 shadow-2xl shadow-[#071d3a]/15 backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={`mobile-${item.key}-${item.href}`}
              href={item.href}
              aria-label={t(item.key)}
              className={`premium-action flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-black transition ${
                isActive ? "bg-[#071d3a] text-white" : "text-slate-500"
              }`}
            >
              <Icon size={19} />
              <span className="max-w-full truncate">{t(item.key).split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
