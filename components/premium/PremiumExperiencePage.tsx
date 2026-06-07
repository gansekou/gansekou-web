"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, CheckCircle2, CircleDollarSign, Clock, GraduationCap, MessageCircleQuestion, ShieldCheck, Trophy, Users, Zap } from "lucide-react";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { LoadingState, ErrorState } from "@/components/app/StateViews";
import { AnalyticsChart, type ChartPoint } from "@/components/analytics/AnalyticsChart";
import { PremiumStatsCard } from "@/components/premium/PremiumStatsCard";
import { XPProgressBar } from "@/components/premium/XPProgressBar";
import { StreakCard } from "@/components/premium/StreakCard";
import { BadgeGrid } from "@/components/premium/BadgeGrid";
import { LeaderboardTable, type LeaderboardRow } from "@/components/premium/LeaderboardTable";
import { StudentProgressCharts } from "@/components/premium/StudentProgressCharts";
import { TeacherAnalyticsCharts } from "@/components/premium/TeacherAnalyticsCharts";
import { AiInsightsCard } from "@/components/premium/AiInsightsCard";
import { RecommendationEngine } from "@/components/premium/RecommendationEngine";
import { RealtimeNotificationBell } from "@/components/premium/RealtimeNotificationBell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";
import { isAdminRole } from "@/lib/permissions";
import { platformService } from "@/services/platform.service";

export type PremiumExperienceKind =
  | "analytics"
  | "leaderboards"
  | "achievements"
  | "gamification"
  | "realtime"
  | "teacher-analytics"
  | "teacher-performance"
  | "student-progress"
  | "profile-badges";

export function PremiumExperiencePage({ kind }: { kind: PremiumExperienceKind }) {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, error: authError } = useCurrentUser();
  const { language } = useI18n(user);
  const labels = premiumLabels(language);
  const loader = useMemo(() => () => loadPremiumData(kind, user?.role), [kind, user?.role]);
  const { data, loading, error, reload } = useAsyncData<Record<string, unknown>>(loader);

  if (!authLoading && !isAuthenticated) router.replace("/login");

  if (authLoading || loading) {
    return (
      <DashboardShell user={user}>
        <LoadingState label={labels.loading} />
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell user={null}>
        <ErrorState title={labels.session} message={authError} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user}>
      <div className="grid gap-6">
        {error && <ErrorState message={error} />}
        <section className="rounded-[1.75rem] bg-[#071d3a] p-6 text-white shadow-2xl shadow-[#071d3a]/15 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f6c445]">{labels.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">{labels.titles[kind]}</h2>
              <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-white/70">{labels.body}</p>
            </div>
            <RealtimeNotificationBell user={user} labels={labels.notifications} />
          </div>
        </section>

        {kind === "leaderboards" ? (
          <Leaderboards data={data || {}} labels={labels} />
        ) : kind === "achievements" || kind === "profile-badges" ? (
          <Achievements data={data || {}} labels={labels} language={language} reload={reload} />
        ) : kind === "teacher-analytics" || kind === "teacher-performance" ? (
          <TeacherPremium data={data || {}} labels={labels} />
        ) : kind === "student-progress" || kind === "gamification" ? (
          <StudentPremium data={data || {}} labels={labels} />
        ) : kind === "realtime" ? (
          <RealtimePanel data={data || {}} labels={labels} />
        ) : isAdminRole(user) ? (
          <AdminPremium data={data || {}} labels={labels} />
        ) : user.role === "ENSEIGNANT" ? (
          <TeacherPremium data={data || {}} labels={labels} />
        ) : (
          <StudentPremium data={data || {}} labels={labels} />
        )}
      </div>
    </DashboardShell>
  );
}

async function loadPremiumData(kind: PremiumExperienceKind, role?: string) {
  if (kind === "leaderboards") {
    return { leaderboards: await platformService.statistics.leaderboards() };
  }

  if (kind === "achievements" || kind === "profile-badges") {
    const [badges, mine] = await Promise.all([
      platformService.gamification.badges().catch(() => []),
      platformService.gamification.myBadges().catch(() => []),
    ]);
    return { badges, mine };
  }

  if (kind === "teacher-analytics" || kind === "teacher-performance") {
    return { overview: await platformService.statistics.teacherOverview() };
  }

  if (kind === "student-progress" || kind === "gamification") {
    return { overview: await platformService.statistics.studentOverview() };
  }

  if (kind === "realtime") {
    return { notifications: await platformService.notifications.mine().catch(() => []) };
  }

  if (role && ["ADMIN", "ADMINISTRATEUR", "PROMOTEUR"].includes(role)) {
    return { overview: await platformService.statistics.adminOverview() };
  }

  if (role === "ENSEIGNANT") {
    return { overview: await platformService.statistics.teacherOverview() };
  }

  return { overview: await platformService.statistics.studentOverview() };
}

function AdminPremium({ data, labels }: { data: Record<string, unknown>; labels: ReturnType<typeof premiumLabels> }) {
  const overview = data.overview as PremiumOverview | undefined;
  const metrics = overview?.metrics || {};
  const charts = overview?.charts || {};
  const tops = overview?.tops || {};

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PremiumStatsCard icon={Users} label={labels.totalUsers} value={num(metrics.total_users)} detail={labels.activeToday.replace("{count}", String(num(metrics.active_today)))} />
        <PremiumStatsCard icon={GraduationCap} label={labels.newStudents} value={num(metrics.new_students_30d)} tone="gold" />
        <PremiumStatsCard icon={ShieldCheck} label={labels.pendingTeachers} value={num(metrics.pending_teachers)} tone="blue" />
        <PremiumStatsCard icon={CircleDollarSign} label={labels.monthRevenue} value={num(metrics.revenue_month_xaf)} suffix=" XAF" tone="green" />
      </section>
      <section className="grid gap-5 xl:grid-cols-3">
        <AnalyticsChart title={labels.userGrowth} data={points(charts.users_growth)} type="line" emptyLabel={labels.empty} />
        <AnalyticsChart title={labels.questions} data={points(charts.questions)} type="bar" emptyLabel={labels.empty} />
        <AnalyticsChart title={labels.quizAttempts} data={points(charts.quiz_attempts)} type="line" emptyLabel={labels.empty} />
      </section>
      <section className="grid gap-5 xl:grid-cols-3">
        <AnalyticsChart title={labels.topSubjects} data={topPoints(tops.subjects)} type="donut" emptyLabel={labels.empty} />
        <AnalyticsChart title={labels.topLevels} data={topPoints(tops.levels)} type="bar" emptyLabel={labels.empty} />
        <AnalyticsChart title={labels.topTeachers} data={topPoints(tops.teachers)} type="bar" emptyLabel={labels.empty} />
      </section>
      <AiInsightsCard title={labels.aiInsights} insights={[labels.insightGrowth, labels.insightEngagement, labels.insightPremium]} />
    </>
  );
}

function TeacherPremium({ data, labels }: { data: Record<string, unknown>; labels: ReturnType<typeof premiumLabels> }) {
  const overview = data.overview as PremiumOverview | undefined;
  const metrics = overview?.metrics || {};
  const charts = overview?.charts || {};

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <XPProgressBar xp={num(metrics.xp)} level={String(metrics.level_label || labels.level)} label={labels.xpProgress} />
        <section className="grid gap-4 md:grid-cols-3">
          <PremiumStatsCard icon={Trophy} label={labels.rank} value={num(metrics.rank)} tone="gold" />
          <PremiumStatsCard icon={MessageCircleQuestion} label={labels.responseRate} value={num(metrics.response_rate)} suffix="%" />
          <PremiumStatsCard icon={BookOpen} label={labels.contentViews} value={num(metrics.content_views)} tone="blue" />
        </section>
      </section>
      <TeacherAnalyticsCharts
        xp={points(charts.xp)}
        answers={points(charts.answers)}
        contentViews={points(charts.content_views)}
        labels={{ xp: labels.xpChart, answers: labels.answersChart, contentViews: labels.contentViews, empty: labels.empty }}
      />
      <section className="grid gap-4 md:grid-cols-4">
        <PremiumStatsCard icon={Users} label={labels.studentsHelped} value={num(metrics.answered_questions)} />
        <PremiumStatsCard icon={Clock} label={labels.responseTime} value={24} suffix="h" tone="gold" />
        <PremiumStatsCard icon={Zap} label={labels.potentialRevenue} value={num(metrics.potential_revenue_xaf)} suffix=" XAF" tone="blue" />
        <PremiumStatsCard icon={CheckCircle2} label={labels.downloads} value={num(metrics.content_downloads)} />
      </section>
      <AiInsightsCard title={labels.aiInsights} insights={[labels.teacherInsightOne, labels.teacherInsightTwo, labels.teacherInsightThree]} />
    </>
  );
}

function StudentPremium({ data, labels }: { data: Record<string, unknown>; labels: ReturnType<typeof premiumLabels> }) {
  const overview = data.overview as PremiumOverview | undefined;
  const metrics = overview?.metrics || {};
  const charts = overview?.charts || {};

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <XPProgressBar xp={num(metrics.xp)} level={String(metrics.level_label || labels.level)} label={labels.xpProgress} />
        <section className="grid gap-4 md:grid-cols-3">
          <StreakCard days={num(metrics.streak)} best={num(metrics.best_streak)} title={labels.streak} detail={labels.bestStreak} />
          <PremiumStatsCard icon={Trophy} label={labels.rank} value={num(metrics.rank)} tone="gold" />
          <PremiumStatsCard icon={Clock} label={labels.learningTime} value={num(metrics.learning_time_minutes)} suffix=" min" tone="blue" />
        </section>
      </section>
      <StudentProgressCharts
        progress={points(charts.progress)}
        scores={points(charts.scores)}
        activity={points(charts.activity)}
        labels={{ progress: labels.progressByContent, scores: labels.scoreHistory, activity: labels.activityHeatmap, empty: labels.empty }}
      />
      <section className="grid gap-4 md:grid-cols-4">
        <PremiumStatsCard icon={BookOpen} label={labels.contentsCompleted} value={num(metrics.contents_completed)} />
        <PremiumStatsCard icon={CheckCircle2} label={labels.quizPassed} value={num(metrics.quizzes_passed)} />
        <PremiumStatsCard icon={MessageCircleQuestion} label={labels.questionsAsked} value={num(metrics.questions_asked)} tone="blue" />
        <PremiumStatsCard icon={BarChart3} label={labels.completionRate} value={num(metrics.content_completion_rate)} suffix="%" tone="gold" />
      </section>
      <RecommendationEngine title={labels.recommendations} emptyLabel={labels.empty} items={[]} />
    </>
  );
}

function Leaderboards({ data, labels }: { data: Record<string, unknown>; labels: ReturnType<typeof premiumLabels> }) {
  const leaderboards = data.leaderboards as { learners?: LeaderboardRow[]; teachers?: LeaderboardRow[] } | undefined;
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <LeaderboardTable title={labels.learnersLeaderboard} rows={leaderboards?.learners || []} emptyLabel={labels.empty} />
      <LeaderboardTable title={labels.teachersLeaderboard} rows={leaderboards?.teachers || []} emptyLabel={labels.empty} />
    </section>
  );
}

function Achievements({ data, labels, language }: { data: Record<string, unknown>; labels: ReturnType<typeof premiumLabels>; language: string; reload: () => Promise<void> }) {
  const mine = (data.mine as unknown[]) || [];
  const badges = (data.badges as unknown[]) || [];
  return (
    <section className="grid gap-5">
      <BadgeGrid badges={mine as never[]} language={language} title={labels.unlockedBadges} lockedLabel={labels.lockedBadge} />
      <BadgeGrid badges={badges as never[]} language={language} title={labels.badgeCatalog} lockedLabel={labels.lockedBadge} />
    </section>
  );
}

function RealtimePanel({ data, labels }: { data: Record<string, unknown>; labels: ReturnType<typeof premiumLabels> }) {
  const notifications = (data.notifications as Array<{ id: string; title: string; message: string; is_read?: boolean }>) || [];
  return (
    <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <AiInsightsCard title={labels.realtimeTitle} insights={[labels.realtimeOne, labels.realtimeTwo, labels.realtimeThree]} />
      <section className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-[#071d3a]/5">
        <h3 className="text-xl font-black text-[#071d3a]">{labels.notifications.title}</h3>
        <div className="mt-5 grid gap-3">
          {notifications.map((item) => (
            <div key={item.id} className={`rounded-2xl p-4 ${item.is_read ? "bg-slate-50" : "bg-[#fff7df]"}`}>
              <p className="font-black text-[#071d3a]">{item.title}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">{item.message}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

type PremiumOverview = {
  metrics?: Record<string, unknown>;
  charts?: Record<string, unknown>;
  tops?: Record<string, unknown>;
};

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function points(value: unknown): ChartPoint[] {
  return Array.isArray(value)
    ? value.map((item) => ({
        label: String((item as { label?: unknown }).label || ""),
        value: num((item as { value?: unknown }).value),
      }))
    : [];
}

function topPoints(value: unknown): ChartPoint[] {
  return Array.isArray(value)
    ? value.map((item) => ({
        label: String((item as { name?: unknown; name_fr?: unknown; title?: unknown }).name || (item as { name_fr?: unknown }).name_fr || (item as { title?: unknown }).title || ""),
        value: num((item as { value?: unknown; views?: unknown }).value ?? (item as { views?: unknown }).views),
      }))
    : [];
}

function premiumLabels(language: string) {
  const fr = language !== "EN";
  return {
    loading: fr ? "Chargement de l'expérience premium..." : "Loading premium experience...",
    session: fr ? "Session requise" : "Session required",
    eyebrow: fr ? "Gansekou Premium Intelligence" : "Gansekou Premium Intelligence",
    body: fr
      ? "Statistiques, badges, progression, recommandations et signaux temps réel dans une expérience éducative fluide."
      : "Statistics, badges, progress, recommendations and realtime signals in a fluid learning experience.",
    titles: {
      analytics: fr ? "Analytics professionnels" : "Professional analytics",
      leaderboards: fr ? "Classements Gansekou" : "Gansekou leaderboards",
      achievements: fr ? "Badges et réussites" : "Badges and achievements",
      gamification: fr ? "Progression gamifiée" : "Gamified progress",
      realtime: fr ? "Temps réel" : "Realtime",
      "teacher-analytics": fr ? "Analytics enseignant" : "Teacher analytics",
      "teacher-performance": fr ? "Performance enseignant" : "Teacher performance",
      "student-progress": fr ? "Progression élève" : "Student progress",
      "profile-badges": fr ? "Badges du profil" : "Profile badges",
    } as Record<PremiumExperienceKind, string>,
    notifications: {
      title: fr ? "Notifications live" : "Live notifications",
      empty: fr ? "Aucune notification récente." : "No recent notifications.",
      open: fr ? "Ouvrir les notifications" : "Open notifications",
    },
    totalUsers: fr ? "Utilisateurs" : "Users",
    activeToday: fr ? "{count} actif(s) aujourd'hui" : "{count} active today",
    newStudents: fr ? "Nouveaux élèves" : "New learners",
    pendingTeachers: fr ? "Enseignants en attente" : "Pending teachers",
    monthRevenue: fr ? "Revenus mensuels" : "Monthly revenue",
    userGrowth: fr ? "Croissance utilisateurs" : "User growth",
    questions: fr ? "Questions" : "Questions",
    quizAttempts: fr ? "Tentatives quiz" : "Quiz attempts",
    topSubjects: fr ? "Top matières" : "Top subjects",
    topLevels: fr ? "Top niveaux" : "Top levels",
    topTeachers: fr ? "Top enseignants" : "Top teachers",
    aiInsights: fr ? "Insights Kouma IA" : "Kouma AI insights",
    insightGrowth: fr ? "La croissance récente permet d'identifier les cohortes à accompagner en priorité." : "Recent growth highlights cohorts that need priority support.",
    insightEngagement: fr ? "Les signaux d'engagement combinent activité, quiz, contenus et questions." : "Engagement signals combine activity, quizzes, content and questions.",
    insightPremium: fr ? "Les revenus premium peuvent être reliés aux contenus à forte valeur pédagogique." : "Premium revenue can be linked to high-value learning content.",
    xpProgress: fr ? "XP et niveau" : "XP and level",
    level: fr ? "Niveau Gansekou" : "Gansekou level",
    rank: fr ? "Rang" : "Rank",
    responseRate: fr ? "Taux de réponse" : "Response rate",
    contentViews: fr ? "Vues contenus" : "Content views",
    xpChart: fr ? "Progression XP" : "XP progress",
    answersChart: fr ? "Réponses" : "Answers",
    studentsHelped: fr ? "Élèves aidés" : "Learners helped",
    responseTime: fr ? "Réponse moyenne" : "Average response",
    potentialRevenue: fr ? "Revenus potentiels" : "Potential revenue",
    downloads: fr ? "Téléchargements" : "Downloads",
    teacherInsightOne: fr ? "Répondre aux questions prioritaires augmente l'impact et l'XP." : "Answering priority questions increases impact and XP.",
    teacherInsightTwo: fr ? "Les contenus les plus vus doivent devenir des quiz ou fiches de révision." : "Most-viewed content should become quizzes or revision sheets.",
    teacherInsightThree: fr ? "Les matières actives indiquent où créer les prochaines ressources." : "Active subjects show where to create the next resources.",
    streak: fr ? "Série quotidienne" : "Daily streak",
    bestStreak: fr ? "Meilleure série : {best} jours." : "Best streak: {best} days.",
    learningTime: fr ? "Temps apprentissage" : "Learning time",
    progressByContent: fr ? "Progression par contenu" : "Progress by content",
    scoreHistory: fr ? "Historique des scores" : "Score history",
    activityHeatmap: fr ? "Calendrier activité" : "Activity calendar",
    contentsCompleted: fr ? "Contenus terminés" : "Completed content",
    quizPassed: fr ? "Quiz réussis" : "Passed quizzes",
    questionsAsked: fr ? "Questions posées" : "Questions asked",
    completionRate: fr ? "Taux complétion" : "Completion rate",
    recommendations: fr ? "Recommandations intelligentes" : "Smart recommendations",
    learnersLeaderboard: fr ? "Classement élèves" : "Learner leaderboard",
    teachersLeaderboard: fr ? "Classement enseignants" : "Teacher leaderboard",
    unlockedBadges: fr ? "Badges débloqués" : "Unlocked badges",
    badgeCatalog: fr ? "Catalogue badges" : "Badge catalog",
    lockedBadge: fr ? "Badge verrouillé" : "Locked badge",
    realtimeTitle: fr ? "Canal temps réel" : "Realtime channel",
    realtimeOne: fr ? "Les notifications WebSocket arrivent sans rafraîchir la page." : "WebSocket notifications arrive without refreshing.",
    realtimeTwo: fr ? "Les compteurs non lus combinent polling et signaux live." : "Unread counters combine polling and live signals.",
    realtimeThree: fr ? "Les toasts peuvent être déclenchés depuis les événements métier." : "Toasts can be triggered from business events.",
    empty: fr ? "Les données apparaîtront dès que l'activité sera suffisante." : "Data will appear as soon as there is enough activity.",
  };
}
