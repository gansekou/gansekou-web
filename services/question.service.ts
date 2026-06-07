import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ID } from "@/types/common";
import type {
  CreateQuestionPayload,
  Question,
} from "@/types/question";

type UploadResponse = {
  file_url?: string;
  url?: string;
  path?: string;
  filename?: string;
};

export const questionService = {
  create(payload: CreateQuestionPayload) {
    return apiFetch<Question>(ENDPOINTS.questions.all, {
      method: "POST",
      body: payload,
    });
  },

  getAll() {
    return apiFetch<Question[]>(ENDPOINTS.questions.all);
  },

  getMine() {
    return apiFetch<Question[]>(ENDPOINTS.questions.me);
  },

  getById(questionId: ID) {
    return apiFetch<Question>(
      ENDPOINTS.questions.byId(String(questionId))
    );
  },

  update(questionId: ID, payload: Partial<CreateQuestionPayload>) {
    return apiFetch<Question>(
      ENDPOINTS.questions.byId(String(questionId)),
      {
        method: "PUT",
        body: payload,
      }
    );
  },

  remove(questionId: ID) {
    return apiFetch(ENDPOINTS.questions.byId(String(questionId)), {
      method: "DELETE",
    });
  },

  getStudentQuestions(studentId: ID) {
    return apiFetch<Question[]>(
      ENDPOINTS.questions.byStudent(String(studentId))
    );
  },

  getPendingTeacherQuestions() {
    return apiFetch<Question[]>(ENDPOINTS.questions.pendingTeacher);
  },

  requestTeacher(questionId: ID) {
    return apiFetch(
      ENDPOINTS.questions.requestTeacher(String(questionId)),
      {
        method: "POST",
      }
    );
  },

  createAiAnswer(payload: {
    question_id: string;
    answer_text: string;
    confidence_score?: number;
    language?: string;
  }) {
    return apiFetch(ENDPOINTS.questions.aiAnswers, {
      method: "POST",
      body: payload,
    });
  },

  createTeacherAnswer(payload: {
    question_id: string;
    answer_text: string;
    attachment_url?: string;
    language?: string;
  }) {
    return apiFetch(ENDPOINTS.questions.teacherAnswers, {
      method: "POST",
      body: payload,
    });
  },

  getTeacherPendingQuestions() {
    return apiFetch(ENDPOINTS.teacherQuestions.pending);
  },

  getTeacherAssignedQuestions() {
    return apiFetch(ENDPOINTS.teacherQuestions.assigned);
  },

  takeTeacherQuestion(questionId: ID) {
    return apiFetch(
      ENDPOINTS.teacherQuestions.take(String(questionId)),
      {
        method: "POST",
      }
    );
  },

  answerTeacherQuestion(
    questionId: ID,
    payload: {
      answer_text: string;
      attachment_url?: string;
      language?: string;
    }
  ) {
    return apiFetch(
      ENDPOINTS.teacherQuestions.answer(String(questionId)),
      {
        method: "POST",
        body: payload,
      }
    );
  },

  getTeacherAnswerForQuestion(questionId: ID) {
    return apiFetch(
      ENDPOINTS.studentAnswers.byQuestion(String(questionId))
    );
  },

  getMyTeacherAnswers() {
    return apiFetch(ENDPOINTS.studentAnswers.myAnswers);
  },

  getMyQuestionsWithAnswers() {
    return apiFetch(ENDPOINTS.studentAnswers.myQuestions);
  },

  getMyPendingQuestions() {
    return apiFetch(ENDPOINTS.studentAnswers.pending);
  },

  getMyAnsweredQuestions() {
    return apiFetch(ENDPOINTS.studentAnswers.answered);
  },

  getMyQuestionStats() {
    return apiFetch(ENDPOINTS.studentAnswers.stats);
  },

  async uploadQuestionImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiFetch<UploadResponse>(ENDPOINTS.uploads.questionImage, {
      method: "POST",
      body: formData,
    });
  },

  async uploadTeacherAttachment(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiFetch<UploadResponse>(ENDPOINTS.uploads.teacherAnswer, {
      method: "POST",
      body: formData,
    });
  },

  async askQuestion(payload: {
    question_text: string;
    subject_id?: string;
    level_id?: string;
    image?: File | null;
    language?: string;
  }) {
    let imageUrl: string | undefined;

    if (payload.image) {
      const uploadResult = await this.uploadQuestionImage(payload.image);

      imageUrl =
        uploadResult.file_url ||
        uploadResult.url ||
        uploadResult.path;
    }

    return this.create({
      question_text: payload.question_text,
      subject_id: payload.subject_id,
      level_id: payload.level_id,
      image_url: imageUrl,
    });
  },

  async askAiThenTeacherFallback(payload: {
    question_id: string;
    question_text: string;
    subject_id?: string;
    language?: string;
  }) {
    try {
      const aiResponse = await apiFetch(ENDPOINTS.ai.chat, {
        method: "POST",
        body: {
          message: payload.question_text,
          subject_id: payload.subject_id,
          language: payload.language || "FR",
        },
      });

      return {
        type: "AI",
        data: aiResponse,
      };
    } catch {
      await this.requestTeacher(payload.question_id);

      return {
        type: "TEACHER_REQUESTED",
      };
    }
  },

  async dashboard() {
    const [
      myQuestions,
      pendingQuestions,
      answeredQuestions,
      stats,
      notifications,
    ] = await Promise.allSettled([
      this.getMine(),
      this.getMyPendingQuestions(),
      this.getMyAnsweredQuestions(),
      this.getMyQuestionStats(),
      apiFetch(ENDPOINTS.notifications.me),
    ]);

    return {
      myQuestions,
      pendingQuestions,
      answeredQuestions,
      stats,
      notifications,
    };
  },

  async teacherDashboard() {
    const [pendingQuestions, assignedQuestions, notifications] =
      await Promise.allSettled([
        this.getTeacherPendingQuestions(),
        this.getTeacherAssignedQuestions(),
        apiFetch(ENDPOINTS.notifications.me),
      ]);

    return {
      pendingQuestions,
      assignedQuestions,
      notifications,
    };
  },
};
