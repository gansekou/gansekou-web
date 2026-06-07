import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ContentProgress } from "@/types/progress";

export const progressService = {
  start: (contentId: string) =>
    apiFetch<ContentProgress>(ENDPOINTS.contentProgress.start(contentId), { method: "POST" }),
  update: (contentId: string, payload: { progress_percent: number; time_spent_minutes?: number }) =>
    apiFetch<ContentProgress>(ENDPOINTS.contentProgress.progress(contentId), {
      method: "PUT",
      body: payload,
    }),
  complete: (contentId: string) =>
    apiFetch<ContentProgress>(ENDPOINTS.contentProgress.complete(contentId), { method: "POST" }),
  mine: () => apiFetch<ContentProgress[]>(ENDPOINTS.contentProgress.myProgress),
  completed: () => apiFetch<ContentProgress[]>(ENDPOINTS.contentProgress.completed),
  favorites: () => apiFetch(ENDPOINTS.contentProgress.favorites),
  stats: () => apiFetch(ENDPOINTS.contentProgress.stats),
};
