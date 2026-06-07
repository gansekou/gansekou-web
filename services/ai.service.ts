import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

export type AIChatPayload = {
  question: string;
  subject_id?: string | null;
  level_id?: string | null;
  language?: string;
  mode?: "STUDENT_HELP" | "SIMPLE" | "ADVANCED" | "HOMEWORK_HELP" | "SUMMARY" | "TEACHER_ASSISTANT";
};

export type AIChatResult = {
  answer: string;
  cached: boolean;
  remaining_requests: number;
};

export const aiService = {
  chat: (payload: AIChatPayload) =>
    apiFetch<AIChatResult>(ENDPOINTS.ai.chat, {
      method: "POST",
      body: payload,
    }),
  exercises: (payload: AIGenerationPayload) =>
    apiFetch<AIChatResult>(ENDPOINTS.ai.exercises, {
      method: "POST",
      body: payload,
    }),
  revisionSheet: (payload: AIGenerationPayload) =>
    apiFetch<AIChatResult>(ENDPOINTS.ai.revisionSheet, {
      method: "POST",
      body: payload,
    }),
  quizPlan: (payload: AIGenerationPayload) =>
    apiFetch<AIChatResult>(ENDPOINTS.ai.quizPlan, {
      method: "POST",
      body: payload,
    }),
};

export type AIGenerationPayload = {
  topic: string;
  subject_id?: string | null;
  level_id?: string | null;
  language?: string;
  difficulty?: string;
  count?: number;
};
