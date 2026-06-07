"use client";

import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { ProgressRing } from "@/components/analytics/ProgressRing";

export function QuizAnalyticsPanel({
  analytics,
  leaderboard,
  labels,
}: {
  analytics?: { total_attempts?: number; average_score?: number; pass_rate?: number } | null;
  leaderboard?: Array<{ score?: number; is_passed?: boolean; started_at?: string }>;
  labels: {
    quizPerformance: string;
    attempts: string;
    averageScore: string;
    passRate: string;
    noData: string;
    leaderboard: string;
    scoreDistribution: string;
  };
}) {
  const scores = leaderboard || [];
  const buckets = [
    { label: "0-49", value: scores.filter((item) => (item.score || 0) < 50).length },
    { label: "50-69", value: scores.filter((item) => (item.score || 0) >= 50 && (item.score || 0) < 70).length },
    { label: "70-89", value: scores.filter((item) => (item.score || 0) >= 70 && (item.score || 0) < 90).length },
    { label: "90+", value: scores.filter((item) => (item.score || 0) >= 90).length },
  ];

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsCard title={labels.attempts} value={analytics?.total_attempts ?? scores.length} description={labels.quizPerformance} />
        <AnalyticsCard title={labels.averageScore} value={`${analytics?.average_score ?? 0}%`} description={labels.scoreDistribution} tone="gold" />
        <AnalyticsCard title={labels.passRate} value={`${analytics?.pass_rate ?? 0}%`} description={labels.leaderboard} tone="blue" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="ds-card rounded-[1.5rem] p-5">
          <ProgressRing label={labels.passRate} value={analytics?.pass_rate ?? 0} />
        </div>
        <AnalyticsChart title={labels.scoreDistribution} data={buckets} emptyLabel={labels.noData} />
      </div>
    </section>
  );
}
