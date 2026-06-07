"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Filter,
  Mail,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/app/StateViews";
import { MetricCard } from "@/components/app/MetricCard";
import { GansekouLogo } from "@/components/ui/GansekouLogo";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PremiumLockCard } from "@/components/premium/PremiumLockCard";
import { notifyGansekou } from "@/components/ui/ToastProvider";
import { ApiError } from "@/lib/api";
import { setStoredLanguage } from "@/lib/i18n";
import {
  canCreateCourse,
  canCreateQuiz,
  canAnswerStudentQuestions,
  canAccessTeacherStudio,
  isAdminRole,
  isTeacherPending,
  isTeacherRole,
  isStudentRole,
} from "@/lib/permissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useI18n } from "@/hooks/useI18n";
import { platformService } from "@/services/platform.service";
import { useAuthStore } from "@/store/auth.store";
import type { Content } from "@/types/content";
import type { Question } from "@/types/question";
import type { User } from "@/types/user";
import type {
  Level,
  Notification,
  PageData,
  Quiz,
  Specialty,
  StudyPlanItem,
  Subject,
} from "@/types/platform";

const AdminEducationManager = dynamic(() => import("@/components/admin/AdminEducationManager").then((mod) => mod.AdminEducationManager), { loading: () => <LoadingState /> });
const AdminSchoolsManager = dynamic(() => import("@/components/admin/AdminSchoolsManager").then((mod) => mod.AdminSchoolsManager), { loading: () => <LoadingState /> });
const UserRoleManager = dynamic(() => import("@/components/admin/UserRoleManager").then((mod) => mod.UserRoleManager), { loading: () => <LoadingState /> });
const SubjectDetail = dynamic(() => import("@/components/education/SubjectDetail").then((mod) => mod.SubjectDetail), { loading: () => <LoadingState /> });
const SubjectForm = dynamic(() => import("@/components/education/SubjectForm").then((mod) => mod.SubjectForm), { loading: () => <LoadingState /> });
const SubjectManager = dynamic(() => import("@/components/education/SubjectManager").then((mod) => mod.SubjectManager), { loading: () => <LoadingState /> });
const ContentEditor = dynamic(() => import("@/components/content/ContentEditor").then((mod) => mod.ContentEditor), { loading: () => <LoadingState /> });
const ContentManager = dynamic(() => import("@/components/content/ContentManager").then((mod) => mod.ContentManager), { loading: () => <LoadingState /> });
const ContentPremiumDetail = dynamic(() => import("@/components/content/ContentPremiumDetail").then((mod) => mod.ContentPremiumDetail), { loading: () => <LoadingState /> });
const LearningPath = dynamic(() => import("@/components/gamification/LearningPath").then((mod) => mod.LearningPath), { loading: () => <LoadingState /> });
const RecommendationRail = dynamic(() => import("@/components/recommendations/RecommendationRail").then((mod) => mod.RecommendationRail), { loading: () => <LoadingState /> });
const StudentQuestionForm = dynamic(() => import("@/components/questions/StudentQuestionForm").then((mod) => mod.StudentQuestionForm), { loading: () => <LoadingState /> });
const TeacherQuestionQueue = dynamic(() => import("@/components/teacher/TeacherQuestionQueue").then((mod) => mod.TeacherQuestionQueue), { loading: () => <LoadingState /> });
const TeacherSubjectManager = dynamic(() => import("@/components/teacher/TeacherSubjectManager").then((mod) => mod.TeacherSubjectManager), { loading: () => <LoadingState /> });
const KoumaCoachPanel = dynamic(() => import("@/components/ai/KoumaCoachPanel").then((mod) => mod.KoumaCoachPanel), { loading: () => <LoadingState /> });

type WorkspaceKind =
  | "dashboard"
  | "courses"
  | "course-new"
  | "course-edit"
  | "subjects"
  | "subject-new"
  | "subject-detail"
  | "subject-edit"
  | "course-detail"
  | "questions"
  | "question-new"
  | "question-detail"
  | "ai"
  | "quizzes"
  | "quiz-new"
  | "quiz-detail"
  | "quiz-edit"
  | "quiz-play"
  | "study-planner"
  | "notifications"
  | "profile"
  | "settings"
  | "subscription"
  | "teacher-dashboard"
  | "teacher-pending"
  | "teacher-assigned"
  | "teacher-question"
  | "teacher-subjects"
  | "teacher-contents"
  | "teacher-content-new"
  | "teacher-content-detail"
  | "teacher-content-edit"
  | "teacher-answers"
  | "admin-dashboard"
  | "admin-users"
  | "admin-user-detail"
  | "admin-schools"
  | "admin-education"
  | "admin-contents"
  | "admin-contents-review"
  | "admin-content-new"
  | "admin-content-detail"
  | "admin-content-edit"
  | "admin-questions"
  | "admin-teachers"
  | "admin-payments"
  | "admin-notifications"
  | "admin-settings";

const adminRoles = ["ADMIN", "ADMINISTRATEUR", "PROMOTEUR"];

export function WorkspacePage({ kind }: { kind: WorkspaceKind }) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { user, loading: authLoading, authStatus, isAuthenticated } =
    useCurrentUser();
  const { t } = useI18n(user);
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login");
  }, [authStatus, router]);

  const loader = useMemo(() => {
    return () => loadWorkspaceData(kind, user, routeId);
  }, [kind, routeId, user]);

  const { data, loading, error, reload } = useAsyncData<PageData>(loader);

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <DashboardShell user={user}>
        <LoadingState label={authLoading ? "Restauration de votre session..." : "Chargement de votre espace Gansekou..."} />
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell user={null}>
        <LoadingState label="Restauration de votre session..." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user}>
      <div className="grid gap-6">
        {error && <ErrorState message={error} />}
        <ProfileCompletionAlerts user={user} data={data || {}} t={t} />
        <RenderWorkspace kind={kind} user={user} data={data || {}} reload={reload} routeId={routeId} />
      </div>
    </DashboardShell>
  );
}

async function loadWorkspaceData(
  kind: WorkspaceKind,
  user: User | null,
  routeId?: string
): Promise<PageData> {
  if (!user) return {};

  const isAdmin = adminRoles.includes(user.role);
  const isTeacher = canAccessTeacherStudio(user);

  if (kind === "dashboard") {
    if (isAdmin) return loadAdminDashboard();
    if (isTeacher) return loadTeacherDashboard(user);
    return loadStudentDashboard();
  }

  if (kind === "courses") {
    return settleData({
      contents: loadContentsByTypes(["COURS"]),
      levels: platformService.education.levels(),
      subjects: platformService.education.subjects(),
    });
  }

  if (kind === "subjects") {
    return settleData({
      levels: platformService.education.levels(),
      subjects: platformService.education.subjects(),
      specialties: platformService.education.specialties(),
    });
  }

  if (kind === "subject-new" || kind === "subject-edit") {
    return settleData({
      subject: routeId ? platformService.education.subjectById(routeId) : Promise.resolve(null),
      levels: platformService.education.levels(),
      specialties: platformService.education.specialties(),
      quizzes: platformService.quizzes.all().catch(() => []),
    });
  }

  if (kind === "subject-detail" && routeId) {
    return settleData({
      subject: platformService.education.subjectById(routeId),
      subjectContents: platformService.contents.bySubject(routeId),
      quizzes: platformService.quizzes.all().catch(() => []),
      levels: platformService.education.levels(),
      specialties: platformService.education.specialties(),
    });
  }

  if (["course-new", "course-edit", "teacher-content-new", "teacher-content-edit", "admin-content-new", "admin-content-edit"].includes(kind)) {
    return settleData({
      content: routeId ? platformService.contents.byId(routeId) : Promise.resolve(null),
      levels: platformService.education.levels(),
      subjects: platformService.education.subjects(),
      specialties: platformService.education.specialties(),
    });
  }

  if (["course-detail", "teacher-content-detail", "admin-content-detail"].includes(kind) && routeId) {
    return settleData({
      content: platformService.contents.byId(routeId),
      linkedQuizzes: platformService.quizzes.byCourse(routeId).catch(() => []),
      related: platformService.contents.related(routeId).catch(() => []),
      translations: platformService.contents.translations(routeId),
      levels: platformService.education.levels(),
      subjects: platformService.education.subjects(),
      specialties: platformService.education.specialties(),
    });
  }

  if (kind === "questions") {
    return settleData({
      questions: isAdmin
        ? platformService.questions.all()
        : platformService.questions.mine(),
      pendingQuestions: platformService.questions.pendingTeacher(),
    });
  }

  if (kind === "question-detail" && routeId) {
    return settleData({
      question: platformService.questions.byId(routeId),
      teacherAnswer: platformService.studentAnswers.byQuestion(routeId),
    });
  }

  if (kind === "quizzes") {
    return settleData({
      quizzes: platformService.quizzes.all(),
      history: user.role === "ELEVE" ? platformService.quizzes.history() : Promise.resolve([]),
    });
  }

  if (kind === "quiz-new" || kind === "quiz-edit") {
    return settleData({
      quiz: routeId ? platformService.quizzes.byId(routeId) : Promise.resolve(null),
      levels: platformService.education.levels(),
      subjects: platformService.education.subjects(),
      courses: platformService.contents.byType("COURS").catch(() => []),
    });
  }

  if ((kind === "quiz-detail" || kind === "quiz-play") && routeId) {
    return settleData({ quiz: platformService.quizzes.byId(routeId) });
  }

  if (kind === "study-planner") {
    return settleData({
      studyItems: platformService.studyPlanner.today(),
      studyPlan: platformService.studyPlanner.current().catch((error) => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }),
    });
  }

  if (kind === "question-new") {
    return settleData({
      subjects: platformService.education.subjects(),
      levels: platformService.education.levels(),
    });
  }

  if (kind === "notifications") {
    return settleData({ notifications: platformService.notifications.mine() });
  }

  if (kind === "subscription") {
    return settleData({
      plans: platformService.payments.plans(),
      subscription: platformService.payments.subscription(),
      transactions: platformService.payments.transactions(),
    });
  }

  if (kind.startsWith("teacher")) {
    if (kind === "teacher-question" && routeId) {
      return settleData({
        question: platformService.questions.byId(routeId),
      });
    }
    if (kind === "teacher-contents") {
      return settleData({
        contents: platformService.contents.my(),
        levels: platformService.education.levels(),
        subjects: platformService.education.subjects(),
        specialties: platformService.education.specialties(),
      });
    }
    if (kind === "teacher-subjects") {
      return settleData({
        teacherSubjects: platformService.teacher.mySubjects(),
        subjects: platformService.education.subjects(),
      });
    }
    return loadTeacherDashboard(user);
  }

  if (kind.startsWith("admin")) {
    if (kind === "admin-users") {
      return settleData({ users: platformService.users.all() });
    }
    if (kind === "admin-user-detail" && routeId) {
      return settleData({
        selectedUser: platformService.users.byId(routeId),
        teacherSubjects: platformService.teacher.subjects(routeId).catch(() => []),
      });
    }
    if (kind === "admin-contents-review") {
      return settleData({
        contents: platformService.contents.pendingReview(),
        levels: platformService.education.levels(),
        subjects: platformService.education.subjects(),
        specialties: platformService.education.specialties(),
      });
    }
    if (kind === "admin-contents") {
      return settleData({
        contents: platformService.contents.all(),
        levels: platformService.education.levels(),
        subjects: platformService.education.subjects(),
        specialties: platformService.education.specialties(),
      });
    }
    if (kind === "admin-education") {
      return settleData({
        cycles: platformService.education.cycles(),
        levels: platformService.education.levels(),
        specialties: platformService.education.specialties(),
        subjects: platformService.education.subjects(),
      });
    }
    if (kind === "admin-schools") {
      return settleData({
        schools: platformService.schools.all(),
        addresses: platformService.schools.addresses(),
      });
    }
    if (kind === "admin-payments") {
      return settleData({
        plans: platformService.payments.plans(),
      });
    }
    if (kind === "admin-notifications") {
      return settleData({ notifications: platformService.notifications.all() });
    }
    return loadAdminDashboard();
  }

  return {};
}

async function settleData(loaders: Record<string, Promise<unknown>>): Promise<PageData> {
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([key, promise]) => {
      try {
        return [key, await promise] as const;
      } catch (error) {
        console.error(`[workspace] ${key} failed`, error);
        return [key, null] as const;
      }
    })
  );

  return Object.fromEntries(entries) as PageData;
}

async function loadContentsByTypes(types: string[]) {
  const results = await Promise.all(
    types.map((type) => platformService.contents.byType(type).catch(() => [] as Content[]))
  );
  const merged = results.flat();
  const byId = new Map(merged.map((item) => [item.id, item]));
  return Array.from(byId.values());
}

function loadStudentDashboard() {
  return settleData({
    contents: platformService.contents.featured(),
    questions: platformService.questions.mine(),
    quizzes: platformService.quizzes.all(),
    quizHistory: platformService.quizzes.history().catch(() => []),
    studyItems: platformService.studyPlanner.today(),
    notifications: platformService.notifications.mine(),
    subscription: platformService.payments.subscription(),
    adaptiveProfile: platformService.adaptive.profile().catch(() => null),
    adaptiveWeaknesses: platformService.adaptive.weaknesses().catch(() => []),
    adaptiveRecommendations: platformService.adaptive.recommendations().catch(() => []),
  });
}

function loadTeacherDashboard(user: User) {
  return settleData({
    pendingQuestions: canAnswerStudentQuestions(user)
      ? platformService.teacher.availableQuestions()
      : Promise.resolve([]),
    assignedQuestions: canAnswerStudentQuestions(user)
      ? platformService.teacher.assignedQuestions()
      : Promise.resolve([]),
    teacherSubjects: platformService.teacher.subjects(user.id),
    contents: platformService.contents.my(),
    quizzes: platformService.quizzes.all().catch(() => []),
    notifications: platformService.notifications.mine(),
  });
}

function loadAdminDashboard() {
  return settleData({
    users: platformService.users.all(),
    contents: platformService.contents.all(),
    questions: platformService.questions.all(),
    quizzes: platformService.quizzes.all().catch(() => []),
    notifications: platformService.notifications.all(),
    health: platformService.admin.health(),
    recentActivity: platformService.admin.recentActivity(),
    schools: platformService.schools.all(),
  });
}

function RenderWorkspace({
  kind,
  user,
  data,
  reload,
  routeId,
}: {
  kind: WorkspaceKind;
  user: User;
  data: PageData;
  reload: () => Promise<void>;
  routeId?: string;
}) {
  const { t } = useI18n(user);

  if (kind === "question-new") {
    return (
      <StudentQuestionForm
        user={user}
        subjects={(data.subjects as Subject[]) || []}
        levels={(data.levels as Level[]) || []}
      />
    );
  }
  if (kind === "ai") return <KoumaCoachPanel user={user} />;
  if (kind === "settings") return <ProfileSettings user={user} reload={reload} />;
  if (kind === "profile") return <ProfilePanel user={user} />;
  if (kind === "subject-new" || kind === "subject-edit") {
    return (
      <SubjectForm
        user={user}
        subject={(data.subject as Subject | null) || null}
        levels={(data.levels as Level[]) || []}
        specialties={(data.specialties as Specialty[]) || []}
        reload={reload}
      />
    );
  }
  if (["course-new", "course-edit", "teacher-content-new", "teacher-content-edit", "admin-content-new", "admin-content-edit"].includes(kind)) {
    const defaultType = "COURS";
    return (
      <ContentEditor
        user={user}
        content={(data.content as Content | null) || null}
        defaultType={defaultType}
        subjects={(data.subjects as Subject[]) || []}
        levels={(data.levels as Level[]) || []}
        specialties={(data.specialties as Specialty[]) || []}
        scope={kind.startsWith("admin") ? "admin" : kind.startsWith("teacher") ? "teacher" : "courses"}
        reload={reload}
      />
    );
  }
  if (kind === "subject-detail") {
    return (
      <SubjectDetail
        user={user}
        subject={(data.subject as Subject | null) || null}
        levels={(data.levels as Level[]) || []}
        specialties={(data.specialties as Specialty[]) || []}
        contents={(data.subjectContents as Content[]) || []}
        quizzes={(data.quizzes as Quiz[]) || []}
        reload={reload}
      />
    );
  }
  if (["course-detail", "teacher-content-detail", "admin-content-detail"].includes(kind)) {
    return (
      <ContentPremiumDetail
        user={user}
        content={data.content as Content | null}
        related={(data.related as Content[]) || []}
        linkedQuizzes={(data.linkedQuizzes as Quiz[]) || []}
        translations={(data.translations as { title?: string; description?: string; language?: string }[]) || []}
        subjects={(data.subjects as Subject[]) || []}
        levels={(data.levels as Level[]) || []}
        specialties={(data.specialties as Specialty[]) || []}
        scope={kind.startsWith("admin") ? "admin" : kind.startsWith("teacher") ? "teacher" : "courses"}
        reload={reload}
      />
    );
  }
  if (kind === "question-detail" || kind === "teacher-question") {
    return (
      <QuestionDetail
        question={data.question as Question | null}
        teacherAnswer={data.teacherAnswer}
        isTeacher={kind === "teacher-question" && canAnswerStudentQuestions(user)}
        routeId={routeId}
        reload={reload}
      />
    );
  }
  if (kind === "quiz-new" || kind === "quiz-edit") {
    return (
      <QuizForm
        quiz={(data.quiz as Quiz | null) || null}
        subjects={(data.subjects as Subject[]) || []}
        levels={(data.levels as Level[]) || []}
      />
    );
  }
  if (kind === "quiz-detail" || kind === "quiz-play") return <QuizDetail quiz={data.quiz as Quiz | null} />;
  if (kind === "notifications") {
    return <NotificationsPanel notifications={(data.notifications as Notification[]) || []} reload={reload} />;
  }
  if (kind === "subscription" || kind === "admin-payments") return <SubscriptionPanel data={data} />;
  if (kind === "study-planner") return <StudyPlannerPanel items={(data.studyItems as StudyPlanItem[]) || []} />;
  if (kind.startsWith("admin")) return <AdminPanel kind={kind} data={data} user={user} reload={reload} />;
  if (kind.startsWith("teacher")) return <TeacherPanel kind={kind} data={data} user={user} reload={reload} />;
  if (kind === "courses") {
    return (
      <>
        <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-black text-[#071d3a]">{t("subject.subjects")}</h3>
              <p className="mt-2 text-sm font-bold text-slate-500">{t("subject.structureHelp")}</p>
            </div>
            <Link href="/subjects" className="ds-button-premium">{t("subject.viewSubjects")}</Link>
          </div>
        </section>
        <ContentGrid
          title="Parcours de cours"
          contents={(data.contents as Content[]) || []}
          subjects={(data.subjects as Subject[]) || []}
          levels={(data.levels as Level[]) || []}
          detailBasePath="/courses"
          createHref={canCreateCourse(user) ? "/courses/new" : undefined}
          createLabel="action.addCourse"
        />
      </>
    );
  }
  if (kind === "subjects") {
    return (
      <SubjectManager
        user={user}
        subjects={(data.subjects as Subject[]) || []}
        levels={(data.levels as Level[]) || []}
        specialties={(data.specialties as Specialty[]) || []}
        reload={reload}
      />
    );
  }
  if (kind === "quizzes") return <QuizGrid user={user} quizzes={(data.quizzes as Quiz[]) || []} />;
  if (kind === "questions") return <QuestionGrid questions={(data.questions as Question[]) || []} />;

  if (canAccessTeacherStudio(user)) return <TeacherPanel kind="teacher-dashboard" data={data} user={user} reload={reload} />;
  if (adminRoles.includes(user.role)) return <AdminPanel kind="admin-dashboard" data={data} user={user} reload={reload} />;
  return <StudentDashboard user={user} data={data} />;
}

function ProfileCompletionAlerts({
  user,
  data,
  t,
}: {
  user: User;
  data: PageData;
  t: (key: string) => string;
}) {
  const teacherSubjects = (data.teacherSubjects as unknown[] | null) || [];
  const pendingContents = (data.contents as Content[] | undefined)?.filter((item) => item.status === "PENDING") || [];

  if (isStudentRole(user) && !user.level_id) {
    return (
      <SmartAlert
        title={t("profile.studentIncompleteOnboarding")}
        href="/onboarding/profile"
        action={t("onboarding.addLevel")}
      />
    );
  }

  if (isTeacherPending(user)) {
    return (
      <SmartAlert
        title={t("profile.teacherPendingBanner")}
        href="/teacher/dashboard"
        action={t("nav.dashboard")}
      />
    );
  }

  if (isTeacherRole(user) && teacherSubjects.length === 0) {
    return (
      <SmartAlert
        title={t("profile.teacherIncomplete")}
        href="/teacher/subjects"
        action={t("profile.addSubject")}
      />
    );
  }

  if (isAdminRole(user) && pendingContents.length > 0) {
    return (
      <SmartAlert
        title={`${pendingContents.length} contenu(s) attendent une validation administrative.`}
        href="/admin/contents/review"
        action="Ouvrir la validation"
      />
    );
  }

  return null;
}

function SmartAlert({ title, href, action }: { title: string; href: string; action: string }) {
  return (
    <section className="ds-card flex flex-col justify-between gap-4 rounded-[2rem] border-[#f6c445]/60 bg-[#fff8db] p-5 md:flex-row md:items-center">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 shrink-0 text-[#b88a00]" />
        <p className="max-w-3xl font-bold leading-7 text-[#071d3a]">{title}</p>
      </div>
      <Link href={href} className="ds-button-premium shrink-0">
        {action}
      </Link>
    </section>
  );
}

function Hero({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#082f1f] p-8 text-white shadow-2xl shadow-[#082f1f]/20">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <GansekouLogo variant="light" size="medium" />
        <PremiumBadge label="Gansekou" />
      </div>
      <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight">{title}</h2>
      <p className="mt-4 max-w-2xl leading-7 text-white/70">{body}</p>
    </section>
  );
}

function StudentDashboard({ user, data }: { user: User; data: PageData }) {
  const { language } = useI18n(user);
  const labels = studentDashboardLabels(language);
  const contents = (data.contents as Content[]) || [];
  const quizzes = (data.quizzes as Quiz[]) || [];
  const studyItems = (data.studyItems as StudyPlanItem[]) || [];
  const recommendedQuiz = quizzes.find((quiz) => quiz.level_id === user.level_id) || quizzes[0];
  const recommendedContent = contents.find((content) => content.level_id === user.level_id) || contents[0];
  const weakLabel = labels.weaknessFallback;
  const strongLabel = labels.strengthFallback;

  return (
    <>
      <section className="premium-surface overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl shadow-[#071d3a]/20">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <PremiumBadge label={labels.badge} />
            <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              {labels.greeting.replace("{name}", user.prenom || "Gansekou")}
            </h2>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-7 text-white/75">{labels.hero}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {recommendedContent && <Link href={`/courses/${recommendedContent.id}`} className="ds-button-premium">{labels.resume}</Link>}
              {recommendedQuiz && <Link href={`/quizzes/${recommendedQuiz.id}`} className="rounded-full bg-white/10 px-5 py-3 font-black text-white">{labels.dailyQuiz}</Link>}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href={recommendedContent ? `/courses/${recommendedContent.id}` : "/courses"} title={labels.resume} body={labels.recommendedCourses} />
        <ActionCard href={recommendedQuiz ? `/quizzes/${recommendedQuiz.id}` : "/quizzes"} title={labels.dailyQuiz} body="Quiz" />
        <ActionCard href="/questions/new" title={labels.questions} body={labels.aiCoach} />
        <ActionCard href="/analytics" title={labels.viewStats} body={labels.analyticsWidget} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <SmartRecommendations labels={labels} weakLabel={weakLabel} strongLabel={strongLabel} studyItems={studyItems} />
        <PremiumLockCard title={labels.premiumTitle} body={labels.premiumBody} cta={labels.premiumCta} />
      </section>

      <RecommendationRail
        contents={contents}
        quizzes={quizzes}
        weaknesses={(data.adaptiveWeaknesses as unknown[]) || []}
        labels={{
          recommended: labels.recommendedForYou,
          continueProgress: labels.continueProgress,
          retryQuiz: labels.retryQuiz,
          weaknesses: labels.weakSubjects,
          trending: labels.trendingThisWeek,
          aiReason: labels.aiReason,
          open: labels.open,
          empty: labels.recommendationEmpty,
        }}
      />

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <LearningPath
          subjectName={strongLabel}
          contents={contents}
          quizzes={quizzes}
          labels={{
            title: labels.pathTitle,
            lesson: labels.lesson,
            exercises: labels.exercises,
            quiz: labels.quiz,
            validation: labels.validation,
            locked: labels.locked,
            continue: labels.continuePath,
          }}
        />
      </section>

      <ContentGrid title={labels.recommendations} contents={contents} />
    </>
  );
}

function ActionCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="ds-card ds-card-hover rounded-[2rem] p-6">
      <p className="text-xl font-black text-[#071d3a]">{title}</p>
      <p className="mt-2 text-sm font-bold text-slate-500">{body}</p>
    </Link>
  );
}

function SmartRecommendations({
  labels,
  weakLabel,
  strongLabel,
  studyItems,
}: {
  labels: ReturnType<typeof studentDashboardLabels>;
  weakLabel: string;
  strongLabel: string;
  studyItems: StudyPlanItem[];
}) {
  return (
    <section className="ds-card rounded-[2rem] p-7">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-[#b88a00]">{labels.aiCoach}</p>
      <h3 className="mt-2 text-2xl font-black text-[#071d3a]">{labels.aiTitle}</h3>
      <div className="mt-5 space-y-3">
        <InsightRow icon={Target} label={labels.weakSubjects} value={weakLabel} />
        <InsightRow icon={CheckCircle2} label={labels.strongSubjects} value={strongLabel} />
        <InsightRow icon={CalendarCheck} label={labels.dailyGoals} value={studyItems[0]?.title || labels.dailyFallback} />
      </div>
    </section>
  );
}

function InsightRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0f5f3a]">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="text-sm font-black text-[#071d3a]">{value}</p>
      </div>
    </div>
  );
}

function studentDashboardLabels(language: string) {
  const fr = language !== "EN";
  return {
    badge: fr ? "Coach intelligent" : "Smart coach",
    greeting: fr ? "Continue ta serie, {name}." : "Keep your streak, {name}.",
    hero: fr
      ? "Objectifs, quiz, contenus et IA travaillent ensemble pour construire ton parcours scolaire camerounais."
      : "Goals, quizzes, content and AI work together to shape your learning path.",
    resume: fr ? "Reprendre" : "Resume",
    dailyQuiz: fr ? "Quiz du jour" : "Daily quiz",
    streak: fr ? "Serie" : "Streak",
    xp: "XP",
    score: fr ? "Score" : "Score",
    level: fr ? "Niveau" : "Level",
    bestStreak: fr ? "Meilleure serie" : "Best streak",
    badges: fr ? "Badges" : "Badges",
    completed: fr ? "Termines" : "Completed",
    passed: fr ? "Reussis" : "Passed",
    weeklyGoal: fr ? "Objectif quotidien" : "Daily goal",
    weeklyGoalDetail: fr ? "Progresse chaque jour pour debloquer le prochain niveau." : "Progress daily to unlock the next level.",
    recommendedCourses: fr ? "Cours recommandes" : "Recommended courses",
    questions: fr ? "Questions" : "Questions",
    notifications: fr ? "Notifications" : "Notifications",
    premium: "Premium",
    active: fr ? "Actif" : "Active",
    free: fr ? "Libre" : "Free",
    keepRhythm: fr ? "Maintenir un rythme regulier" : "Keep a steady rhythm",
    streakGoal: fr ? "Serie 7 jours" : "7-day streak",
    goalProgress: fr ? "{progress}% de ton objectif atteint." : "{progress}% of your goal reached.",
    aiCoach: fr ? "Tuteur IA" : "AI tutor",
    aiTitle: fr ? "Ce que tu dois travailler" : "What to work on next",
    weakSubjects: fr ? "A renforcer" : "Needs work",
    strongSubjects: fr ? "Point fort" : "Strength",
    dailyGoals: fr ? "Aujourd'hui" : "Today",
    dailyFallback: fr ? "Faire un quiz court et revoir une lecon." : "Take a short quiz and review one lesson.",
    weaknessFallback: fr ? "Fractions et calcul mental" : "Fractions and mental arithmetic",
    strengthFallback: fr ? "Mathematiques" : "Mathematics",
    pathTitle: fr ? "Parcours pedagogique" : "Learning path",
    lesson: fr ? "Lecon" : "Lesson",
    exercises: fr ? "Exercices" : "Exercises",
    quiz: "Quiz",
    validation: fr ? "Validation" : "Validation",
    locked: fr ? "Debloque apres l'etape precedente" : "Unlocks after previous step",
    continuePath: fr ? "Continuer" : "Continue",
    premiumTitle: fr ? "Passe Premium pour aller plus loin" : "Go Premium to go further",
    premiumBody: fr
      ? "Corrections IA avancees, quiz illimites, contenus exclusifs et telechargements hors ligne."
      : "Advanced AI corrections, unlimited quizzes, exclusive content and offline downloads.",
    premiumCta: fr ? "Voir Premium" : "View Premium",
    recommendations: fr ? "Recommandations" : "Recommendations",
    evolutionTitle: fr ? "Mon evolution" : "My growth",
    evolutionSubtitle: fr ? "XP, missions et recompenses" : "XP, missions and rewards",
    dailyMission: fr ? "Mission quotidienne" : "Daily mission",
    badgeHistory: fr ? "Historique badges" : "Badge history",
    rareBadge: fr ? "Badge rare" : "Rare badge",
    legendaryBadge: fr ? "Badge legendaire" : "Legendary badge",
    nextReward: fr ? "Prochaine recompense" : "Next reward",
    keepGoing: fr ? "Terminez un quiz ou une lecon pour debloquer vos premiers badges." : "Complete a quiz or lesson to unlock your first badges.",
    recommendedForYou: fr ? "Recommande pour vous" : "Recommended for you",
    continueProgress: fr ? "Continuez votre progression" : "Continue your progress",
    retryQuiz: fr ? "Quiz a refaire" : "Quiz to retry",
    trendingThisWeek: fr ? "Tendance cette semaine" : "Trending this week",
    aiReason: fr ? "Choisi par votre coach IA" : "Picked by your AI coach",
    open: fr ? "Ouvrir" : "Open",
    recommendationEmpty: fr ? "Votre moteur de recommandations se precise avec votre activite." : "Your recommendation engine improves with your activity.",
    liveWidget: fr ? "Widget live" : "Live widget",
    rewardWidget: fr ? "Recompenses" : "Rewards",
    progressWidget: fr ? "Progression personnelle" : "Personal progress",
    analyticsWidget: fr ? "Analytics d'apprentissage" : "Learning analytics",
    viewStats: fr ? "Voir les statistiques" : "View analytics",
    missionsWidget: fr ? "Missions et badges" : "Missions and badges",
    collapseWidget: fr ? "Replier le widget" : "Collapse widget",
    expandWidget: fr ? "Deplier le widget" : "Expand widget",
    reorderWidget: fr ? "Deplacer le widget" : "Move widget",
  };
}

function teacherDashboardLabels(language: string) {
  const fr = language !== "EN";
  return {
    eyebrow: fr ? "Studio enseignant" : "Teacher studio",
    title: fr ? "Pilote tes cours, quiz et reponses." : "Manage your courses, quizzes and answers.",
    manage: fr ? "Gestion enseignant" : "Teacher management",
    body: fr
      ? "Suivez les questions prioritaires, l'impact de vos contenus et les evaluations creees pour vos eleves."
      : "Track priority questions, content impact and assessments created for your students.",
    pending: fr ? "En attente" : "Pending",
    assigned: fr ? "Assignees" : "Assigned",
    contents: fr ? "Contenus crees" : "Created content",
    views: fr ? "Vues" : "Views",
    responseTime: fr ? "Temps de reponse" : "Response time",
    responseBody: fr ? "Objectif recommande pour maintenir l'engagement des apprenants." : "Recommended target to keep learners engaged.",
    priority: fr ? "Questions prioritaires" : "Priority questions",
    priorityBody: fr ? "A traiter selon matiere, niveau et anciennete." : "Handle by subject, level and age.",
    aiInsights: fr ? "Insights IA" : "AI insights",
    aiBody: fr ? "Signal pedagogique consolide depuis contenus, quiz et questions." : "Teaching signal consolidated from content, quizzes and questions.",
  };
}

function adminDashboardLabels(language: string) {
  const fr = language !== "EN";
  return {
    eyebrow: fr ? "Administration Gansekou" : "Gansekou administration",
    title: fr ? "Vue globale de la plateforme." : "Platform overview.",
    console: fr ? "Console d'administration" : "Administration console",
    body: fr
      ? "Monitoring, utilisateurs, contenus, quiz, IA et signaux premium pour piloter Gansekou."
      : "Monitoring, users, content, quizzes, AI and premium signals to run Gansekou.",
    users: fr ? "Utilisateurs" : "Users",
    students: fr ? "Eleves" : "Students",
    teachers: fr ? "Enseignants" : "Teachers",
    growth: fr ? "Croissance" : "Growth",
    growthBody: fr ? "Signal produit indicatif base sur l'activite recente disponible." : "Product signal based on recent available activity.",
    content: fr ? "Contenus" : "Content",
    contentBody: fr ? "Catalogue total visible par les roles admin." : "Full catalog visible to admin roles.",
  };
}

function TeacherPanel({ kind, data, user, reload }: { kind: string; data: PageData; user: User; reload: () => Promise<void> }) {
  const { language, t } = useI18n(user);
  const labels = teacherDashboardLabels(language);
  const pendingApproval = isTeacherPending(user);
  const canAnswer = canAnswerStudentQuestions(user);
  const pending = (data.pendingQuestions as Question[]) || [];
  const assigned = (data.assignedQuestions as Question[]) || [];
  const contents = (data.contents as Content[]) || [];
  const teacherSubjects = (data.teacherSubjects as import("@/types/platform").TeacherSubject[]) || [];

  return (
    <>
      <section className="premium-surface rounded-[2rem] p-7 text-white">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{labels.eyebrow}</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <h2 className="text-3xl font-black md:text-5xl">{kind === "teacher-dashboard" ? labels.title : labels.manage}</h2>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-white/75">{labels.body}</p>
          </div>
          <Link href="/analytics" className="ds-button-premium w-fit">{language === "EN" ? "View analytics" : "Voir les statistiques"}</Link>
        </div>
      </section>
      {pendingApproval && (
        <SmartAlert
          title={t("onboarding.teacherPendingBanner")}
          href="/onboarding/profile"
          action={language === "EN" ? "Complete file" : "Completer le dossier"}
        />
      )}
      {kind.includes("subjects") ? (
        <TeacherSubjectManager
          teacherSubjects={teacherSubjects}
          subjects={(data.subjects as Subject[]) || []}
          reload={reload}
        />
      ) : kind.includes("contents") ? (
        <ContentManager
          user={user}
          contents={contents}
          subjects={(data.subjects as Subject[]) || []}
          levels={(data.levels as Level[]) || []}
          scope="teacher"
          reload={reload}
        />
      ) : !canAnswer && (kind.includes("assigned") || kind.includes("pending")) ? (
        <PendingTeacherAccessNotice language={language} />
      ) : kind.includes("assigned") ? <TeacherQuestionQueue questions={assigned} /> : <TeacherQuestionQueue questions={pending.length ? pending : assigned} />}
    </>
  );
}

function PendingTeacherAccessNotice({ language }: { language: string }) {
  return (
    <section className="ds-card rounded-[2rem] p-7">
      <h3 className="text-2xl font-black text-[#071d3a]">
        {language === "EN" ? "Your teacher account is pending approval." : "Votre compte enseignant est en cours de validation."}
      </h3>
      <p className="mt-3 max-w-2xl text-sm font-bold leading-7 text-slate-500">
        {language === "EN"
          ? "You can prepare content and quizzes now. Student question answers will be available after administrative approval."
          : "Vous pouvez preparer vos contenus et quiz. Les reponses aux questions eleves seront disponibles apres validation administrative."}
      </p>
    </section>
  );
}

function TeacherSubjectsPanel({ subjects }: { subjects: unknown[] }) {
  const { t } = useI18n();
  const subjectLabels = subjects.map((item, index) => {
    if (item && typeof item === "object" && "subject" in item) {
      const subject = (item as { subject?: { name_fr?: string; name_en?: string } }).subject;
      return subject?.name_fr || subject?.name_en || `${t("common.subject")} ${index + 1}`;
    }
    return `${t("common.subject")} ${index + 1}`;
  });
  return (
    <section className="ds-card rounded-[2rem] p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-[#071d3a]">{t("nav.mySubjects")}</h3>
          <p className="mt-2 max-w-2xl text-sm font-bold text-slate-500">
            {t("teacher.subjectsHelp")}
          </p>
        </div>
        <Link href="/settings" className="ds-button-premium">
          {t("profile.addSubject")}
        </Link>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {subjectLabels.map((label, index) => (
          <div key={`teacher-subject-label-${index}-${label}`} className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-[#071d3a]">{label}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{t("teacher.subjectReady")}</p>
          </div>
        ))}
      </div>
      {!subjects.length && <EmptyState title={t("profile.addSubject")} message={t("profile.teacherIncomplete")} />}
    </section>
  );
}

function AdminPanel({ kind, data, user, reload }: { kind: string; data: PageData; user: User; reload: () => Promise<void> }) {
  const { language } = useI18n(user);
  const labels = adminDashboardLabels(language);
  const users = (data.users as User[]) || [];
  const selectedUser = data.selectedUser as User | undefined;
  const questions = (data.questions as Question[]) || [];
  const contents = (data.contents as Content[]) || [];

  return (
    <>
      <section className="premium-surface rounded-[2rem] p-7 text-white">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{labels.eyebrow}</p>
        <h2 className="mt-4 text-3xl font-black md:text-5xl">{kind === "admin-dashboard" ? labels.title : labels.console}</h2>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-white/75">{labels.body}</p>
        <Link href="/analytics" className="ds-button-premium mt-5 inline-flex">{language === "EN" ? "View analytics" : "Voir les statistiques"}</Link>
      </section>
      {selectedUser ? (
        <div className="grid gap-5">
          <ProfilePanel user={selectedUser} />
          <UserRoleManager user={selectedUser} reload={reload} />
          {selectedUser.role === "ENSEIGNANT_EN_ATTENTE" && (
            <TeacherSubjectsPanel subjects={(data.teacherSubjects as unknown[]) || []} />
          )}
        </div>
      ) : kind.includes("users") ? (
        <UserTable users={users} />
      ) : kind.includes("contents") ? (
        <ContentManager
          user={user}
          contents={contents}
          subjects={(data.subjects as Subject[]) || []}
          levels={(data.levels as Level[]) || []}
          scope="admin"
          reviewOnly={kind.includes("review")}
          reload={reload}
        />
      ) : kind.includes("education") ? (
        <AdminEducationManager data={data} reload={reload} user={user} />
      ) : kind.includes("schools") ? (
        <AdminSchoolsManager data={data} reload={reload} user={user} />
      ) : kind.includes("notifications") ? (
        <NotificationsPanel notifications={(data.notifications as Notification[]) || []} reload={async () => undefined} />
      ) : (
        <QuestionGrid questions={questions} />
      )}
    </>
  );
}

function QuizForm({ quiz, subjects, levels }: { quiz: Quiz | null; subjects: Subject[]; levels: Level[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: quiz?.title || "",
    description: quiz?.description || "",
    subject_id: quiz?.subject_id || "",
    level_id: quiz?.level_id || "",
    language: quiz?.language || "FR",
    difficulty_level: quiz?.difficulty_level || "INTERMEDIATE",
    passing_score: String(quiz?.passing_score || 50),
    estimated_duration_minutes: quiz?.estimated_duration_minutes ? String(quiz.estimated_duration_minutes) : "",
    is_premium: Boolean(quiz?.is_premium),
  });
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    if (!form.title || !form.subject_id || !form.level_id) {
      setStatus("Titre, matiere et niveau sont obligatoires.");
      return;
    }
    setStatus("Creation du quiz...");
    try {
      const saved = await platformService.quizzes.create({
        title: form.title,
        description: form.description || null,
        subject_id: form.subject_id,
        level_id: form.level_id,
        language: form.language,
        difficulty_level: form.difficulty_level,
        passing_score: Number(form.passing_score) || 50,
        estimated_duration_minutes: form.estimated_duration_minutes ? Number(form.estimated_duration_minutes) : null,
        quiz_type: "QCM",
        is_premium: form.is_premium,
      });
      router.push(`/quizzes/${saved.id}`);
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Creation impossible.");
    }
  }

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <h3 className="text-2xl font-black text-[#082f1f]">Nouvelle evaluation interactive</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Titre" className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none" />
        <select value={form.language} onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none">
          <option value="FR">Francais</option>
          <option value="EN">English</option>
        </select>
        <select value={form.level_id} onChange={(event) => setForm((current) => ({ ...current, level_id: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none">
          <option value="">Niveau</option>
          {levels.map((level) => <option key={level.id} value={level.id}>{level.name_fr}</option>)}
        </select>
        <select value={form.subject_id} onChange={(event) => setForm((current) => ({ ...current, subject_id: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none">
          <option value="">Matiere</option>
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name_fr}</option>)}
        </select>
        <input value={form.passing_score} onChange={(event) => setForm((current) => ({ ...current, passing_score: event.target.value }))} placeholder="Score requis (%)" className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none" />
        <input value={form.estimated_duration_minutes} onChange={(event) => setForm((current) => ({ ...current, estimated_duration_minutes: event.target.value }))} placeholder="Duree estimee (min)" className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none" />
      </div>
      <textarea value={form.description || ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 p-4 outline-none" />
      <label className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600">
        <input type="checkbox" checked={form.is_premium} onChange={(event) => setForm((current) => ({ ...current, is_premium: event.target.checked }))} />
        Premium
      </label>
      <button onClick={submit} className="mt-6 block rounded-full bg-[#0f5f3a] px-6 py-3 font-black text-white">Enregistrer le quiz</button>
      {status && <p className="mt-3 text-sm font-bold text-slate-600">{status}</p>}
    </section>
  );
}

function ContentGrid({
  title,
  contents,
  subjects = [],
  levels = [],
  detailBasePath = "/courses",
  createHref,
  createLabel = "action.addContent",
}: {
  title: string;
  contents: Content[];
  subjects?: Subject[];
  levels?: Level[];
  detailBasePath?: string;
  createHref?: string;
  createLabel?: string;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [type, setType] = useState("");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const filtered = contents.filter((item) => {
    const label = `${item.title || ""} ${item.content_type || ""}`.toLowerCase();
    return (
      (!query || label.includes(query.toLowerCase())) &&
      (!subjectId || item.subject_id === subjectId) &&
      (!levelId || item.level_id === levelId) &&
      (!type || item.content_type === type) &&
      (!premiumOnly || item.is_premium)
    );
  });
  const types = Array.from(new Set(contents.map((item) => item.content_type).filter(Boolean)));

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h3 className="text-2xl font-black text-[#082f1f]">{title}</h3>
          <p className="mt-2 text-sm font-bold text-slate-500">
            {t("content.catalogHelp")}
          </p>
        </div>
        {createHref && (
          <Link href={createHref} className="ds-button-primary">
            {t(createLabel)}
          </Link>
        )}
        <div className="grid gap-2 md:grid-cols-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("common.search")}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none"
          />
          <select
            value={levelId}
            onChange={(event) => setLevelId(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none"
          >
            <option value="">{t("common.level")}</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name_fr}
              </option>
            ))}
          </select>
          <select
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none"
          >
            <option value="">{t("common.subject")}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name_fr}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none"
          >
            <option value="">{t("content.type")}</option>
            {types.map((item, index) => (
              <option key={`content-type-filter-${item}-${index}`} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPremiumOnly((current) => !current)}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${
              premiumOnly
                ? "bg-[#f6c445] text-[#082f1f]"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Filter size={16} />
            Premium
          </button>
        </div>
      </div>
      {!filtered.length ? (
        <EmptyState title={t("content.empty")} message={t("state.emptyContent")} />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, index) => (
            <Link key={`workspace-content-${item.id}-${index}`} href={`${detailBasePath}/${item.id}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-[#0f5f3a]/10 px-3 py-1 text-xs font-black text-[#0f5f3a]">{item.content_type}</span>
                {item.is_premium && <span className="rounded-full bg-[#f6c445] px-3 py-1 text-xs font-black text-[#082f1f]">Premium</span>}
              </div>
              <p className="font-black text-[#082f1f]">{item.title || `Ressource ${item.id.slice(0, 8)}`}</p>
              <p className="mt-2 text-sm text-slate-500">{item.status || "APPROVED"}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function QuestionGrid({ questions }: { questions: Question[] }) {
  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-black text-[#082f1f]">Questions</h3>
        <Link href="/questions/new" className="rounded-full bg-[#0f5f3a] px-5 py-2 text-sm font-black text-white">Nouvelle</Link>
      </div>
      {!questions.length ? (
        <EmptyState title="Aucune question" message="Pose une question pour recevoir une aide adaptee a ton niveau." />
      ) : (
        <div className="mt-6 space-y-3">
          {questions.map((item, index) => (
            <Link key={`question-grid-${item.id}-${index}`} href={`/questions/${item.id}`} className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-white">
              <p className="font-black text-[#082f1f]">{item.question_text || "Question sans texte"}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">{item.status}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function QuizGrid({ user, quizzes }: { user: User; quizzes: Quiz[] }) {
  const { t } = useI18n(user);
  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-black text-[#082f1f]">Evaluations interactives</h3>
        {canCreateQuiz(user) && (
          <Link href="/quizzes/new" className="rounded-full bg-[#0f5f3a] px-5 py-2 text-sm font-black text-white">
            {t("action.addQuiz")}
          </Link>
        )}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((quiz, index) => (
          <Link key={`workspace-quiz-${quiz.id}-${index}`} href={`/quizzes/${quiz.id}`} className="rounded-2xl bg-slate-50 p-5 hover:bg-white hover:shadow-lg">
            <p className="font-black text-[#082f1f]">{quiz.title}</p>
            <p className="mt-2 text-sm text-slate-500">{quiz.description || quiz.quiz_type}</p>
          </Link>
        ))}
      </div>
      {!quizzes.length && <EmptyState title="Aucun quiz" message="Les evaluations publiees apparaitront ici." />}
    </section>
  );
}

function QuestionDetail({
  question,
  teacherAnswer,
  isTeacher,
  routeId,
  reload,
}: {
  question?: Question | null;
  teacherAnswer?: unknown;
  isTeacher?: boolean;
  routeId?: string;
  reload: () => Promise<void>;
}) {
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function submitTeacherAnswer() {
    if (!question) return;

    setStatus("Envoi de la reponse...");
    try {
      let attachment_url: string | undefined;
      if (file) {
        const uploaded = await platformService.uploads.teacherAnswer(file);
        attachment_url = uploaded.file_url;
      }
      await platformService.teacher.answerQuestion(question.id, {
        answer_text: answer,
        attachment_url,
        language: question.language || "FR",
      });
      setAnswer("");
      setFile(null);
      setStatus("Reponse envoyee.");
      await reload();
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Envoi impossible.");
    }
  }

  if (!question) return <EmptyState title="Question introuvable" message={`Cette question n'est plus disponible ${routeId ? `(${routeId.slice(0, 8)})` : ""}.`} />;
  return (
    <>
      <Hero eyebrow={question.status || "Question"} title={question.question_text || "Question Gansekou"} body={`Langue ${question.language || "FR"}`} />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
        <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
          <h3 className="text-2xl font-black text-[#082f1f]">Reponses</h3>
          <TeacherAnswerSummary answer={teacherAnswer} />
        </div>
        {isTeacher && (
          <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
            <h3 className="text-2xl font-black text-[#082f1f]">Repondre</h3>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="mt-5 min-h-40 w-full rounded-2xl border border-slate-200 p-4 outline-none"
              placeholder="Votre explication..."
            />
            <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-500">
              <Paperclip size={18} />
              {file?.name || "Ajouter une piece jointe"}
              <input className="hidden" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
            <button onClick={submitTeacherAnswer} className="mt-4 rounded-full bg-[#0f5f3a] px-6 py-3 font-black text-white">
              Envoyer la reponse
            </button>
            {status && <p className="mt-3 text-sm font-bold text-slate-600">{status}</p>}
          </div>
        )}
      </section>
    </>
  );
}

function TeacherAnswerSummary({ answer }: { answer?: unknown }) {
  if (!answer) {
    return (
      <div className="mt-5 rounded-2xl bg-slate-50 p-5">
        <p className="font-black text-[#071d3a]">Aucune reponse publiee pour le moment.</p>
        <p className="mt-2 text-sm font-bold text-slate-500">Un enseignant pourra ajouter une explication claire et complete.</p>
      </div>
    );
  }

  const item = Array.isArray(answer) ? answer[0] : answer;
  const answerText =
    item && typeof item === "object" && "answer_text" in item
      ? String((item as { answer_text?: unknown }).answer_text || "")
      : "";

  return (
    <div className="mt-5 rounded-2xl bg-slate-50 p-5">
      <p className="font-black text-[#071d3a]">{answerText || "Une reponse enseignant est disponible."}</p>
    </div>
  );
}

function QuizDetail({ quiz }: { quiz?: Quiz | null }) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [status, setStatus] = useState<string | null>(null);
  async function start() {
    if (!quiz) return;
    setStatus("Demarrage...");
    try {
      const attempt = await platformService.quizzes.start(quiz.id);
      setAttemptId(attempt.attempt_id);
      setStatus("Tentative demarree.");
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Demarrage impossible.");
    }
  }

  async function submitEmpty() {
    if (!quiz || !attemptId) return;
    setStatus("Soumission...");
    try {
      const response = await platformService.quizzes.submit(quiz.id, attemptId, {});
      setResult(response);
      setStatus("Quiz soumis.");
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Soumission impossible.");
    }
  }

  if (!quiz) return <EmptyState title="Quiz introuvable" message="Cette evaluation n'est plus disponible." />;
  return (
    <>
      <Hero eyebrow={quiz.quiz_type} title={quiz.title} body={quiz.description || "Evaluation Gansekou"} />
      <section className="ds-card rounded-[2rem] p-7">
        <p className="text-sm font-bold text-slate-500">
          Lancez la tentative quand vous etes pret, puis terminez pour recevoir une correction claire.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={start} className="ds-button-primary">Demarrer</button>
          <button disabled={!attemptId} onClick={submitEmpty} className="ds-button-premium disabled:opacity-50">Soumettre</button>
        </div>
        {attemptId && <p className="mt-4 text-sm font-bold text-slate-600">Tentative: {attemptId}</p>}
        {status && <p className="mt-2 text-sm font-bold text-slate-600">{status}</p>}
        {result ? <p className="mt-5 rounded-2xl bg-[#e8f5ee] p-4 text-sm font-black text-[#0f5f3a]">Resultat enregistre. Consultez votre historique pour revoir la correction.</p> : null}
      </section>
    </>
  );
}

function StudyPlannerPanel({ items }: { items: StudyPlanItem[] }) {
  const [localItems, setLocalItems] = useState(items);
  const [status, setStatus] = useState<string | null>(null);

  async function complete(item: StudyPlanItem) {
    setStatus("Mise a jour...");
    try {
      const updated = await platformService.studyPlanner.complete(item.id);
      setLocalItems((current) =>
        current.map((entry) => (entry.id === item.id ? updated : entry))
      );
      setStatus("Element termine.");
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Action impossible.");
    }
  }

  return (
    <>
      <Hero eyebrow="Study planner" title="Ton plan d'etude du jour" body="Plan genere et suivi via les endpoints study-planner." />
      <section className="grid gap-4 md:grid-cols-2">
        {localItems.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-5 shadow-xl shadow-[#082f1f]/5">
            <p className="font-black text-[#082f1f]">{item.title}</p>
            <p className="mt-2 text-sm text-slate-500">{item.estimated_minutes} min - {item.priority}</p>
            <button onClick={() => complete(item)} disabled={item.is_completed} className="mt-4 rounded-full bg-[#0f5f3a] px-4 py-2 text-sm font-black text-white disabled:bg-slate-200 disabled:text-slate-500">
              {item.is_completed ? "Termine" : "Marquer termine"}
            </button>
          </div>
        ))}
      </section>
      {status && <p className="text-sm font-bold text-slate-600">{status}</p>}
      {!localItems.length && <EmptyState title="Aucune tache aujourd'hui" message="Genere un plan pour obtenir des recommandations." />}
    </>
  );
}

function NotificationsPanel({ notifications, reload }: { notifications: Notification[]; reload: () => Promise<void> }) {
  const { t } = useI18n();
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const unread = localNotifications.filter((item) => !item.is_read).length;

  async function mark(id: string) {
    setLocalNotifications((current) => current.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    await platformService.notifications.read(id);
    await reload();
  }

  return (
    <section className="ds-card rounded-[2rem] p-7 premium-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-[#071d3a]">{t("notifications.center")}</h3>
          <p className="mt-1 text-sm font-bold text-slate-500">{t("notifications.unread").replace("{count}", String(unread))}</p>
        </div>
        <div className="flex gap-2">
          {["notifications.course", "notifications.quiz", "notifications.progress", "notifications.premium"].map((item, index) => (
            <span key={`notification-filter-${item}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{t(item)}</span>
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {localNotifications.map((item, index) => (
          <button key={`notification-row-${item.id}-${index}`} onClick={() => mark(item.id)} className={`block w-full rounded-2xl border p-4 text-left transition hover:bg-white ${item.is_read ? "border-slate-100 bg-slate-50" : "border-[#f6c445]/50 bg-[#fff8db]"}`}>
            <p className="font-black text-[#071d3a]">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.message}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-400">{item.type || t("notifications.info")}</p>
          </button>
        ))}
      </div>
      {!localNotifications.length && <EmptyState title={t("notifications.empty")} message={t("notifications.emptyHelp")} />}
    </section>
  );
}

function SubscriptionPanel({ data }: { data: PageData }) {
  const { t } = useI18n();
  const plans = (data.plans as { id: string; name: string; price_xaf: number; duration_days: number; description?: string }[]) || [];
  return (
    <>
      <Hero eyebrow={t("premium.brand")} title={t("premium.title")} body={t("premium.body")} />
      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan, index) => (
          <div key={`subscription-plan-${plan.id}-${index}`} className="ds-card ds-card-hover rounded-[2rem] p-6">
            <p className="text-xl font-black text-[#082f1f]">{plan.name}</p>
            <p className="mt-3 text-3xl font-black text-[#0f5f3a]">{plan.price_xaf} XAF</p>
            <p className="mt-2 text-sm font-bold text-slate-500">{t("premium.duration").replace("{days}", String(plan.duration_days))}</p>
            <div className="mt-5 grid gap-2 text-sm font-bold text-slate-600">
              <span className="rounded-2xl bg-[#fff7df] px-4 py-3">{t("premium.aiCorrections")}</span>
              <span className="rounded-2xl bg-slate-50 px-4 py-3">{t("premium.offline")}</span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function UserTable({ users }: { users: User[] }) {
  const { t, formatRole } = useI18n();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const filtered = users.filter((user) => {
    const label = `${user.prenom} ${user.nom} ${user.email || ""}`.toLowerCase();
    return (
      (!query || label.includes(query.toLowerCase())) &&
      (!role || user.role === role) &&
      (!status || user.status === status)
    );
  });

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h3 className="text-2xl font-black text-[#082f1f]">Utilisateurs</h3>
        <div className="grid gap-2 md:grid-cols-3">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("common.search")} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none" />
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none">
            <option value="">{t("common.role")}</option>
            {["ELEVE", "ENSEIGNANT_EN_ATTENTE", "ENSEIGNANT", "ADMIN", "ADMINISTRATEUR", "PROMOTEUR"].map((item, index) => <option key={`role-filter-${item}-${index}`} value={item}>{formatRole(item)}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none">
            <option value="">{t("common.status")}</option>
            {["ACTIVE", "SUSPENDED", "DISABLED"].map((item, index) => <option key={`status-filter-${item}-${index}`}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {filtered.map((item, index) => (
          <Link key={`user-row-${item.id}-${index}`} href={`/admin/users/${item.id}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 hover:bg-white">
            <span className="font-black text-[#082f1f]">{item.prenom} {item.nom}</span>
            <span className={`text-sm font-bold ${item.role === "ENSEIGNANT_EN_ATTENTE" ? "text-[#b88a00]" : "text-slate-500"}`}>{formatRole(item.role)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProfilePanel({ user }: { user: User }) {
  const { formatRole } = useI18n(user);
  const displayName = [user.prenom, user.nom].filter(Boolean).join(" ");

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex flex-wrap items-center gap-4">
        <UserAvatar name={displayName} src={user.profile_url} size="large" />
        <div>
          <h3 className="text-2xl font-black text-[#082f1f]">Profil</h3>
          <p className="mt-1 text-sm font-bold text-slate-500">{displayName || "Utilisateur Gansekou"}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <MetricCard icon={UserRound} label="Nom" value={user.nom} />
        <MetricCard icon={UserRound} label="Prenom" value={user.prenom} />
        <MetricCard icon={Mail} label="Email" value={user.email || "-"} />
        <MetricCard icon={ShieldCheck} label="Role" value={formatRole(user.role)} />
      </div>
    </section>
  );
}

function ProfileSettings({ user, reload }: { user: User; reload: () => Promise<void> }) {
  const { language, t } = useI18n(user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [form, setForm] = useState({
    nom: user.nom || "",
    prenom: user.prenom || "",
    phone: user.phone || "",
    age: user.age ? String(user.age) : "",
    preferred_language: user.preferred_language || "FR",
  });
  const [theme, setTheme] = useState("system");
  const [aiCoach, setAiCoach] = useState(true);
  const [learningReminders, setLearningReminders] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const task = window.setTimeout(() => {
      setTheme(window.localStorage.getItem("gansekou_theme") || "system");
    }, 0);

    return () => window.clearTimeout(task);
  }, []);

  function applyTheme(nextTheme: string) {
    setTheme(nextTheme);
    window.localStorage.setItem("gansekou_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setStatus(language === "EN" ? "Saving..." : "Enregistrement...");
    try {
      if (photo) await platformService.uploads.profile(photo);
      const updatedUser = await platformService.users.updateMe({
        nom: form.nom,
        prenom: form.prenom,
        phone: form.phone,
        age: form.age ? Number(form.age) : null,
        preferred_language: form.preferred_language,
      });
      updateUser(updatedUser);
      setStoredLanguage(form.preferred_language === "EN" ? "EN" : "FR");
      await reload();
      setStatus(t("settings.languageSaved"));
      notifyGansekou({ kind: "success", title: t("settings.savedTitle"), message: t("settings.savedBody") });
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Enregistrement impossible.");
      notifyGansekou({ kind: "error", title: t("settings.errorTitle"), message: error instanceof ApiError ? error.message : t("settings.errorBody") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <section className="premium-surface rounded-[2rem] p-7 text-white">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{t("settings.title")}</p>
        <h3 className="mt-3 text-3xl font-black">{t("settings.premiumTitle")}</h3>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-7 text-white/70">{t("settings.premiumBody")}</p>
      </section>
      <section className="ds-card rounded-[2rem] p-7">
      <h3 className="text-2xl font-black text-[#082f1f]">{t("settings.profile")}</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(["prenom", "nom", "phone", "age"] as const).map((key) => (
          <input
            key={key}
            value={form[key]}
            onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none"
            placeholder={key}
          />
        ))}
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-black text-[#071d3a]">{t("settings.language")}</p>
          <p className="mt-1 text-sm font-bold text-slate-500">{t("settings.languageHelp")}</p>
          <select
            value={form.preferred_language}
            onChange={(event) => {
              const nextLanguage = event.target.value;
              setForm((current) => ({ ...current, preferred_language: nextLanguage }));
              setStoredLanguage(nextLanguage === "EN" ? "EN" : "FR");
            }}
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none"
          >
            <option value="FR">Français</option>
            <option value="EN">English</option>
          </select>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-black text-[#071d3a]">{t("settings.theme")}</p>
          <p className="mt-1 text-sm font-bold text-slate-500">{t("settings.themeHelp")}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["system", "light", "dark"].map((option, index) => (
              <button
                key={`theme-option-${option}-${index}`}
                type="button"
                onClick={() => applyTheme(option)}
                className={`rounded-2xl px-3 py-3 text-sm font-black transition ${theme === option ? "bg-[#071d3a] text-white" : "bg-slate-50 text-[#071d3a]"}`}
              >
                {t(`settings.theme.${option}`)}
              </button>
            ))}
          </div>
        </div>
        <label className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 font-bold text-slate-500">
          {photo?.name || t("settings.profilePhoto")}
          <input className="hidden" type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)} />
        </label>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <SettingToggle label={t("settings.aiCoach")} detail={t("settings.aiCoachHelp")} checked={aiCoach} onChange={setAiCoach} />
        <SettingToggle label={t("settings.notifications")} detail={t("settings.notificationsHelp")} checked={learningReminders} onChange={setLearningReminders} />
        <SettingToggle label={t("settings.offline")} detail={t("settings.offlineHelp")} checked={offlineMode} onChange={setOfflineMode} />
      </div>
      <p className="mt-4 text-sm font-black text-[#0f5f3a]">{t("settings.language")}: {language}</p>
      <LoadingButton
        onClick={save}
        loading={saving}
        loadingLabel={language === "EN" ? "Saving..." : "Enregistrement..."}
        className="mt-5 rounded-full"
      >
        {t("action.save")}
      </LoadingButton>
      {status && <p className="mt-3 text-sm font-bold text-slate-600">{status}</p>}
      </section>
    </section>
  );
}

function SettingToggle({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex min-h-28 items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#f6c445]"
      aria-pressed={checked}
    >
      <span>
        <span className="block font-black text-[#071d3a]">{label}</span>
        <span className="mt-1 block text-sm font-bold text-slate-500">{detail}</span>
      </span>
      <span className={`mt-1 h-6 w-11 rounded-full p-1 transition ${checked ? "bg-[#0f5f3a]" : "bg-slate-300"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}
