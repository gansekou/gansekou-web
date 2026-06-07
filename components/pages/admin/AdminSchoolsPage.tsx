"use client";

import { useCallback } from "react";
import { AdminSchoolsManager } from "@/components/admin/AdminSchoolsManager";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { Address, PageData, School } from "@/types/platform";

export function AdminSchoolsPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const [schools, addresses] = await Promise.all([
      platformService.schools.all().catch(() => [] as School[]),
      platformService.schools.addresses().catch(() => [] as Address[]),
    ]);
    return { schools, addresses };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement des ecoles..." load={load}>
      {({ user, data, reload }) => <AdminSchoolsManager data={data} reload={reload} user={user} />}
    </AuthenticatedPage>
  );
}

