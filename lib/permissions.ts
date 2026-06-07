import type { Content } from "@/types/content";
import type { Quiz } from "@/types/quiz";
import type { User } from "@/types/user";

const adminRoles = ["ADMIN", "ADMINISTRATEUR", "PROMOTEUR"];
const teacherStudioRoles = ["ENSEIGNANT", "ENSEIGNANT_EN_ATTENTE"];
const creatorRoles = [...adminRoles, ...teacherStudioRoles];

export function isPromoter(user?: Pick<User, "role"> | null) {
  return user?.role === "PROMOTEUR";
}

export function isAdministrator(user?: Pick<User, "role"> | null) {
  return user?.role === "ADMINISTRATEUR";
}

export function isAdminRole(user?: Pick<User, "role"> | null) {
  return Boolean(user?.role && adminRoles.includes(user.role));
}

export function isTeacherRole(user?: Pick<User, "role"> | null) {
  return user?.role === "ENSEIGNANT";
}

export function isTeacherPending(user?: Pick<User, "role"> | null) {
  return user?.role === "ENSEIGNANT_EN_ATTENTE";
}

export function isTeacherApproved(user?: Pick<User, "role"> | null) {
  return user?.role === "ENSEIGNANT";
}

export function canAccessTeacherStudio(user?: Pick<User, "role"> | null) {
  return Boolean(user?.role && (teacherStudioRoles.includes(user.role) || adminRoles.includes(user.role)));
}

export function canAnswerStudentQuestions(user?: Pick<User, "role"> | null) {
  return Boolean(user?.role && (user.role === "ENSEIGNANT" || adminRoles.includes(user.role)));
}

export function canAskQuestion(user?: Pick<User, "role" | "level_id"> | null) {
  return Boolean(user?.role === "ELEVE" && user.level_id);
}

export function canViewTeacherQuestionQueue(user?: Pick<User, "role"> | null) {
  return canAnswerStudentQuestions(user) || isPromoter(user);
}

export function canManageOwnTeacherSubjects(user?: Pick<User, "role"> | null) {
  return Boolean(user?.role && (teacherStudioRoles.includes(user.role) || isPromoter(user)));
}

export function canCreateTeacherContent(user?: Pick<User, "role"> | null) {
  return Boolean(user?.role && creatorRoles.includes(user.role));
}

export function canCreateTeacherQuiz(user?: Pick<User, "role"> | null) {
  return Boolean(user?.role && creatorRoles.includes(user.role));
}

export function canViewTeacherDashboard(user?: Pick<User, "role"> | null) {
  return canAccessTeacherStudio(user);
}

export function canManageUserRoles(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function isStudentRole(user?: Pick<User, "role"> | null) {
  return user?.role === "ELEVE";
}

export function canCreateContent(user?: Pick<User, "role"> | null) {
  return Boolean(user?.role && creatorRoles.includes(user.role));
}

export function canCreateCourse(user?: Pick<User, "role"> | null) {
  return canCreateContent(user);
}

export function canCreateSubject(user?: Pick<User, "role"> | null) {
  return canCreateContent(user);
}

export function canCreateQuiz(user?: Pick<User, "role"> | null) {
  return Boolean(user?.role && creatorRoles.includes(user.role));
}

export function canEditQuiz(
  user?: Pick<User, "id" | "role"> | null,
  quiz?: Pick<Quiz, "author_id"> | null
) {
  if (!user || !quiz) return false;
  return isAdminRole(user) || (canAccessTeacherStudio(user) && quiz.author_id === user.id);
}

export function canDeleteQuiz(
  user?: Pick<User, "id" | "role"> | null,
  quiz?: Pick<Quiz, "author_id"> | null
) {
  return canEditQuiz(user, quiz);
}

export function canPublishQuiz(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canPlayQuiz(
  user?: Pick<User, "role"> | null,
  quiz?: Pick<Quiz, "status"> | null
) {
  if (!user || !quiz) return false;
  return user.role === "ELEVE" && (!quiz.status || quiz.status === "PUBLISHED");
}

export function canViewQuizResults(
  user?: Pick<User, "id" | "role"> | null,
  quiz?: Pick<Quiz, "author_id"> | null
) {
  if (!user) return false;
  if (isStudentRole(user)) return true;
  if (!quiz) return isAdminRole(user) || canAccessTeacherStudio(user);
  return isAdminRole(user) || (canAccessTeacherStudio(user) && quiz.author_id === user.id);
}

export function canManageQuizQuestions(
  user?: Pick<User, "id" | "role"> | null,
  quiz?: Pick<Quiz, "author_id"> | null
) {
  if (!user) return false;
  if (!quiz) return canCreateQuiz(user);
  return canEditQuiz(user, quiz);
}

export function canUseQuizAI(user?: Pick<User, "role"> | null) {
  return Boolean(user?.role && creatorRoles.includes(user.role));
}

export function canCreateSchool(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canCreateCity(user?: Pick<User, "role"> | null) {
  return Boolean(user);
}

export function canCreateLevel(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canCreateSubjectEducation(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canEditSubjectEducation(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canDeleteSubjectEducation(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canCreateCycle(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canCreateSpecialty(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canManageUsers(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canManagePayments(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canManageNotifications(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canEditContent(user?: Pick<User, "id" | "role"> | null, content?: Pick<Content, "author_id"> | null) {
  if (!user || !content) return false;
  return isAdminRole(user) || (canAccessTeacherStudio(user) && content.author_id === user.id);
}

export function canDeleteContent(user?: Pick<User, "id" | "role"> | null, content?: Pick<Content, "author_id"> | null) {
  return canEditContent(user, content);
}

export function canPublishContent(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canArchiveContent(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canReviewContent(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canManageEducation(user?: Pick<User, "role"> | null) {
  return isAdminRole(user);
}

export function canReadSubjectContent(
  user?: Pick<User, "role"> | null,
  content?: Pick<Content, "subject_id"> | null,
  teacherSubjectIds: string[] = []
) {
  if (!user || !content) return false;
  if (isPromoter(user) || isAdminRole(user)) return true;
  if (teacherStudioRoles.includes(user.role)) {
    return Boolean(content.subject_id && teacherSubjectIds.includes(content.subject_id));
  }
  return true;
}

export function canDownloadSubjectContent(
  user?: (Pick<User, "role"> & { is_premium?: boolean }) | null,
  content?: Pick<Content, "subject_id" | "is_downloadable"> | null,
  teacherSubjectIds: string[] = []
) {
  if (!user || !content?.is_downloadable) return false;
  if (isPromoter(user) || isAdminRole(user)) return true;
  if (teacherStudioRoles.includes(user.role) && content.subject_id && teacherSubjectIds.includes(content.subject_id)) {
    return Boolean(user.is_premium);
  }
  return true;
}

export function canEarnTeacherXp(user?: Pick<User, "role"> | null) {
  return user?.role === "ENSEIGNANT";
}
