"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { GansekouLogo } from "@/components/ui/GansekouLogo";

type Props = {
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  userName?: string;
};

export function PublicHeader({
  drawerOpen,
  onOpenDrawer,
  userName,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* MOBILE */}

        <button
          onClick={onOpenDrawer}
          className="rounded-xl p-2 md:hidden"
        >
          <Menu
            size={24}
            className={drawerOpen ? "rotate-90 transition" : "transition"}
          />
        </button>

        <GansekouLogo
          href="/"
          variant="full"
          size="medium"
        />

        {/* DESKTOP */}

        <nav className="hidden items-center gap-8 font-bold text-slate-700 md:flex">

          <Link href="/">Accueil</Link>

          <Link href="/courses">Cours</Link>

          <Link href="/subjects">Sujets</Link>

          <Link href="/quizzes">Quiz</Link>

          <Link href="/premium">Premium</Link>

        </nav>

        <Link
          href={userName ? "/dashboard" : "/login"}
          className="rounded-full bg-[#071d3a] px-5 py-2 font-bold text-white"
        >
          {userName ? "Mon espace" : "Connexion"}
        </Link>

      </div>

    </header>
  );
}
