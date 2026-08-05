"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, Settings } from "lucide-react";

import { UserAvatar } from "@/components/ui/UserAvatar";
import { GlobalSearch } from "@/components/search/GlobalSearch";

import { useI18n } from "@/hooks/useI18n";
import { useNotifications } from "@/hooks/useNotifications";

import type { User } from "@/types/user";
import { getNavigationTitle } from "./NavigationTitles";


type DashboardHeaderProps = {
  user?: User | null;
  onOpenDrawer: () => void;
};

export function DashboardHeader({
  user,
  onOpenDrawer,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  const { t } = useI18n(user);

  const { unreadCount } = useNotifications(Boolean(user), 60000);

  const displayName =
    [user?.prenom, user?.nom]
      .filter(Boolean)
      .join(" ") || "Gansekou";

  const { title, mobileTitle } =
    getNavigationTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-[#0f5f3a]/10 bg-[#f8faf5]/90 backdrop-blur-xl">

      <div className="flex h-16 items-center justify-between px-4 lg:h-20 lg:px-8">

        {/* MOBILE */}

        <div className="flex items-center gap-3 lg:hidden">

          <button
            onClick={onOpenDrawer}
            className="rounded-xl p-2 transition hover:bg-slate-100 active:scale-95"
          >
            <Menu
                size={24}
                className={`transition-transform duration-300 ${
                    drawerOpen ? "rotate-90" : ""
                }`}
            />
          </button>

          <h1 className="max-w-[180px] truncate text-lg font-black">
              {mobileTitle ?? title}
          </h1>

        </div>

        {/* DESKTOP */}

        <div className="hidden lg:block">

          <p className="text-xs font-bold uppercase tracking-widest text-[#0f5f3a]">
            GANSEKOU
          </p>

          <h1 className="text-2xl font-black">
            {t("dashboard.welcome")}, {displayName}
          </h1>

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-3">

          <div className="hidden xl:block w-96">

            <GlobalSearch
              placeholder={t("search.placeholder")}
            />

          </div>

          <Link
            href="/notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <Bell size={20} />

            {unreadCount > 0 && (

              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">

                {unreadCount > 9 ? "9+" : unreadCount}

              </span>

            )}

          </Link>

          <Link
            href="/settings"
            className="hidden lg:flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm hover:bg-slate-50"
          >
            <Settings size={20} />
          </Link>

          <Link
              href="/profile"
              className="rounded-full transition hover:scale-105"
          >
              <UserAvatar
                  name={displayName}
                  src={user?.profile_url}
              />
          </Link>

        </div>

      </div>

    </header>
  );
}
