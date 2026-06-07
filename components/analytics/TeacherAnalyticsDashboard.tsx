"use client";

import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { AnalyticsInsightStrip } from "@/components/analytics/AnalyticsInsightStrip";
import { ProgressBar } from "@/components/analytics/ProgressBar";

type Labels = {
  teacherPerformance: string;
  contentPerformance: string;
  quizPerformance: string;
  actionableInsights: string;
  noData: string;
  contents: string;
  views: string;
  downloads: string;
  likes: string;
  quizzes: string;
  attempts: string;
  pendingQuestions: string;
  assignedQuestions: string;
  topContent: string;
  questionStatus: string;
  contentEngaging: string;
  urgentQuestions: string;
  quizNeedsReview: string;
};

export function TeacherAnalyticsDashboard({
  contents,
  quizzes,
  pending,
  assigned,
  labels,
}: {
  contents: Array<{ title?: string | null; total_views?: number; total_downloads?: number; total_likes?: number; content_type?: string }>;
  quizzes: Array<{ title?: string; total_attempts?: number; passing_score?: number }>;
  pending: unknown[];
  assigned: unknown[];
  labels: Labels;
}) {
  const views = contents.reduce((sum, item) => sum + (item.total_views || 0), 0);
  const downloads = contents.reduce((sum, item) => sum + (item.total_downloads || 0), 0);
  const likes = contents.reduce((sum, item) => sum + (item.total_likes || 0), 0);
  const attempts = quizzes.reduce((sum, item) => sum + (item.total_attempts || 0), 0);
  const topContent = contents
    .slice()
    .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
    .slice(0, 6)
    .map((item) => ({ label: item.title || item.content_type || labels.contents, value: item.total_views || 0 }));
  const insights = [
    views > 0 ? labels.contentEngaging : "",
    pending.length > 0 ? labels.urgentQuestions : "",
    attempts > 0 && attempts < quizzes.length * 2 ? labels.quizNeedsReview : "",
  ];

  return (
    <div className="grid gap-5">
      <AnalyticsInsightStrip title={labels.actionableInsights} insights={insights} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard title={labels.contents} value={contents.length} description={labels.contentPerformance} trend={contents.length ? 9 : 0} />
        <AnalyticsCard title={labels.views} value={views} description={labels.topContent} tone="blue" trend={views ? 12 : 0} />
        <AnalyticsCard title={labels.quizzes} value={quizzes.length} description={`${attempts} ${labels.attempts}`} tone="gold" trend={attempts ? 7 : 0} />
        <AnalyticsCard title={labels.pendingQuestions} value={pending.length} description={labels.actionableInsights} tone={pending.length ? "red" : "green"} trend={pending.length ? -8 : 0} />
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <AnalyticsChart title={labels.topContent} data={topContent} emptyLabel={labels.noData} />
        <AnalyticsChart
          title={labels.questionStatus}
          data={[
            { label: labels.pendingQuestions, value: pending.length },
            { label: labels.assignedQuestions, value: assigned.length },
          ]}
          type="donut"
          emptyLabel={labels.noData}
        />
      </section>
      <section className="ds-card rounded-[1.5rem] p-5">
        <h3 className="text-lg font-black text-[#071d3a]">{labels.teacherPerformance}</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ProgressBar label={labels.views} value={Math.min(100, views)} detail={`${views}`} />
          <ProgressBar label={labels.downloads} value={Math.min(100, downloads)} detail={`${downloads}`} />
          <ProgressBar label={labels.likes} value={Math.min(100, likes)} detail={`${likes}`} />
        </div>
      </section>
    </div>
  );
}
