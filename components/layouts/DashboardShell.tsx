"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

import { Sidebar } from "@/components/navigation/Sidebar";
import { MobileDrawer } from "@/components/navigation/MobileDrawer";
import { DashboardHeader } from "@/components/navigation/Header";
import { OfflineStatus } from "@/components/ui/OfflineStatus";

import { useI18n } from "@/hooks/useI18n";

import type { User } from "@/types/user";

type DashboardShellProps = {
    children: React.ReactNode;
    user?: User | null;
};

export function DashboardShell({
    children,
    user,
}: DashboardShellProps) {

    const router = useRouter();

    const { language } = useI18n(user);

    const clearSession =
        useAuthStore((s) => s.clearSession);

    const [drawerOpen, setDrawerOpen] =
        useState(false);

    const [loggingOut, setLoggingOut] =
        useState(false);

    useEffect(() => {

        const stored =
            localStorage.getItem("gansekou_theme");

        document.documentElement.classList.toggle(
            "dark",
            stored === "dark"
        );

    }, []);

    async function handleLogout() {

        if (loggingOut) return;

        setLoggingOut(true);

        try {

            await authService.logout();

            clearSession();

        } catch {

            clearSession();

        } finally {

            router.replace("/login");

        }

    }

    return (

        <main className="min-h-screen bg-[#f8faf5]">

            <OfflineStatus
                label={
                    language === "EN"
                        ? "Offline mode enabled."
                        : "Mode hors ligne."
                }
            />

            <div className="fixed inset-0 gansekou-pattern opacity-40" />

            <div className="relative flex min-h-screen">

                <Sidebar
                    user={user}
                    loggingOut={loggingOut}
                    onLogout={handleLogout}
                />

                <MobileDrawer
                    user={user}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    onLogout={handleLogout}
                />

                <section className="flex-1 min-w-0">

                    <DashboardHeader
                        user={user}
                        drawerOpen={drawerOpen}
                        onOpenDrawer={() => setDrawerOpen(true)}
                    />

                    <div className="px-4 py-5 md:p-6">

                        {children}

                    </div>

                </section>

            </div>

        </main>

    );

}
