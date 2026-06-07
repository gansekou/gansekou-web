import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ID } from "@/types/common";
import type { Content, ContentAnalytics, ContentCreatePayload, ContentTranslation } from "@/types/content";

export const contentService = {
  // =========================
  // BASIC CONTENTS
  // =========================

  getAll() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.all));
  },

  getApproved() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.approved));
  },

  getContentsForCurrentUser() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.approved));
  },

  getCoursesForCurrentUser() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.byType("COURS")));
  },

  getExercisesForCurrentUser() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.byType("EXERCICE")));
  },

  getSubjectsForCurrentUser() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.byType("SUJET")));
  },

  getSubjectDetailsForCurrentUser(subjectId: ID) {
    return this.getBySubject(subjectId);
  },

  getCourseRecommendations() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.recent));
  },

  getOffline() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.offline));
  },

  getFeatured() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.featured));
  },

  getPopular() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.popular));
  },

  getRecent() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.recent));
  },

  getPremium() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.premium));
  },

  getMyContents() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.myContents));
  },

  getPendingReview() {
    return apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.pendingReview));
  },

  // =========================
  // SINGLE CONTENT
  // =========================

  getById(contentId: ID) {
    return apiFetch<Content>(
      ENDPOINTS.contents.byId(String(contentId))
    );
  },

  getByLevel(levelId: ID) {
    return apiFetch<Content[]>(
      pagedUrl(ENDPOINTS.contents.byLevel(String(levelId)))
    );
  },

  getBySubject(subjectId: ID) {
    return apiFetch<Content[]>(
      pagedUrl(ENDPOINTS.contents.bySubject(String(subjectId)))
    );
  },

  getByType(contentType: string) {
    return apiFetch<Content[]>(
      pagedUrl(ENDPOINTS.contents.byType(contentType))
    );
  },

  search(query: string) {
    return apiFetch<Content[]>(
      `${ENDPOINTS.contents.search}?query=${encodeURIComponent(query)}&skip=0&limit=50`
    );
  },

  getRelated(contentId: ID) {
    return apiFetch<Content[]>(
      ENDPOINTS.contents.related(String(contentId))
    );
  },

  getAnalytics(contentId: ID) {
    return apiFetch<ContentAnalytics>(
      ENDPOINTS.contents.analytics(String(contentId))
    );
  },

  // =========================
  // CREATE / UPDATE / DELETE
  // =========================

  create(payload: ContentCreatePayload) {
    return apiFetch<Content>(ENDPOINTS.contents.all, {
      method: "POST",
      body: payload,
    });
  },

  update(contentId: ID, payload: ContentCreatePayload) {
    return apiFetch<Content>(
      ENDPOINTS.contents.byId(String(contentId)),
      {
        method: "PUT",
        body: payload,
      }
    );
  },

  remove(contentId: ID) {
    return apiFetch(
      ENDPOINTS.contents.byId(String(contentId)),
      {
        method: "DELETE",
      }
    );
  },

  // =========================
  // ADMIN ACTIONS
  // =========================

  publish(contentId: ID) {
    return apiFetch(
      ENDPOINTS.contents.publish(String(contentId)),
      {
        method: "PUT",
      }
    );
  },

  archive(contentId: ID) {
    return apiFetch(
      ENDPOINTS.contents.archive(String(contentId)),
      {
        method: "PUT",
      }
    );
  },

  // =========================
  // USER INTERACTIONS
  // =========================

  incrementView(contentId: ID) {
    return apiFetch(
      ENDPOINTS.contents.view(String(contentId)),
      {
        method: "POST",
      }
    );
  },

  incrementDownload(contentId: ID) {
    return apiFetch(
      ENDPOINTS.contents.download(String(contentId)),
      {
        method: "POST",
      }
    );
  },

  like(contentId: ID) {
    return apiFetch(
      ENDPOINTS.contents.like(String(contentId)),
      {
        method: "POST",
      }
    );
  },

  // =========================
  // TRANSLATIONS
  // =========================

  createTranslation(payload: {
    content_id: string;
    language: string;
    title: string;
    description?: string;
  }) {
    return apiFetch<ContentTranslation>(
      ENDPOINTS.contents.translations,
      {
        method: "POST",
        body: payload,
      }
    );
  },

  updateTranslation(
    translationId: ID,
    payload: {
      content_id: string;
      language: string;
      title: string;
      description?: string;
    }
  ) {
    return apiFetch<ContentTranslation>(
      ENDPOINTS.contents.translationById(String(translationId)),
      {
        method: "PUT",
        body: payload,
      }
    );
  },

  deleteTranslation(translationId: ID) {
    return apiFetch<ContentTranslation>(
      ENDPOINTS.contents.translationById(String(translationId)),
      {
        method: "DELETE",
      }
    );
  },

  getContentTranslations(contentId: ID) {
    return apiFetch<ContentTranslation[]>(
      ENDPOINTS.contents.contentTranslations(
        String(contentId)
      )
    );
  },
};

function pagedUrl(url: string, limit = 50, skip = 0) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}skip=${skip}&limit=${limit}`;
}
