"use client";

import { useCallback } from "react";
import { TeacherDashboardPage as TeacherDashboardContent } from "@/components/pages/dashboard/TeacherDashboardPage";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { PageData, Quiz } from "@/types/platform";
import type { Question } from "@/types/question";
import type { User } from "@/types/user";

export function TeacherDashboardPage() {
  const load = useCallback(async (user: User): Promise<PageData> => {
    const [pendingQuestions, assignedQuestions, teacherSubjects, contents, quizzes] = await Promise.all([
      platformService.teacher.availableQuestions().catch(() => [] as Question[]),
      platformService.teacher.assignedQuestions().catch(() => [] as Question[]),
      platformService.teacher.subjects(user.id).catch(() => []),
      platformService.contents.my().catch(() => [] as Content[]),
      platformService.quizzes.all().catch(() => [] as Quiz[]),
    ]);
    return { pendingQuestions, assignedQuestions, teacherSubjects, contents, quizzes };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement du studio enseignant..." load={load}>
      {({ user, data }) => <TeacherDashboardContent user={user} data={data} />}
    </AuthenticatedPage>
  );
}

