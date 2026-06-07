"use client";

import { useCallback } from "react";
import { TeacherQuestionQueue } from "@/components/teacher/TeacherQuestionQueue";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { PageData } from "@/types/platform";
import type { Question } from "@/types/question";

export function TeacherQuestionsPage({ mode }: { mode: "pending" | "assigned" }) {
  const load = useCallback(async (): Promise<PageData> => {
    const questions = mode === "assigned"
      ? await platformService.teacher.assignedQuestions()
      : await platformService.teacher.availableQuestions();
    return { questions };
  }, [mode]);

  return (
    <AuthenticatedPage loadingLabel="Chargement des questions..." load={load}>
      {({ data }) => <TeacherQuestionQueue questions={(data.questions as Question[]) || []} />}
    </AuthenticatedPage>
  );
}
