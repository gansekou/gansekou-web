import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

export const dashboardService = {
  // =========================================================
  // STUDENT DASHBOARD
  // =========================================================

  async student() {
    const [
      profile,
      contentStats,
      learningProgress,
      completedContents,
      favoriteContents,
      ratings,
      quizHistory,
      adaptiveProfile,
      adaptiveWeaknesses,
      adaptiveProgress,
      adaptiveRecommendations,
      gamificationProfile,
      badges,
      leaderboard,
      notifications,
      pendingQuestions,
      answeredQuestions,
      questionStats,
      studyPlan,
      studyToday,
      premiumContents,
      featuredContents,
      recentContents,
    ] = await Promise.allSettled([
      apiFetch(ENDPOINTS.users.meProfile),

      apiFetch(ENDPOINTS.contentProgress.stats),
      apiFetch(ENDPOINTS.contentProgress.myProgress),
      apiFetch(ENDPOINTS.contentProgress.completed),
      apiFetch(ENDPOINTS.contentProgress.favorites),
      apiFetch(ENDPOINTS.contentProgress.ratings),

      apiFetch(ENDPOINTS.quizzes.history),

      apiFetch(ENDPOINTS.adaptive.profile),
      apiFetch(ENDPOINTS.adaptive.weaknesses),
      apiFetch(ENDPOINTS.adaptive.progress),
      apiFetch(ENDPOINTS.adaptive.recommendations),

      apiFetch(ENDPOINTS.gamification.profile),
      apiFetch(ENDPOINTS.gamification.myBadges),
      apiFetch(ENDPOINTS.gamification.leaderboard),

      apiFetch(ENDPOINTS.notifications.me),

      apiFetch(ENDPOINTS.studentAnswers.pending),
      apiFetch(ENDPOINTS.studentAnswers.answered),
      apiFetch(ENDPOINTS.studentAnswers.stats),

      apiFetch(ENDPOINTS.studyPlanner.current),
      apiFetch(ENDPOINTS.studyPlanner.today),

      apiFetch(ENDPOINTS.contents.premium),
      apiFetch(ENDPOINTS.contents.featured),
      apiFetch(ENDPOINTS.contents.recent),
    ]);

    return {
      profile,
      contentStats,
      learningProgress,
      completedContents,
      favoriteContents,
      ratings,
      quizHistory,
      adaptiveProfile,
      adaptiveWeaknesses,
      adaptiveProgress,
      adaptiveRecommendations,
      gamificationProfile,
      badges,
      leaderboard,
      notifications,
      pendingQuestions,
      answeredQuestions,
      questionStats,
      studyPlan,
      studyToday,
      premiumContents,
      featuredContents,
      recentContents,
    };
  },

  // =========================================================
  // TEACHER DASHBOARD
  // =========================================================

  async teacher(teacherId: string) {
    const [
      profile,
      teacherSubjects,
      pendingTeacherQuestions,
      assignedTeacherQuestions,
      notifications,
      contents,
      pendingReviewContents,
      recentContents,
      leaderboard,
    ] = await Promise.allSettled([
      apiFetch(ENDPOINTS.users.meProfile),

      apiFetch(
        ENDPOINTS.teacherSubjects.byTeacher(teacherId)
      ),

      apiFetch(ENDPOINTS.teacherQuestions.pending),

      apiFetch(ENDPOINTS.teacherQuestions.assigned),

      apiFetch(ENDPOINTS.notifications.me),

      apiFetch(ENDPOINTS.contents.myContents),

      apiFetch(ENDPOINTS.contents.pendingReview),

      apiFetch(ENDPOINTS.contents.recent),

      apiFetch(ENDPOINTS.gamification.leaderboard),
    ]);

    return {
      profile,
      teacherSubjects,
      pendingTeacherQuestions,
      assignedTeacherQuestions,
      notifications,
      contents,
      pendingReviewContents,
      recentContents,
      leaderboard,
    };
  },

  // =========================================================
  // ADMIN DASHBOARD
  // =========================================================

  async admin() {
    const [
      globalStats,
      aiStats,
      teachersStats,
      questionsStats,
      studentsStats,
      cacheStats,
      activityStats,
      educationStats,
      recentActivity,
      healthStats,

      schools,
      users,
      contents,
      quizzes,
      notifications,
      leaderboard,
      premiumContents,
      pendingReviewContents,
    ] = await Promise.allSettled([
      apiFetch(ENDPOINTS.admin.globalStats),
      apiFetch(ENDPOINTS.admin.aiStats),
      apiFetch(ENDPOINTS.admin.teachersStats),
      apiFetch(ENDPOINTS.admin.questionsStats),
      apiFetch(ENDPOINTS.admin.studentsStats),
      apiFetch(ENDPOINTS.admin.cacheStats),
      apiFetch(ENDPOINTS.admin.activityStats),
      apiFetch(ENDPOINTS.admin.educationStats),
      apiFetch(ENDPOINTS.admin.recentActivity),
      apiFetch(ENDPOINTS.admin.health),

      apiFetch(ENDPOINTS.schools.all),
      apiFetch(ENDPOINTS.users.all),
      apiFetch(ENDPOINTS.contents.all),
      apiFetch(ENDPOINTS.quizzes.all),
      apiFetch(ENDPOINTS.notifications.all),
      apiFetch(ENDPOINTS.gamification.leaderboard),
      apiFetch(ENDPOINTS.contents.premium),
      apiFetch(ENDPOINTS.contents.pendingReview),
    ]);

    return {
      globalStats,
      aiStats,
      teachersStats,
      questionsStats,
      studentsStats,
      cacheStats,
      activityStats,
      educationStats,
      recentActivity,
      healthStats,

      schools,
      users,
      contents,
      quizzes,
      notifications,
      leaderboard,
      premiumContents,
      pendingReviewContents,
    };
  },

  // =========================================================
  // COMMON GLOBAL DATA
  // =========================================================

  async bootstrap() {
    const [
      cycles,
      levels,
      specialties,
      subjects,
      featuredContents,
      popularContents,
      premiumContents,
    ] = await Promise.allSettled([
      apiFetch(ENDPOINTS.education.cycles),
      apiFetch(ENDPOINTS.education.levels),
      apiFetch(ENDPOINTS.education.specialties),
      apiFetch(ENDPOINTS.education.subjects),

      apiFetch(ENDPOINTS.contents.featured),
      apiFetch(ENDPOINTS.contents.popular),
      apiFetch(ENDPOINTS.contents.premium),
    ]);

    return {
      cycles,
      levels,
      specialties,
      subjects,
      featuredContents,
      popularContents,
      premiumContents,
    };
  },

  // =========================================================
  // HOME PAGE
  // =========================================================

  async homePage() {
    const [
      featuredContents,
      premiumContents,
      recentContents,
      popularContents,
      leaderboard,
      badges,
      plans,
    ] = await Promise.allSettled([
      apiFetch(ENDPOINTS.contents.featured),
      apiFetch(ENDPOINTS.contents.premium),
      apiFetch(ENDPOINTS.contents.recent),
      apiFetch(ENDPOINTS.contents.popular),

      apiFetch(ENDPOINTS.gamification.leaderboard),
      apiFetch(ENDPOINTS.gamification.badges),

      apiFetch(ENDPOINTS.payments.plans),
    ]);

    return {
      featuredContents,
      premiumContents,
      recentContents,
      popularContents,
      leaderboard,
      badges,
      plans,
    };
  },

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  async notifications() {
    const [
      notifications,
      pendingQuestions,
      assignedQuestions,
    ] = await Promise.allSettled([
      apiFetch(ENDPOINTS.notifications.me),

      apiFetch(ENDPOINTS.teacherQuestions.pending),

      apiFetch(ENDPOINTS.teacherQuestions.assigned),
    ]);

    return {
      notifications,
      pendingQuestions,
      assignedQuestions,
    };
  },
};