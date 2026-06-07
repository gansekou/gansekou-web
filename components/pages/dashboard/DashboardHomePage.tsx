"use client";

import { useCallback } from "react";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { AdminDashboardPage } from "@/components/pages/dashboard/AdminDashboardPage";
import { StudentDashboardPage } from "@/components/pages/dashboard/StudentDashboardPage";
import { TeacherDashboardPage } from "@/components/pages/dashboard/TeacherDashboardPage";
import { isAdminRole, canAccessTeacherStudio } from "@/lib/permissions";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Notification, PageData, Quiz } from "@/types/platform";
import type { Question } from "@/types/question";
import type { User } from "@/types/user";

export function DashboardHomePage() {
  const load = useCallback(async (user: User): Promise<PageData> => {
    if (isAdminRole(user)) {
      const [users, contents, questions, notifications] = await Promise.all([
        platformService.users.all().catch(() => [] as User[]),
        platformService.contents.all().catch(() => [] as Content[]),
        platformService.questions.all().catch(() => [] as Question[]),
        platformService.notifications.all().catch(() => [] as Notification[]),
      ]);
      return { users, contents, questions, notifications };
    }
    if (canAccessTeacherStudio(user)) {
      const [pendingQuestions, assignedQuestions, teacherSubjects, contents, quizzes] = await Promise.all([
        platformService.teacher.availableQuestions().catch(() => [] as Question[]),
        platformService.teacher.assignedQuestions().catch(() => [] as Question[]),
        platformService.teacher.subjects(user.id).catch(() => []),
        platformService.contents.my().catch(() => [] as Content[]),
        platformService.quizzes.all().catch(() => [] as Quiz[]),
      ]);
      return { pendingQuestions, assignedQuestions, teacherSubjects, contents, quizzes };
    }
    const [contents, questions, quizzes, notifications] = await Promise.all([
      platformService.contents.featured().catch(() => [] as Content[]),
      platformService.questions.mine().catch(() => [] as Question[]),
      platformService.quizzes.all().catch(() => [] as Quiz[]),
      platformService.notifications.mine().catch(() => [] as Notification[]),
    ]);
    return { contents, questions, quizzes, notifications };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement du tableau de bord..." load={load}>
      {({ user, data }) => {
        if (isAdminRole(user)) return <AdminDashboardPage user={user} data={data} />;
        if (canAccessTeacherStudio(user)) return <TeacherDashboardPage user={user} data={data} />;
        return <StudentDashboardPage user={user} data={data} />;
      }}
    </AuthenticatedPage>
  );
}

