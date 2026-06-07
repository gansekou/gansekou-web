const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export const ENDPOINTS = {
  auth: {
    firebaseLogin: `${API_BASE_URL}/auth/firebase-login`,
    registerEmail: `${API_BASE_URL}/auth/register-email`,
  },

  users: {
    all: `${API_BASE_URL}/users/`,
    meProfile: `${API_BASE_URL}/users/me/profile`,
    updateMyProfile: `${API_BASE_URL}/users/me/profile`,
    updateMe: `${API_BASE_URL}/users/me`,
    teacherApplication: `${API_BASE_URL}/users/me/teacher-application`,
    updateRole: (userId: string) => `${API_BASE_URL}/users/${userId}/role`,
    byId: (userId: string) => `${API_BASE_URL}/users/${userId}`,
  },

  schools: {
    all: `${API_BASE_URL}/schools/`,
    byId: (schoolId: string) => `${API_BASE_URL}/schools/${schoolId}`,
    addresses: `${API_BASE_URL}/schools/addresses`,
    addressById: (addressId: string) =>
      `${API_BASE_URL}/schools/addresses/${addressId}`,
  },

  education: {
    cycles: `${API_BASE_URL}/education/cycles`,
    cycleById: (cycleId: string) =>
      `${API_BASE_URL}/education/cycles/${cycleId}`,

    levels: `${API_BASE_URL}/education/levels`,
    levelById: (levelId: string) =>
      `${API_BASE_URL}/education/levels/${levelId}`,

    specialties: `${API_BASE_URL}/education/specialties`,
    specialtyById: (specialtyId: string) =>
      `${API_BASE_URL}/education/specialties/${specialtyId}`,

    subjects: `${API_BASE_URL}/education/subjects`,
    subjectById: (subjectId: string) =>
      `${API_BASE_URL}/education/subjects/${subjectId}`,
  },

  contents: {
    all: `${API_BASE_URL}/contents/`,
    approved: `${API_BASE_URL}/contents/approved`,
    offline: `${API_BASE_URL}/contents/offline`,
    byLevel: (levelId: string) =>
      `${API_BASE_URL}/contents/by-level/${levelId}`,
    bySubject: (subjectId: string) =>
      `${API_BASE_URL}/contents/by-subject/${subjectId}`,
    search: `${API_BASE_URL}/contents/search/`,
    byType: (contentType: string) =>
      `${API_BASE_URL}/contents/by-type/${contentType}`,
    premium: `${API_BASE_URL}/contents/premium/all`,
    featured: `${API_BASE_URL}/contents/featured/all`,
    popular: `${API_BASE_URL}/contents/popular/all`,
    recent: `${API_BASE_URL}/contents/recent/all`,
    myContents: `${API_BASE_URL}/contents/me/my-contents`,
    pendingReview: `${API_BASE_URL}/contents/pending/review`,
    byId: (contentId: string) => `${API_BASE_URL}/contents/${contentId}`,
    publish: (contentId: string) =>
      `${API_BASE_URL}/contents/${contentId}/publish`,
    archive: (contentId: string) =>
      `${API_BASE_URL}/contents/${contentId}/archive`,
    view: (contentId: string) =>
      `${API_BASE_URL}/contents/${contentId}/view`,
    download: (contentId: string) =>
      `${API_BASE_URL}/contents/${contentId}/download`,
    like: (contentId: string) =>
      `${API_BASE_URL}/contents/${contentId}/like`,
    analytics: (contentId: string) =>
      `${API_BASE_URL}/contents/${contentId}/analytics`,
    related: (contentId: string) =>
      `${API_BASE_URL}/contents/${contentId}/related`,

    translations: `${API_BASE_URL}/contents/translations`,
    translationById: (translationId: string) =>
      `${API_BASE_URL}/contents/translations/${translationId}`,
    contentTranslations: (contentId: string) =>
      `${API_BASE_URL}/contents/${contentId}/translations`,
  },

  questions: {
    all: `${API_BASE_URL}/questions/`,
    me: `${API_BASE_URL}/questions/me`,
    byId: (questionId: string) => `${API_BASE_URL}/questions/${questionId}`,
    byStudent: (studentId: string) =>
      `${API_BASE_URL}/questions/student/${studentId}`,
    pendingTeacher: `${API_BASE_URL}/questions/pending-teacher`,
    requestTeacher: (questionId: string) =>
      `${API_BASE_URL}/questions/${questionId}/request-teacher`,
    aiAnswers: `${API_BASE_URL}/questions/ai-answers`,
    teacherAnswers: `${API_BASE_URL}/questions/teacher-answers`,
  },

  notifications: {
    all: `${API_BASE_URL}/notifications/`,
    me: `${API_BASE_URL}/notifications/me`,
    byUser: (userId: string) =>
      `${API_BASE_URL}/notifications/user/${userId}`,
    byId: (notificationId: string) =>
      `${API_BASE_URL}/notifications/${notificationId}`,
    read: (notificationId: string) =>
      `${API_BASE_URL}/notifications/${notificationId}/read`,
  },

  sync: {
    devices: `${API_BASE_URL}/sync/devices`,
    myDevices: `${API_BASE_URL}/sync/devices/me`,
    userDevices: (userId: string) =>
      `${API_BASE_URL}/sync/devices/user/${userId}`,
    deviceById: (deviceId: string) =>
      `${API_BASE_URL}/sync/devices/${deviceId}`,

    logs: `${API_BASE_URL}/sync/logs`,
    myLogs: `${API_BASE_URL}/sync/logs/me`,
    userLogs: (userId: string) =>
      `${API_BASE_URL}/sync/logs/user/${userId}`,

    offlinePackage: `${API_BASE_URL}/sync/offline-package`,
    unsyncedQuestions: `${API_BASE_URL}/sync/unsynced-questions`,
  },

  uploads: {
    profile: `${API_BASE_URL}/uploads/profile`,
    proof: `${API_BASE_URL}/uploads/proof`,
    contentFile: `${API_BASE_URL}/uploads/content/file`,
    contentThumbnail: `${API_BASE_URL}/uploads/content/thumbnail`,
    contentVideo: `${API_BASE_URL}/uploads/content/video`,
    contentAudio: `${API_BASE_URL}/uploads/content/audio`,
    questionImage: `${API_BASE_URL}/uploads/question-image`,
    teacherAnswer: `${API_BASE_URL}/uploads/teacher-answer`,
    file: `${API_BASE_URL}/uploads/file`,
    stream: `${API_BASE_URL}/uploads/stream`,
    download: `${API_BASE_URL}/uploads/download`,
    limits: `${API_BASE_URL}/uploads/limits`,
  },

  ai: {
    chat: `${API_BASE_URL}/ai/chat`,
    exercises: `${API_BASE_URL}/ai/generate/exercises`,
    revisionSheet: `${API_BASE_URL}/ai/generate/revision-sheet`,
    quizPlan: `${API_BASE_URL}/ai/generate/quiz`,
  },

  teacherSubjects: {
    me: `${API_BASE_URL}/teacher-subjects/me`,
    updateMe: `${API_BASE_URL}/teacher-subjects/me`,
    assign: (teacherId: string, subjectId: string) =>
      `${API_BASE_URL}/teacher-subjects/${teacherId}/${subjectId}`,
    byTeacher: (teacherId: string) =>
      `${API_BASE_URL}/teacher-subjects/teacher/${teacherId}`,
    teachersBySubject: (subjectId: string) =>
      `${API_BASE_URL}/teacher-subjects/teachers/by-subject/${subjectId}`,
    remove: (teacherSubjectId: string) =>
      `${API_BASE_URL}/teacher-subjects/${teacherSubjectId}`,
  },

  teacherQuestions: {
    available: `${API_BASE_URL}/teacher-questions/available`,
    pending: `${API_BASE_URL}/teacher-questions/available`,
    assigned: `${API_BASE_URL}/teacher-questions/assigned`,
    take: (questionId: string) =>
      `${API_BASE_URL}/teacher-questions/${questionId}/take`,
    answer: (questionId: string) =>
      `${API_BASE_URL}/teacher-questions/${questionId}/answer`,
  },

  teacherAnswers: {
    byQuestion: (questionId: string) =>
      `${API_BASE_URL}/teacher-answers/question/${questionId}`,
    create: `${API_BASE_URL}/teacher-answers/`,
  },

  studentAnswers: {
    byQuestion: (questionId: string) =>
      `${API_BASE_URL}/student-answers/question/${questionId}`,
    myAnswers: `${API_BASE_URL}/student-answers/my-answers`,
    myQuestions: `${API_BASE_URL}/student-answers/my-questions`,
    pending: `${API_BASE_URL}/student-answers/pending`,
    answered: `${API_BASE_URL}/student-answers/answered`,
    stats: `${API_BASE_URL}/student-answers/stats`,
  },

  admin: {
    updateUserRole: (userId: string) => `${API_BASE_URL}/admin/users/${userId}/role`,
    globalStats: `${API_BASE_URL}/admin/stats/global`,
    aiStats: `${API_BASE_URL}/admin/stats/ai`,
    teachersStats: `${API_BASE_URL}/admin/stats/teachers`,
    questionsStats: `${API_BASE_URL}/admin/stats/questions`,
    studentsStats: `${API_BASE_URL}/admin/stats/students`,
    cacheStats: `${API_BASE_URL}/admin/stats/cache`,
    activityStats: `${API_BASE_URL}/admin/stats/activity`,
    educationStats: `${API_BASE_URL}/admin/stats/education`,
    recentActivity: `${API_BASE_URL}/admin/stats/recent`,
    health: `${API_BASE_URL}/admin/stats/health`,
  },

  quizzes: {
    all: `${API_BASE_URL}/quizzes/`,
    byCourse: (courseId: string) => `${API_BASE_URL}/quizzes/by-course/${courseId}`,
    byId: (quizId: string) => `${API_BASE_URL}/quizzes/${quizId}`,
    manage: (quizId: string) => `${API_BASE_URL}/quizzes/${quizId}/manage`,
    addQuestion: (quizId: string) =>
      `${API_BASE_URL}/quizzes/${quizId}/questions`,
    questionById: (questionId: string) =>
      `${API_BASE_URL}/quizzes/questions/${questionId}`,
    addChoice: (questionId: string) =>
      `${API_BASE_URL}/quizzes/questions/${questionId}/choices`,
    choiceById: (choiceId: string) =>
      `${API_BASE_URL}/quizzes/choices/${choiceId}`,
    start: (quizId: string) => `${API_BASE_URL}/quizzes/${quizId}/start`,
    submit: (quizId: string, attemptId: string) =>
      `${API_BASE_URL}/quizzes/${quizId}/submit/${attemptId}`,
    attemptResult: (attemptId: string) =>
      `${API_BASE_URL}/quizzes/attempts/${attemptId}`,
    history: `${API_BASE_URL}/quizzes/me/history`,
    leaderboard: (quizId: string) =>
      `${API_BASE_URL}/quizzes/${quizId}/leaderboard`,
    analytics: (quizId: string) =>
      `${API_BASE_URL}/quizzes/${quizId}/analytics`,
    generateAi: `${API_BASE_URL}/quizzes/ai/generate`,
  },

  adaptive: {
    analyzeAttempt: (attemptId: string) =>
      `${API_BASE_URL}/adaptive/analyze-attempt/${attemptId}`,
    profile: `${API_BASE_URL}/adaptive/me/profile`,
    weaknesses: `${API_BASE_URL}/adaptive/me/weaknesses`,
    progress: `${API_BASE_URL}/adaptive/me/progress`,
    recommendations: `${API_BASE_URL}/adaptive/me/recommendations`,
  },

  gamification: {
    profile: `${API_BASE_URL}/gamification/me/profile`,
    myBadges: `${API_BASE_URL}/gamification/me/badges`,
    leaderboard: `${API_BASE_URL}/gamification/leaderboard`,
    checkBadges: `${API_BASE_URL}/gamification/me/check-badges`,
    awardPoints: (studentId: string) =>
      `${API_BASE_URL}/gamification/admin/award-points/${studentId}`,
    badges: `${API_BASE_URL}/gamification/badges`,
  },

  statistics: {
    adminOverview: `${API_BASE_URL}/statistics/admin/overview`,
    teacherOverview: `${API_BASE_URL}/statistics/teacher/overview`,
    studentOverview: `${API_BASE_URL}/statistics/student/overview`,
    leaderboards: `${API_BASE_URL}/statistics/leaderboards`,
  },

  realtime: {
    websocket: (userId: string) => `${API_BASE_URL.replace(/^http/, "ws")}/ws/${userId}`,
  },

  studyPlanner: {
    generate: `${API_BASE_URL}/study-planner/generate`,
    current: `${API_BASE_URL}/study-planner/me/current`,
    currentItems: `${API_BASE_URL}/study-planner/me/current/items`,
    history: `${API_BASE_URL}/study-planner/me/history`,
    today: `${API_BASE_URL}/study-planner/me/today`,
    completeItem: (itemId: string) =>
      `${API_BASE_URL}/study-planner/items/${itemId}/complete`,
  },

  contentProgress: {
    start: (contentId: string) =>
      `${API_BASE_URL}/content-progress/${contentId}/start`,
    progress: (contentId: string) =>
      `${API_BASE_URL}/content-progress/${contentId}/progress`,
    complete: (contentId: string) =>
      `${API_BASE_URL}/content-progress/${contentId}/complete`,
    favorite: (contentId: string) =>
      `${API_BASE_URL}/content-progress/${contentId}/favorite`,
    unfavorite: (contentId: string) =>
      `${API_BASE_URL}/content-progress/${contentId}/favorite`,
    rate: (contentId: string) =>
      `${API_BASE_URL}/content-progress/${contentId}/rate`,
    download: (contentId: string) =>
      `${API_BASE_URL}/content-progress/${contentId}/download`,

    myProgress: `${API_BASE_URL}/content-progress/me/progress`,
    completed: `${API_BASE_URL}/content-progress/me/completed`,
    favorites: `${API_BASE_URL}/content-progress/me/favorites`,
    ratings: `${API_BASE_URL}/content-progress/me/ratings`,
    stats: `${API_BASE_URL}/content-progress/me/stats`,
  },

  payments: {
    plans: `${API_BASE_URL}/payments/plans`,
    init: `${API_BASE_URL}/payments/init`,
    transactionsMe: `${API_BASE_URL}/payments/transactions/me`,
    subscriptionMe: `${API_BASE_URL}/payments/subscription/me`,
    verifyTransaction: (transactionId: string) =>
      `${API_BASE_URL}/payments/transactions/${transactionId}/verify`,
    webhookCampay: `${API_BASE_URL}/payments/webhook/campay`,
  },

  system: {
    root: "http://127.0.0.1:8000/",
    health: "http://127.0.0.1:8000/health",
  },
} as const;
