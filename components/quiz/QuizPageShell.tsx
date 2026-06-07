"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { ErrorState, LoadingState } from "@/components/app/StateViews";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { User } from "@/types/user";

type Props = {
  children: (user: User) => React.ReactNode;
};

export function QuizPageShell({ children }: Props) {
  const router = useRouter();
  const { user, loading, isAuthenticated, error } = useCurrentUser();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <DashboardShell user={user}>
        <LoadingState label="Chargement de votre espace Gansekou..." />
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell user={null}>
        <ErrorState title="Session requise" message={error} />
      </DashboardShell>
    );
  }

  return <DashboardShell user={user}>{children(user)}</DashboardShell>;
}
