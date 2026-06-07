"use client";

import { useCallback } from "react";
import { ContentManager } from "@/components/content/ContentManager";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Level, PageData, Subject } from "@/types/platform";

export function TeacherContentsPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const [contents, levels, subjects] = await Promise.all([
      platformService.contents.my().catch(() => [] as Content[]),
      platformService.education.levels().catch(() => [] as Level[]),
      platformService.education.subjects().catch(() => [] as Subject[]),
    ]);
    return { contents, levels, subjects };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement des contenus..." load={load}>
      {({ user, data, reload }) => (
        <ContentManager
          user={user}
          contents={(data.contents as Content[]) || []}
          subjects={(data.subjects as Subject[]) || []}
          levels={(data.levels as Level[]) || []}
          scope="teacher"
          reload={reload}
        />
      )}
    </AuthenticatedPage>
  );
}

