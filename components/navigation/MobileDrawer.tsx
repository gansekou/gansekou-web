"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ChevronRight, Crown, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { GansekouLogo } from "@/components/ui/GansekouLogo";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useI18n } from "@/hooks/useI18n";

import type { User } from "@/types/user";
import { getNavigation } from "./NavigationItems";

import { PremiumBadge } from "@/components/ui/PremiumBadge";

type Props = {
  user?: User | null;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export function MobileDrawer({
  user,
  open,
  onClose,
  onLogout,
}: Props) {
  const pathname = usePathname();

  const { t } = useI18n(user);

  const sections = getNavigation(user);

  /* ------------------------------
      Fermer après navigation
  -------------------------------*/

  useEffect(() => {
    onClose();
  }, [pathname]);

  /* ------------------------------
      ESC
  -------------------------------*/

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ------------------------------
      Bloquer le scroll
  -------------------------------*/

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}

      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-[86%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden

        ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">

          {/* HEADER */}

          <div className="border-b p-5">

            <div className="flex items-center justify-between">

              <GansekouLogo
                href="/"
                variant="full"
                size="medium"
              />

              <button
                onClick={onClose}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X size={22} />
              </button>

            </div>

            {user && (
              <div className="mt-5 flex items-center gap-3">

                <UserAvatar
                  name={`${user.prenom} ${user.nom}`}
                  src={user.profile_url}
                />

                <div>
                  <div className="flex items-center gap-2 font-bold">
                    <span>
                      {user.prenom} {user.nom}
                    </span>
                
                    {user.is_premium ? <PremiumBadge /> : null}
                  </div>
                
                  <div className="text-sm text-slate-500">
                    {user.role}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* NAVIGATION */}

          <div className="flex-1 overflow-y-auto p-4">

            {sections.map((section, index) => (

              <div key={section.id}>

                {section.items.map((item) => {

                  const Icon = item.icon;

                  const active =
                    item.href &&
                    (pathname === item.href ||
                      pathname.startsWith(item.href + "/"));

                  if (item.danger) {
                    return (
                      <button
                        key={item.key}
                        onClick={onLogout}
                        className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-red-600 transition hover:bg-red-50"
                      >
                        <Icon size={22} />
                        <span>{item.key}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.key}
                      href={item.href ?? "#"}
                      className={`flex items-center gap-4 rounded-2xl px-4 py-4 transition

                      ${
                        active
                          ? "bg-[#0f5f3a] text-white"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <Icon size={22} />

                      <span>
                        {item.key.startsWith("nav.")
                          ? t(item.key as never)
                          : item.key}
                      </span>

                    </Link>
                  );

                })}

                {index !== sections.length - 1 && (
                  <div className="my-4 border-t" />
                )}

              </div>

            ))}

          </div>

          {/* EXCELLENCE+ — CTA COMPACT */}

          <div className="border-t border-slate-100 px-4 py-3">
          
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
          
              {/* ICÔNE */}
          
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
                <Crown
                  size={15}
                  strokeWidth={2.5}
                />
              </span>
          
              {/* TEXTE */}
          
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
          
              {/* FLÈCHE */}
          
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

        </div>
      </aside>
    </>
  );
}
