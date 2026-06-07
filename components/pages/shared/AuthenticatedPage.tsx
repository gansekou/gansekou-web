"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { ErrorState, LoadingState } from "@/components/app/StateViews";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { PageData } from "@/types/platform";
import type { User } from "@/types/user";

type AuthenticatedPageProps = {
  loadingLabel?: string;
  load: (user: User) => Promise<PageData>;
  children: (props: { user: User; data: PageData; reload: () => Promise<void> }) => React.ReactNode;
};

export function AuthenticatedPage({ loadingLabel = "Chargement...", load, children }: AuthenticatedPageProps) {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, error: authError } = useCurrentUser();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  const loader = useMemo(
    () => async () => (user ? load(user) : {}),
    [load, user]
  );
  const { data, loading, error, reload } = useAsyncData<PageData>(loader);

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <DashboardShell user={user}>
        <LoadingState label={loadingLabel} />
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell user={null}>
        <ErrorState title="Session requise" message={authError} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user}>
      <div className="grid gap-6">
        {error && <ErrorState message={error} />}
        {children({ user, data: data || {}, reload })}
      </div>
    </DashboardShell>
  );
}

