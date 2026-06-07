"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";
import { ContentPremiumDetail } from "@/components/content/ContentPremiumDetail";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Level, PageData, Quiz, Specialty, Subject } from "@/types/platform";

export function CourseDetailPage() {
  const params = useParams<{ id?: string }>();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const load = useCallback(async (): Promise<PageData> => {
    if (!routeId) return {};
    const [content, linkedQuizzes, related, translations, levels, subjects, specialties] = await Promise.all([
      platformService.contents.byId(routeId).catch(() => undefined),
      platformService.quizzes.byCourse(routeId).catch(() => [] as Quiz[]),
      platformService.contents.related(routeId).catch(() => [] as Content[]),
      platformService.contents.translations(routeId).catch(() => []),
      platformService.education.levels().catch(() => [] as Level[]),
      platformService.education.subjects().catch(() => [] as Subject[]),
      platformService.education.specialties().catch(() => [] as Specialty[]),
    ]);
    return { content, linkedQuizzes, related, translations, levels, subjects, specialties };
  }, [routeId]);

  return (
    <AuthenticatedPage loadingLabel="Chargement du cours..." load={load}>
      {({ user, data, reload }) => (
        <ContentPremiumDetail
          user={user}
          content={data.content as Content | null}
          related={(data.related as Content[]) || []}
          linkedQuizzes={(data.linkedQuizzes as Quiz[]) || []}
          translations={(data.translations as { title?: string; description?: string; language?: string }[]) || []}
          subjects={(data.subjects as Subject[]) || []}
          levels={(data.levels as Level[]) || []}
          specialties={(data.specialties as Specialty[]) || []}
          scope="courses"
          reload={reload}
        />
      )}
    </AuthenticatedPage>
  );
}
