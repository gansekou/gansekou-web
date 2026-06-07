import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type {
  Quiz,
  QuizAIGeneratePayload,
  QuizAIGenerateResult,
  QuizAttemptStart,
  QuizAttempt,
  QuizAnalytics,
  QuizChoice,
  QuizChoiceCreatePayload,
  QuizCreatePayload,
  QuizQuestion,
  QuizQuestionCreatePayload,
  QuizSubmitResult,
} from "@/types/quiz";

export const quizService = {
  getAll: () => apiFetch<Quiz[]>(pagedUrl(ENDPOINTS.quizzes.all)),
  getByCourse: (courseId: string) => apiFetch<Quiz[]>(pagedUrl(ENDPOINTS.quizzes.byCourse(courseId))),
  getById: (quizId: string) => apiFetch<Quiz>(ENDPOINTS.quizzes.byId(quizId)),
  getManageById: (quizId: string) => apiFetch<Quiz>(ENDPOINTS.quizzes.manage(quizId)),
  create: (payload: QuizCreatePayload) =>
    apiFetch<Quiz>(ENDPOINTS.quizzes.all, { method: "POST", body: payload }),
  update: (quizId: string, payload: Partial<QuizCreatePayload> & { status?: string }) =>
    apiFetch<Quiz>(ENDPOINTS.quizzes.byId(quizId), { method: "PUT", body: payload }),
  remove: (quizId: string) =>
    apiFetch<Quiz>(ENDPOINTS.quizzes.byId(quizId), { method: "DELETE" }),
  addQuestion: (quizId: string, payload: QuizQuestionCreatePayload) =>
    apiFetch<QuizQuestion>(ENDPOINTS.quizzes.addQuestion(quizId), {
      method: "POST",
      body: payload,
    }),
  updateQuestion: (questionId: string, payload: Partial<QuizQuestionCreatePayload>) =>
    apiFetch<QuizQuestion>(ENDPOINTS.quizzes.questionById(questionId), {
      method: "PUT",
      body: payload,
    }),
  removeQuestion: (questionId: string) =>
    apiFetch<QuizQuestion>(ENDPOINTS.quizzes.questionById(questionId), {
      method: "DELETE",
    }),
  addChoice: (questionId: string, payload: QuizChoiceCreatePayload) =>
    apiFetch<QuizChoice>(ENDPOINTS.quizzes.addChoice(questionId), {
      method: "POST",
      body: payload,
    }),
  updateChoice: (choiceId: string, payload: QuizChoiceCreatePayload) =>
    apiFetch<QuizChoice>(ENDPOINTS.quizzes.choiceById(choiceId), {
      method: "PUT",
      body: payload,
    }),
  removeChoice: (choiceId: string) =>
    apiFetch<QuizChoice>(ENDPOINTS.quizzes.choiceById(choiceId), {
      method: "DELETE",
    }),
  start: (quizId: string) =>
    apiFetch<QuizAttemptStart>(ENDPOINTS.quizzes.start(quizId), { method: "POST" }),
  submit: (quizId: string, attemptId: string, answers: Record<string, string>) =>
    apiFetch<QuizSubmitResult>(ENDPOINTS.quizzes.submit(quizId, attemptId), {
      method: "POST",
      body: { answers },
    }),
  result: (attemptId: string) =>
    apiFetch<QuizSubmitResult>(ENDPOINTS.quizzes.attemptResult(attemptId)),
  history: () => apiFetch<QuizAttempt[]>(pagedUrl(ENDPOINTS.quizzes.history)),
  leaderboard: (quizId: string) => apiFetch<QuizAttempt[]>(pagedUrl(ENDPOINTS.quizzes.leaderboard(quizId))),
  analytics: (quizId: string) => apiFetch<QuizAnalytics>(ENDPOINTS.quizzes.analytics(quizId)),
  getLinkedQuizForCourse: (courseId: string) => apiFetch<Quiz[]>(pagedUrl(ENDPOINTS.quizzes.byCourse(courseId))),
  generateWithAI: (payload: QuizAIGeneratePayload) =>
    apiFetch<QuizAIGenerateResult>(ENDPOINTS.quizzes.generateAi, {
      method: "POST",
      body: payload,
    }),
};

function pagedUrl(url: string, limit = 50, skip = 0) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}skip=${skip}&limit=${limit}`;
}
