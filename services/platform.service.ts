import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Content } from "@/types/content";
import type { CreateQuestionPayload, Question, TeacherAnswer } from "@/types/question";
import type { User } from "@/types/user";
import type { GansekouRole } from "@/types/user";
import type {
  AdminGlobalStats,
  Address,
  EducationCycle,
  Level,
  Notification,
  Quiz,
  School,
  Specialty,
  StudyPlan,
  StudyPlanItem,
  Subject,
  SubscriptionPlan,
  SubscriptionStatus,
  UUID,
} from "@/types/platform";
import type { StudentBadge, StudentGamificationProfile } from "@/types/gamification";

export const platformService = {
  users: {
    me: () => apiFetch<User>(ENDPOINTS.users.meProfile),
    updateMe: (payload: Partial<User>) =>
      apiFetch<User>(ENDPOINTS.users.updateMe, {
        method: "PATCH",
        body: payload,
      }),
    updateMyProfile: (payload: { level_id?: UUID | null; school_id?: UUID | null; preferred_language?: string | null; profile_url?: string | null }) =>
      apiFetch<User>(ENDPOINTS.users.updateMyProfile, {
        method: "PATCH",
        body: payload,
      }),
    submitTeacherApplication: (payload: { subject_ids: UUID[]; proof_url: string; message?: string | null }) =>
      apiFetch<{ user: User; teacher_subjects: unknown[] }>(ENDPOINTS.users.teacherApplication, {
        method: "POST",
        body: payload,
      }),
    all: () => apiFetch<User[]>(ENDPOINTS.users.all),
    byId: (id: UUID) => apiFetch<User>(ENDPOINTS.users.byId(id)),
    updateRole: (id: UUID, role: GansekouRole) =>
      apiFetch<User>(ENDPOINTS.admin.updateUserRole(id), {
        method: "PATCH",
        body: { role },
      }),
  },

  education: {
    cycles: () => apiFetch<EducationCycle[]>(ENDPOINTS.education.cycles),
    createCycle: (payload: { name_fr: string; name_en: string }) =>
      apiFetch<EducationCycle>(ENDPOINTS.education.cycles, { method: "POST", body: payload }),
    updateCycle: (id: UUID, payload: { name_fr: string; name_en: string }) =>
      apiFetch<EducationCycle>(ENDPOINTS.education.cycleById(id), { method: "PUT", body: payload }),
    deleteCycle: (id: UUID) =>
      apiFetch<EducationCycle>(ENDPOINTS.education.cycleById(id), { method: "DELETE" }),
    levels: () => apiFetch<Level[]>(ENDPOINTS.education.levels),
    createLevel: (payload: { cycle_id?: UUID | null; name_fr: string; name_en: string; order_index: number }) =>
      apiFetch<Level>(ENDPOINTS.education.levels, { method: "POST", body: payload }),
    updateLevel: (id: UUID, payload: { cycle_id?: UUID | null; name_fr: string; name_en: string; order_index: number }) =>
      apiFetch<Level>(ENDPOINTS.education.levelById(id), { method: "PUT", body: payload }),
    deleteLevel: (id: UUID) =>
      apiFetch<Level>(ENDPOINTS.education.levelById(id), { method: "DELETE" }),
    specialties: () => apiFetch<Specialty[]>(ENDPOINTS.education.specialties),
    createSpecialty: (payload: { name_fr: string; name_en: string; description_fr?: string | null; description_en?: string | null }) =>
      apiFetch<Specialty>(ENDPOINTS.education.specialties, { method: "POST", body: payload }),
    updateSpecialty: (id: UUID, payload: { name_fr: string; name_en: string; description_fr?: string | null; description_en?: string | null }) =>
      apiFetch<Specialty>(ENDPOINTS.education.specialtyById(id), { method: "PUT", body: payload }),
    deleteSpecialty: (id: UUID) =>
      apiFetch<Specialty>(ENDPOINTS.education.specialtyById(id), { method: "DELETE" }),
    subjects: () => apiFetch<Subject[]>(ENDPOINTS.education.subjects),
    subjectById: (id: UUID) => apiFetch<Subject>(ENDPOINTS.education.subjectById(id)),
    createSubject: (payload: {
      level_id: UUID;
      specialty_id?: UUID | null;
      code?: string | null;
      name_fr: string;
      name_en: string;
      description_fr?: string | null;
      description_en?: string | null;
      icon?: string | null;
      color?: string | null;
      is_active?: boolean;
      coefficient: number;
    }) =>
      apiFetch<Subject>(ENDPOINTS.education.subjects, { method: "POST", body: payload }),
    updateSubject: (id: UUID, payload: {
      level_id: UUID;
      specialty_id?: UUID | null;
      code?: string | null;
      name_fr: string;
      name_en: string;
      description_fr?: string | null;
      description_en?: string | null;
      icon?: string | null;
      color?: string | null;
      is_active?: boolean;
      coefficient: number;
    }) =>
      apiFetch<Subject>(ENDPOINTS.education.subjectById(id), { method: "PUT", body: payload }),
    deleteSubject: (id: UUID) =>
      apiFetch<Subject>(ENDPOINTS.education.subjectById(id), { method: "DELETE" }),
  },

  contents: {
    approved: () => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.approved)),
    all: () => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.all)),
    recent: () => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.recent)),
    popular: () => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.popular)),
    featured: () => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.featured)),
    offline: () => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.offline)),
    premium: () => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.premium)),
    my: () => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.myContents)),
    pendingReview: () => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.pendingReview)),
    byId: (id: UUID) => apiFetch<Content>(ENDPOINTS.contents.byId(id)),
    byType: (type: string) => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.byType(type))),
    bySubject: (subjectId: UUID) => apiFetch<Content[]>(pagedUrl(ENDPOINTS.contents.bySubject(subjectId))),
    create: (payload: Partial<Content>) =>
      apiFetch<Content>(ENDPOINTS.contents.all, {
        method: "POST",
        body: payload,
      }),
    update: (id: UUID, payload: Partial<Content>) =>
      apiFetch<Content>(ENDPOINTS.contents.byId(id), {
        method: "PUT",
        body: payload,
      }),
    remove: (id: UUID) =>
      apiFetch<Content>(ENDPOINTS.contents.byId(id), { method: "DELETE" }),
    publish: (id: UUID) =>
      apiFetch<Content>(ENDPOINTS.contents.publish(id), { method: "PUT" }),
    archive: (id: UUID) =>
      apiFetch<Content>(ENDPOINTS.contents.archive(id), { method: "PUT" }),
    view: (id: UUID) =>
      apiFetch<{ message: string }>(ENDPOINTS.contents.view(id), {
        method: "POST",
      }),
    download: (id: UUID) =>
      apiFetch<{ message: string }>(ENDPOINTS.contents.download(id), {
        method: "POST",
      }),
    like: (id: UUID) =>
      apiFetch<{ message: string }>(ENDPOINTS.contents.like(id), {
        method: "POST",
      }),
    translations: (id: UUID) => apiFetch(ENDPOINTS.contents.contentTranslations(id)),
    createTranslation: (payload: {
      content_id: UUID;
      language: string;
      title: string;
      description?: string;
    }) =>
      apiFetch(ENDPOINTS.contents.translations, {
        method: "POST",
        body: payload,
      }),
    analytics: (id: UUID) => apiFetch(ENDPOINTS.contents.analytics(id)),
    related: (id: UUID) => apiFetch<Content[]>(ENDPOINTS.contents.related(id)),
  },

  questions: {
    mine: () => apiFetch<Question[]>(ENDPOINTS.questions.me),
    all: () => apiFetch<Question[]>(ENDPOINTS.questions.all),
    pendingTeacher: () =>
      apiFetch<Question[]>(ENDPOINTS.questions.pendingTeacher),
    byId: (id: UUID) => apiFetch<Question>(ENDPOINTS.questions.byId(id)),
    create: (payload: CreateQuestionPayload) =>
      apiFetch<Question>(ENDPOINTS.questions.all, {
        method: "POST",
        body: payload,
      }),
    requestTeacher: (id: UUID) =>
      apiFetch<Question>(ENDPOINTS.questions.requestTeacher(id), {
        method: "POST",
      }),
  },

  teacher: {
    availableQuestions: () =>
      apiFetch<Question[]>(ENDPOINTS.teacherQuestions.available),
    pendingQuestions: () =>
      apiFetch<Question[]>(ENDPOINTS.teacherQuestions.pending),
    assignedQuestions: () =>
      apiFetch<Question[]>(ENDPOINTS.teacherQuestions.assigned),
    takeQuestion: (id: UUID) =>
      apiFetch(ENDPOINTS.teacherQuestions.take(id), { method: "POST" }),
    answerQuestion: (
      id: UUID,
      payload: { answer_text: string; attachment_url?: string; language?: string }
    ) =>
      apiFetch(ENDPOINTS.teacherQuestions.answer(id), {
        method: "POST",
        body: payload,
      }),
    subjects: (teacherId: UUID) =>
      apiFetch(ENDPOINTS.teacherSubjects.byTeacher(teacherId)),
    mySubjects: () => apiFetch(ENDPOINTS.teacherSubjects.me),
    updateMySubjects: (subjectIds: UUID[]) =>
      apiFetch(ENDPOINTS.teacherSubjects.updateMe, {
        method: "PUT",
        body: { subject_ids: subjectIds },
      }),
    removeSubject: (teacherSubjectId: UUID) =>
      apiFetch(ENDPOINTS.teacherSubjects.remove(teacherSubjectId), {
        method: "DELETE",
      }),
    teachersBySubject: (subjectId: UUID) =>
      apiFetch<Array<Pick<User, "id" | "nom" | "prenom" | "profile_url" | "role"> & { subject_id: UUID }>>(
        ENDPOINTS.teacherSubjects.teachersBySubject(subjectId)
      ),
  },

  studentAnswers: {
    byQuestion: (questionId: UUID) =>
      apiFetch(ENDPOINTS.studentAnswers.byQuestion(questionId)),
    myAnswers: () => apiFetch(ENDPOINTS.studentAnswers.myAnswers),
    pending: () => apiFetch(ENDPOINTS.studentAnswers.pending),
    answered: () => apiFetch(ENDPOINTS.studentAnswers.answered),
    stats: () => apiFetch(ENDPOINTS.studentAnswers.stats),
  },

  teacherAnswers: {
    byQuestion: (questionId: UUID) =>
      apiFetch<TeacherAnswer[]>(ENDPOINTS.teacherAnswers.byQuestion(questionId)),
    create: (payload: {
      question_id: UUID;
      answer_text: string;
      attachment_url?: string;
      language?: string;
      status?: string;
    }) =>
      apiFetch<TeacherAnswer>(ENDPOINTS.teacherAnswers.create, {
        method: "POST",
        body: payload,
      }),
  },

  ai: {
    chat: (payload: {
      question: string;
      subject_id?: UUID | null;
      level_id?: UUID | null;
      language?: string;
      mode?: string;
    }) =>
      apiFetch<{ answer: string; cached: boolean; remaining_requests: number }>(
        ENDPOINTS.ai.chat,
        {
          method: "POST",
          body: payload,
        }
      ),
  },

  gamification: {
    profile: () =>
      apiFetch<StudentGamificationProfile>(ENDPOINTS.gamification.profile),
    myBadges: () => apiFetch<StudentBadge[]>(ENDPOINTS.gamification.myBadges),
    checkBadges: () =>
      apiFetch(ENDPOINTS.gamification.checkBadges, { method: "POST" }),
    leaderboard: () => apiFetch(ENDPOINTS.gamification.leaderboard),
    badges: () => apiFetch(ENDPOINTS.gamification.badges),
  },

  statistics: {
    adminOverview: () => apiFetch(ENDPOINTS.statistics.adminOverview),
    teacherOverview: () => apiFetch(ENDPOINTS.statistics.teacherOverview),
    studentOverview: () => apiFetch(ENDPOINTS.statistics.studentOverview),
    leaderboards: () => apiFetch(ENDPOINTS.statistics.leaderboards),
  },

  adaptive: {
    profile: () => apiFetch(ENDPOINTS.adaptive.profile),
    weaknesses: () => apiFetch(ENDPOINTS.adaptive.weaknesses),
    progress: () => apiFetch(ENDPOINTS.adaptive.progress),
    recommendations: () => apiFetch(ENDPOINTS.adaptive.recommendations),
  },

  quizzes: {
    all: () => apiFetch<Quiz[]>(pagedUrl(ENDPOINTS.quizzes.all)),
    byCourse: (id: UUID) => apiFetch<Quiz[]>(pagedUrl(ENDPOINTS.quizzes.byCourse(id))),
    byId: (id: UUID) => apiFetch<Quiz>(ENDPOINTS.quizzes.byId(id)),
    create: (payload: Partial<Quiz>) =>
      apiFetch<Quiz>(ENDPOINTS.quizzes.all, {
        method: "POST",
        body: payload,
      }),
    history: () => apiFetch(pagedUrl(ENDPOINTS.quizzes.history)),
    start: (id: UUID) =>
      apiFetch<{ attempt_id: UUID; quiz_id: UUID; started_at: string }>(
        ENDPOINTS.quizzes.start(id),
        { method: "POST" }
      ),
    submit: (quizId: UUID, attemptId: UUID, answers: Record<string, string>) =>
      apiFetch(ENDPOINTS.quizzes.submit(quizId, attemptId), {
        method: "POST",
        body: { answers },
      }),
  },

  studyPlanner: {
    current: () => apiFetch<StudyPlan>(ENDPOINTS.studyPlanner.current),
    today: () => apiFetch<StudyPlanItem[]>(ENDPOINTS.studyPlanner.today),
    history: () => apiFetch<StudyPlan[]>(ENDPOINTS.studyPlanner.history),
    generate: (payload: {
      title?: string;
      language?: string;
      duration_days?: number;
      max_items?: number;
    }) =>
      apiFetch<StudyPlan>(ENDPOINTS.studyPlanner.generate, {
        method: "POST",
        body: payload,
      }),
    complete: (id: UUID) =>
      apiFetch<StudyPlanItem>(ENDPOINTS.studyPlanner.completeItem(id), {
        method: "PUT",
      }),
  },

  notifications: {
    mine: () => apiFetch<Notification[]>(ENDPOINTS.notifications.me),
    all: () => apiFetch<Notification[]>(ENDPOINTS.notifications.all),
    create: (payload: Partial<Notification>) =>
      apiFetch<Notification>(ENDPOINTS.notifications.all, { method: "POST", body: payload }),
    read: (id: UUID) =>
      apiFetch<Notification>(ENDPOINTS.notifications.read(id), {
        method: "POST",
      }),
  },

  payments: {
    plans: () => apiFetch<SubscriptionPlan[]>(ENDPOINTS.payments.plans),
    createPlan: (payload: {
      code: string;
      name: string;
      price_xaf: number;
      duration_days: number;
      description?: string;
    }) => {
      const params = new URLSearchParams({
        code: payload.code,
        name: payload.name,
        price_xaf: String(payload.price_xaf),
        duration_days: String(payload.duration_days),
      });
      if (payload.description) params.set("description", payload.description);
      return apiFetch<SubscriptionPlan>(`${ENDPOINTS.payments.plans}?${params.toString()}`, {
        method: "POST",
      });
    },
    subscription: () =>
      apiFetch<SubscriptionStatus>(ENDPOINTS.payments.subscriptionMe),
    transactions: () => apiFetch(ENDPOINTS.payments.transactionsMe),
    init: (payload: {
      plan_id: UUID;
      phone_number: string;
      payment_method: "MTN" | "ORANGE";
    }) =>
      apiFetch(ENDPOINTS.payments.init, {
        method: "POST",
        body: payload,
      }),
  },

  progress: {
    stats: () => apiFetch(ENDPOINTS.contentProgress.stats),
    mine: () => apiFetch(ENDPOINTS.contentProgress.myProgress),
    completed: () => apiFetch(ENDPOINTS.contentProgress.completed),
    favorites: () => apiFetch(ENDPOINTS.contentProgress.favorites),
    start: (contentId: UUID) =>
      apiFetch(ENDPOINTS.contentProgress.start(contentId), { method: "POST" }),
    update: (
      contentId: UUID,
      payload: { progress_percent: number; time_spent_minutes?: number }
    ) =>
      apiFetch(ENDPOINTS.contentProgress.progress(contentId), {
        method: "PUT",
        body: payload,
      }),
    complete: (contentId: UUID) =>
      apiFetch(ENDPOINTS.contentProgress.complete(contentId), {
        method: "POST",
      }),
    favorite: (contentId: UUID) =>
      apiFetch(ENDPOINTS.contentProgress.favorite(contentId), {
        method: "POST",
      }),
    unfavorite: (contentId: UUID) =>
      apiFetch(ENDPOINTS.contentProgress.unfavorite(contentId), {
        method: "DELETE",
      }),
    rate: (contentId: UUID, payload: { rating: number; review?: string }) =>
      apiFetch(ENDPOINTS.contentProgress.rate(contentId), {
        method: "POST",
        body: payload,
      }),
  },

  schools: {
    all: () => apiFetch<School[]>(ENDPOINTS.schools.all),
    byId: (id: UUID) => apiFetch<School>(ENDPOINTS.schools.byId(id)),
    create: (payload: { name: string; type?: string | null; address_id?: UUID | null }) =>
      apiFetch<School>(ENDPOINTS.schools.all, { method: "POST", body: payload }),
    update: (id: UUID, payload: { name: string; type?: string | null; address_id?: UUID | null }) =>
      apiFetch<School>(ENDPOINTS.schools.byId(id), { method: "PUT", body: payload }),
    remove: (id: UUID) => apiFetch<School>(ENDPOINTS.schools.byId(id), { method: "DELETE" }),
    createSchool: (payload: { name: string; type?: string | null; address_id?: UUID | null }) =>
      apiFetch<School>(ENDPOINTS.schools.all, { method: "POST", body: payload }),
    updateSchool: (id: UUID, payload: { name: string; type?: string | null; address_id?: UUID | null }) =>
      apiFetch<School>(ENDPOINTS.schools.byId(id), { method: "PUT", body: payload }),
    deleteSchool: (id: UUID) => apiFetch<School>(ENDPOINTS.schools.byId(id), { method: "DELETE" }),
    addresses: () => apiFetch<Address[]>(ENDPOINTS.schools.addresses),
    createAddress: (payload: { country?: string; region?: string | null; city?: string | null; quarter?: string | null; details?: string | null }) =>
      apiFetch<Address>(ENDPOINTS.schools.addresses, { method: "POST", body: payload }),
    updateAddress: (id: UUID, payload: { country?: string; region?: string | null; city?: string | null; quarter?: string | null; details?: string | null }) =>
      apiFetch<Address>(ENDPOINTS.schools.addressById(id), { method: "PUT", body: payload }),
    deleteAddress: (id: UUID) => apiFetch<Address>(ENDPOINTS.schools.addressById(id), { method: "DELETE" }),
  },

  uploads: {
    questionImage: (file: File) => uploadFile(ENDPOINTS.uploads.questionImage, file),
    teacherAnswer: (file: File) => uploadFile(ENDPOINTS.uploads.teacherAnswer, file),
    contentFile: (file: File) => uploadFile(ENDPOINTS.uploads.contentFile, file),
    contentThumbnail: (file: File) =>
      uploadFile(ENDPOINTS.uploads.contentThumbnail, file),
    contentVideo: (file: File) => uploadFile(ENDPOINTS.uploads.contentVideo, file),
    contentAudio: (file: File) => uploadFile(ENDPOINTS.uploads.contentAudio, file),
    profile: (file: File) => uploadFile(ENDPOINTS.uploads.profile, file),
    proof: (file: File) => uploadFile(ENDPOINTS.uploads.proof, file),
    publicFileUrl: (fileUrl: string) => {
      const cleanPath = fileUrl
        .replace(/^\/app\/uploads\//, "")
        .replace(/^\/uploads\//, "")
        .replace(/^\//, "");

      return `${ENDPOINTS.uploads.file}?file_url=${encodeURIComponent(cleanPath)}`;
    },
    fileUrl: (fileUrl: string) =>
      `${ENDPOINTS.uploads.file}?file_url=${encodeURIComponent(fileUrl)}`,
    downloadUrl: (fileUrl: string) =>
      `${ENDPOINTS.uploads.download}?file_url=${encodeURIComponent(fileUrl)}`,
    streamUrl: (fileUrl: string) =>
      `${ENDPOINTS.uploads.stream}?file_url=${encodeURIComponent(fileUrl)}`,
  },

  admin: {
    globalStats: () => apiFetch<AdminGlobalStats>(ENDPOINTS.admin.globalStats),
    aiStats: () => apiFetch(ENDPOINTS.admin.aiStats),
    teachersStats: () => apiFetch(ENDPOINTS.admin.teachersStats),
    questionsStats: () => apiFetch(ENDPOINTS.admin.questionsStats),
    studentsStats: () => apiFetch(ENDPOINTS.admin.studentsStats),
    cacheStats: () => apiFetch(ENDPOINTS.admin.cacheStats),
    activityStats: () => apiFetch(ENDPOINTS.admin.activityStats),
    recentActivity: () => apiFetch(ENDPOINTS.admin.recentActivity),
    health: () => apiFetch(ENDPOINTS.admin.health),
    educationStats: () => apiFetch(ENDPOINTS.admin.educationStats),
  },
};

function pagedUrl(url: string, limit = 50, skip = 0) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}skip=${skip}&limit=${limit}`;
}

function uploadFile(url: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<{
    message?: string;
    file_url: string;
    filename?: string;
    original_filename?: string;
    size_bytes?: number;
  }>(url, {
    method: "POST",
    body: formData,
  });
}
