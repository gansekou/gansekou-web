"use client";

import { useCallback } from "react";
import { AdminEducationSubjectsManager } from "@/components/admin/AdminEducationSubjectsManager";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { EducationCycle, Level, PageData, Quiz, Specialty, Subject } from "@/types/platform";
import type { Question } from "@/types/question";

export function AdminEducationSubjectsPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const [cycles, levels, specialties, subjects, contents, quizzes, questions] = await Promise.all([
      platformService.education.cycles().catch(() => [] as EducationCycle[]),
      platformService.education.levels().catch(() => [] as Level[]),
      platformService.education.specialties().catch(() => [] as Specialty[]),
      platformService.education.subjects().catch(() => [] as Subject[]),
      platformService.contents.all().catch(() => [] as Content[]),
      platformService.quizzes.all().catch(() => [] as Quiz[]),
      platformService.questions.all().catch(() => [] as Question[]),
    ]);
    return { cycles, levels, specialties, subjects, contents, quizzes, questions };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement des matieres..." load={load}>
      {({ user, data, reload }) => (
        <AdminEducationSubjectsManager data={data} reload={reload} user={user} />
      )}
    </AuthenticatedPage>
  );
}
