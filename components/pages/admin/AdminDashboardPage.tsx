"use client";

import { useCallback } from "react";
import { AdminDashboardPage as AdminDashboardContent } from "@/components/pages/dashboard/AdminDashboardPage";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Notification, PageData } from "@/types/platform";
import type { Question } from "@/types/question";
import type { User } from "@/types/user";

export function AdminDashboardPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const [users, contents, questions, notifications] = await Promise.all([
      platformService.users.all().catch(() => [] as User[]),
      platformService.contents.all().catch(() => [] as Content[]),
      platformService.questions.all().catch(() => [] as Question[]),
      platformService.notifications.all().catch(() => [] as Notification[]),
    ]);
    return { users, contents, questions, notifications };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement de l'administration..." load={load}>
      {({ user, data }) => <AdminDashboardContent user={user} data={data} />}
    </AuthenticatedPage>
  );
}

