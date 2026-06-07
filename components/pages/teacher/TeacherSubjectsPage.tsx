"use client";

import { useCallback } from "react";
import { TeacherSubjectManager } from "@/components/teacher/TeacherSubjectManager";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { PageData, Subject, TeacherSubject } from "@/types/platform";

export function TeacherSubjectsPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const [teacherSubjects, subjects] = await Promise.all([
      platformService.teacher.mySubjects().catch(() => [] as TeacherSubject[]),
      platformService.education.subjects().catch(() => [] as Subject[]),
    ]);
    return { teacherSubjects, subjects };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement des matieres..." load={load}>
      {({ data, reload }) => (
        <TeacherSubjectManager
          teacherSubjects={(data.teacherSubjects as TeacherSubject[]) || []}
          subjects={(data.subjects as Subject[]) || []}
          reload={reload}
        />
      )}
    </AuthenticatedPage>
  );
}

