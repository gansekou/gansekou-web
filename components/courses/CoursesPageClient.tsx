"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { ErrorState, LoadingState } from "@/components/app/StateViews";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Level, Subject } from "@/types/platform";

const ContentManager = dynamic(
  () => import("@/components/content/ContentManager").then((mod) => mod.ContentManager),
  { loading: () => <LoadingState label="Chargement des cours..." /> }
);

export function CoursesPageClient() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, error: authError } = useCurrentUser();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  const loader = useMemo(
    () => async () => {
      if (!user) return { contents: [], levels: [], subjects: [] };
      const [courses, levels, subjects] = await Promise.all([
        platformService.contents.byType("COURS").catch(() => [] as Content[]),
        platformService.education.levels().catch(() => [] as Level[]),
        platformService.education.subjects().catch(() => [] as Subject[]),
      ]);
      return {
        contents: courses,
        levels,
        subjects,
      };
    },
    [user]
  );

  const { data, loading, error, reload } = useAsyncData(loader);

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <DashboardShell user={user}>
        <LoadingState label="Chargement des cours..." />
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
        <ContentManager
          user={user}
          contents={(data?.contents as Content[]) || []}
          subjects={(data?.subjects as Subject[]) || []}
          levels={(data?.levels as Level[]) || []}
          scope="courses"
          reload={reload}
        />
      </div>
    </DashboardShell>
  );
}
