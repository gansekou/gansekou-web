"use client";

import Link from "next/link";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PublicMobileDrawer({
  open,
  onClose,
}: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition ${
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-white transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">

          <h2 className="font-black">
            Menu
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <nav className="flex flex-col p-4">

          <Link href="/" onClick={onClose}>Accueil</Link>

          <Link href="/courses" onClick={onClose}>Cours</Link>

          <Link href="/subjects" onClick={onClose}>Sujets</Link>

          <Link href="/quizzes" onClick={onClose}>Quiz</Link>

          <Link href="/premium" onClick={onClose}>Premium</Link>

          <Link href="/login" onClick={onClose}>Connexion</Link>

        </nav>

      </aside>
    </>
  );
}
