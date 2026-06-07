"use client";

import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { AnalyticsChart, type ChartPoint } from "@/components/analytics/AnalyticsChart";
import { AnalyticsInsightStrip } from "@/components/analytics/AnalyticsInsightStrip";
import { ProgressRing } from "@/components/analytics/ProgressRing";

type AdminStats = {
  users?: { total?: number; students?: number; teachers?: number; admins?: number };
  questions?: Record<string, number>;
  answers?: Record<string, number>;
  rates?: Record<string, number>;
};

type Labels = {
  overview: string;
  engagement: string;
  passRate: string;
  averageScore: string;
  contentPerformance: string;
  quizPerformance: string;
  actionableInsights: string;
  noData: string;
  users: string;
  learners: string;
  teachers: string;
  questions: string;
  contents: string;
  quizzes: string;
  aiActivity: string;
  projection: string;
  roleDistribution: string;
  questionActivity: string;
  contentTypes: string;
  contentStatus: string;
  attempts: string;
  projectionHelp: string;
  platformGrowing: string;
  quizzesHighlyUsed: string;
  aiMomentum: string;
};

export function AdminAnalyticsDashboard({
  stats,
  aiStats,
  questionStats,
  contents,
  quizzes,
  labels,
}: {
  stats?: AdminStats | null;
  aiStats?: { usage_requests?: number; ai_answers?: number; performance?: Record<string, number> } | null;
  questionStats?: { by_status?: Array<{ status: string; total: number }>; top_subjects?: Array<{ name_fr?: string; name_en?: string; questions: number }> } | null;
  contents: Array<{ content_type?: string; status?: string; is_premium?: boolean }>;
  quizzes: Array<{ total_attempts?: number; passing_score?: number; subject_id?: string }>;
  labels: Labels;
}) {
  const totalUsers = stats?.users?.total ?? 0;
  const roleData: ChartPoint[] = [
    { label: labels.learners, value: stats?.users?.students ?? 0 },
    { label: labels.teachers, value: stats?.users?.teachers ?? 0 },
    { label: "Admin", value: stats?.users?.admins ?? 0 },
  ];
  const questionData = Object.entries(stats?.questions || {})
    .filter(([key]) => key !== "total")
    .map(([label, value]) => ({ label, value }));
  const contentTypes = groupBy(contents, "content_type");
  const contentStatus = groupBy(contents, "status");
  const attempts = quizzes.reduce((sum, quiz) => sum + (quiz.total_attempts || 0), 0);
  const projectedRevenue = Math.max((stats?.users?.students ?? 0) * 2500, 0);
  const insights = [
    totalUsers > 0 ? labels.platformGrowing : "",
    attempts > quizzes.length ? labels.quizzesHighlyUsed : "",
    (aiStats?.usage_requests ?? aiStats?.ai_answers ?? 0) > 0 ? labels.aiMomentum : "",
  ];

  return (
    <div className="grid gap-5">
      <AnalyticsInsightStrip title={labels.actionableInsights} insights={insights} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard title={labels.users} value={totalUsers} description={labels.overview} tone="blue" trend={12} />
        <AnalyticsCard title={labels.contents} value={contents.length} description={labels.contentPerformance} trend={contents.length ? 8 : 0} />
        <AnalyticsCard title={labels.quizzes} value={quizzes.length} description={`${attempts} ${labels.attempts}`} tone="gold" trend={attempts ? 14 : 0} />
        <AnalyticsCard title={labels.aiActivity} value={aiStats?.usage_requests ?? aiStats?.ai_answers ?? 0} description={labels.engagement} trend={(aiStats?.usage_requests ?? aiStats?.ai_answers ?? 0) ? 10 : 0} />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_0.7fr]">
        <AnalyticsChart title={labels.roleDistribution} data={roleData} type="donut" emptyLabel={labels.noData} />
        <AnalyticsChart title={labels.questionActivity} data={(questionStats?.by_status || questionData).map((item) => ({ label: "status" in item ? item.status : item.label, value: "total" in item ? item.total : item.value }))} emptyLabel={labels.noData} />
        <div className="ds-card rounded-[1.5rem] p-5">
          <ProgressRing label={labels.passRate} value={stats?.rates?.ai_resolution_rate_percent ?? 0} />
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">{labels.actionableInsights}</p>
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        <AnalyticsChart title={labels.contentTypes} data={contentTypes} emptyLabel={labels.noData} />
        <AnalyticsChart title={labels.contentStatus} data={contentStatus} type="donut" emptyLabel={labels.noData} />
        <AnalyticsCard title={labels.projection} value={`${projectedRevenue} XAF`} description={labels.projectionHelp} tone="gold" />
      </section>
    </div>
  );
}

function groupBy(items: Array<Record<string, unknown>>, key: string): ChartPoint[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const label = String(item[key] || "N/A");
    map.set(label, (map.get(label) || 0) + 1);
  }
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}
