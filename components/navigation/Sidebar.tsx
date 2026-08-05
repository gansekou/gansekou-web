"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GansekouLogo } from "@/components/ui/GansekouLogo";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useI18n } from "@/hooks/useI18n";

import type { User } from "@/types/user";

import { getNavigation } from "./NavigationItems";

type SidebarProps = {
  user?: User | null;
  loggingOut: boolean;
  onLogout: () => void;
};

export function Sidebar({
  user,
  loggingOut,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  const { t, formatRole } = useI18n(user);

  const sections = getNavigation(user);

  const displayName =
    [user?.prenom, user?.nom]
      .filter(Boolean)
      .join(" ");

  return (
    <aside className="hidden lg:flex lg:w-[290px] lg:flex-col border-r border-[#0f5f3a]/10 bg-white">

      {/* LOGO */}

      <div className="p-6">

        <GansekouLogo
          href="/"
          variant="full"
          size="large"
        />

      </div>

      {/* USER */}

      {user && (
        <div className="px-6 pb-6">

          <div className="flex items-center gap-3">

            <UserAvatar
              name={displayName}
              src={user.profile_url}
            />

            <div>

              <div className="font-bold">
                {displayName}
              </div>

              <div className="text-sm text-slate-500">
                {formatRole(user.role)}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* NAVIGATION */}

      <div className="flex-1 overflow-y-auto px-4">

        {sections.map((section, index) => (

          <div
            key={section.id}
            className="mb-6"
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
                    className="w-full justify-start rounded-2xl px-4 py-3 text-red-600 hover:bg-red-50"
                  >

                    {!loggingOut && (
                      <Icon size={20} />
                    )}

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
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition

                  ${
                    active
                      ? "bg-[#0f5f3a] text-white"
                      : "hover:bg-slate-100"
                  }`}
                >

                  <Icon size={20} />

                  <span>

                    {item.key.startsWith("nav.")
                      ? t(item.key as never)
                      : item.key}

                  </span>

                </Link>

              );

            })}

            {index !== sections.length - 1 && (
              <div className="mt-6 border-t" />
            )}

          </div>

        ))}

      </div>

      {/* PREMIUM */}

      <div className="m-5 rounded-3xl bg-[#082f1f] p-5 text-white">

        <h3 className="text-xl font-black">
          GANSEKOU Excellence+
        </h3>

        <p className="mt-3 text-sm text-white/70">

          Accédez aux cours Premium,
          Kouma IA,
          téléchargements,
          évaluations avancées
          et bien plus.

        </p>

        <Link
          href="/premium"
          className="mt-5 flex justify-center rounded-2xl bg-white px-4 py-3 font-bold text-[#082f1f]"
        >
          {t("premium.cta")}
        </Link>

      </div>

    </aside>
  );
}
