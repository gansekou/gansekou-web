"use client";

import { useCallback } from "react";
import { AdminEducationManager } from "@/components/admin/AdminEducationManager";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { EducationCycle, Level, PageData, Specialty, Subject } from "@/types/platform";

export function AdminEducationPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const [cycles, levels, specialties, subjects] = await Promise.all([
      platformService.education.cycles().catch(() => [] as EducationCycle[]),
      platformService.education.levels().catch(() => [] as Level[]),
      platformService.education.specialties().catch(() => [] as Specialty[]),
      platformService.education.subjects().catch(() => [] as Subject[]),
    ]);
    return { cycles, levels, specialties, subjects };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement education..." load={load}>
      {({ user, data, reload }) => <AdminEducationManager data={data} reload={reload} user={user} />}
    </AuthenticatedPage>
  );
}

