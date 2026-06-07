"use client";

import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { ProgressBar } from "@/components/analytics/ProgressBar";

export function ContentAnalyticsPanel({
  analytics,
  estimatedMinutes,
  labels,
}: {
  analytics?: { views?: number; downloads?: number; likes?: number; shares?: number; rating?: number | null } | null;
  estimatedMinutes?: number | null;
  labels: {
    contentPerformance: string;
    engagement: string;
    noData: string;
    views: string;
    downloads: string;
    likes: string;
    rating: string;
    estimatedTime: string;
  };
}) {
  const views = analytics?.views ?? 0;
  const downloads = analytics?.downloads ?? 0;
  const likes = analytics?.likes ?? 0;
  const total = Math.max(views + downloads + likes, 1);
  const engagement = Math.round(((downloads + likes) / total) * 100);

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsCard title={labels.views} value={views} description={labels.contentPerformance} tone="blue" />
        <AnalyticsCard title={labels.downloads} value={downloads} description={labels.engagement} />
        <AnalyticsCard title={labels.likes} value={likes} description={labels.engagement} tone="gold" />
        <AnalyticsCard title={labels.rating} value={analytics?.rating ?? "-"} description={labels.estimatedTime} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <AnalyticsChart
          title={labels.contentPerformance}
          data={[
            { label: labels.views, value: views },
            { label: labels.downloads, value: downloads },
            { label: labels.likes, value: likes },
          ]}
          emptyLabel={labels.noData}
        />
        <section className="ds-card rounded-[1.5rem] p-5">
          <ProgressBar label={labels.engagement} value={engagement} detail={`${estimatedMinutes || 0} min`} />
        </section>
      </div>
    </section>
  );
}
