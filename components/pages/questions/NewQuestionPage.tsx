"use client";

import { useCallback } from "react";
import { StudentQuestionForm } from "@/components/questions/StudentQuestionForm";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { Level, PageData, Subject } from "@/types/platform";

export function NewQuestionPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const [subjects, levels] = await Promise.all([
      platformService.education.subjects().catch(() => [] as Subject[]),
      platformService.education.levels().catch(() => [] as Level[]),
    ]);
    return { subjects, levels };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement du formulaire..." load={load}>
      {({ user, data }) => (
        <StudentQuestionForm
          user={user}
          subjects={(data.subjects as Subject[]) || []}
          levels={(data.levels as Level[]) || []}
        />
      )}
    </AuthenticatedPage>
  );
}

