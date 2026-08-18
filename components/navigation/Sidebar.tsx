"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { GansekouLogo } from "@/components/ui/GansekouLogo";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useI18n } from "@/hooks/useI18n";

import type { User } from "@/types/user";

import { getNavigation } from "./NavigationItems";
import { PremiumBadge } from "@/components/ui/PremiumBadge";

type SidebarProps = {
  user?: User | null;
  loggingOut: boolean;
  onLogout: () => void;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({
  user,
  loggingOut,
  onLogout,
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const { t, formatRole } = useI18n(user);

  const sections = getNavigation(user);

  const displayName =
    [user?.prenom, user?.nom]
      .filter(Boolean)
      .join(" ");

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-[#071d3a]/30 backdrop-blur-[2px]
          transition-opacity duration-300
          ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}
        `}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-dvh w-[285px] flex-col
          border-r border-[#0f5f3a]/10
          bg-white shadow-2xl shadow-[#071d3a]/15

          transform
          transition-transform
          duration-300
          ease-out

          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER / LOGO */}
        <div className="flex items-center justify-between p-5">
          <GansekouLogo
            href="/"
            variant="full"
            size="large"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-[#082f1f]
              active:scale-95
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* USER */}
        {user && (
          <div className="px-5 pb-5">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <UserAvatar
                name={displayName}
                src={user.profile_url}
              />

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2 font-bold">
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {displayName}
                  </span>

                  {user.is_premium ? (
                    <span className="shrink-0">
                      <PremiumBadge />
                    </span>
                  ) : null}
                </div>

                <div className="truncate text-xs text-slate-500">
                  {formatRole(user.role)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="mb-5"
            >
              {section.items.map((item) => {
                const Icon = item.icon;

                const active =
                  item.href &&
                  (
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  );

                if (item.danger) {
                  return (
                    <LoadingButton
                      key={item.key}
                      loading={loggingOut}
                      onClick={onLogout}
                      variant="ghost"
                      className="
                        w-full
                        justify-start
                        rounded-xl
                        px-3
                        py-2.5
                        text-sm
                        text-red-600
                        hover:bg-red-50
                      "
                    >
                      {!loggingOut && <Icon size={18} />}

                      <span className="ml-3">
                        {item.key}
                      </span>
                    </LoadingButton>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href ?? "#"}
                    onClick={onClose}
                    className={`
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm
                      font-semibold
                      transition

                      ${
                        active
                          ? "bg-[#0f5f3a] text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100"
                      }
                    `}
                  >
                    <Icon size={18} />

                    <span>
                      {item.key.startsWith("nav.")
                        ? t(item.key as never)
                        : item.key}
                    </span>
                  </Link>
                );
              })}

              {index !== sections.length - 1 && (
                <div className="mt-5 border-t border-slate-100" />
              )}
            </div>
          ))}
        </div>

        {/* EXCELLENCE+ — CTA COMPACT */}
        <div className="px-4 pb-3">
          <Link
            href="/premium"
            onClick={onClose}
            className={`
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              border
              px-3
              py-2.5
              transition-all
              duration-200
              ${
                user?.is_premium
                  ? "border-[#f6c445]/30 bg-[#f6c445]/10 text-[#082f1f]"
                  : "border-[#0f5f3a]/10 bg-[#f8faf5] text-[#082f1f] hover:border-[#f6c445]/50 hover:bg-[#f6c445]/10"
              }
            `}
          >
            <span
              className={`
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                transition
                ${
                  user?.is_premium
                    ? "bg-[#f6c445] text-[#082f1f]"
                    : "bg-[#082f1f] text-[#f6c445] group-hover:scale-105"
                }
              `}
            >
              <Crown size={15} strokeWidth={2.5} />
            </span>
        
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-black">
                {user?.is_premium
                  ? "Excellence+"
                  : "Passer à Excellence+"}
              </span>
        
              <span className="block truncate text-[10px] font-semibold text-slate-400">
                {user?.is_premium
                  ? "Abonnement actif"
                  : "Débloquer toutes les fonctionnalités"}
              </span>
            </span>
        
            <ChevronRight
              size={15}
              className="
                shrink-0
                text-slate-400
                transition-transform
                group-hover:translate-x-0.5
              "
            />
          </Link>
        </div>

        
      </aside>
    </>
  );
}
