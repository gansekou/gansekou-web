"use client";

import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { AnalyticsInsightStrip } from "@/components/analytics/AnalyticsInsightStrip";
import { ProgressBar } from "@/components/analytics/ProgressBar";
import { ProgressRing } from "@/components/analytics/ProgressRing";
import type { StudentBadge, StudentGamificationProfile } from "@/types/gamification";

type Labels = {
  engagement: string;
  progressTrend: string;
  averageScore: string;
  noData: string;
  coursesCompleted: string;
  quizzesCompleted: string;
  streak: string;
  xp: string;
  badges: string;
  learningTime: string;
  actionableInsights: string;
  fasterProgress: string;
  mathStrength: string;
  reviewWeaknesses: string;
};

export function StudentAnalyticsDashboard({
  progress,
  quizHistory,
  profile,
  badges,
  labels,
}: {
  progress: Array<{ progress_percent?: number; is_completed?: boolean; time_spent_minutes?: number; updated_at?: string }>;
  quizHistory: Array<{ score?: number; is_passed?: boolean; started_at?: string; completed_at?: string }>;
  profile?: StudentGamificationProfile | null;
  badges: StudentBadge[];
  labels: Labels;
}) {
  const completed = progress.filter((item) => item.is_completed).length;
  const averageProgress = progress.length
    ? Math.round(progress.reduce((sum, item) => sum + (item.progress_percent || 0), 0) / progress.length)
    : 0;
  const averageScore = quizHistory.length
    ? Math.round(quizHistory.reduce((sum, item) => sum + (item.score || 0), 0) / quizHistory.length)
    : 0;
  const timeSpent = progress.reduce((sum, item) => sum + (item.time_spent_minutes || 0), 0);
  const scoreLine = quizHistory.slice(0, 8).reverse().map((item, index) => ({
    label: item.completed_at ? new Date(item.completed_at).toLocaleDateString("fr-FR") : `${index + 1}`,
    value: item.score || 0,
  }));
  const insights = [
    averageProgress >= 50 ? labels.fasterProgress : "",
    averageScore >= 70 ? labels.mathStrength : "",
    averageScore > 0 && averageScore < 60 ? labels.reviewWeaknesses : "",
  ];

  return (
    <div className="grid gap-5">
      <AnalyticsInsightStrip title={labels.actionableInsights} insights={insights} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard title={labels.coursesCompleted} value={completed} description={labels.engagement} trend={completed ? 10 : 0} />
        <AnalyticsCard title={labels.quizzesCompleted} value={quizHistory.length} description={labels.averageScore} tone="gold" trend={averageScore >= 60 ? 12 : 0} />
        <AnalyticsCard title={labels.xp} value={profile?.points ?? 0} description={labels.streak} tone="blue" trend={(profile?.points ?? 0) ? 15 : 0} />
        <AnalyticsCard title={labels.badges} value={badges.length} description={labels.actionableInsights} trend={badges.length ? 6 : 0} />
      </section>
      <section className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="ds-card rounded-[1.5rem] p-5">
          <ProgressRing label={labels.progressTrend} value={averageProgress} />
          <div className="mt-5">
            <ProgressBar label={labels.averageScore} value={averageScore} detail={`${averageScore}%`} />
          </div>
        </div>
        <AnalyticsChart title={labels.progressTrend} data={scoreLine} type="line" emptyLabel={labels.noData} />
      </section>
      <AnalyticsCard title={labels.learningTime} value={`${timeSpent} min`} description={labels.actionableInsights} tone="green" />
    </div>
  );
}
