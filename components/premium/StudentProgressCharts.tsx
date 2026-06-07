"use client";

import { AnalyticsChart, type ChartPoint } from "@/components/analytics/AnalyticsChart";
import { ActivityHeatmap } from "@/components/premium/ActivityHeatmap";

export function StudentProgressCharts({
  progress,
  scores,
  activity,
  labels,
}: {
  progress: ChartPoint[];
  scores: ChartPoint[];
  activity: ChartPoint[];
  labels: { progress: string; scores: string; activity: string; empty: string };
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <AnalyticsChart title={labels.progress} data={progress} type="bar" emptyLabel={labels.empty} />
      <AnalyticsChart title={labels.scores} data={scores} type="line" emptyLabel={labels.empty} />
      <ActivityHeatmap title={labels.activity} data={activity} emptyLabel={labels.empty} />
    </section>
  );
}
