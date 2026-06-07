"use client";

import { AnalyticsChart, type ChartPoint } from "@/components/analytics/AnalyticsChart";

export function TeacherAnalyticsCharts({
  xp,
  answers,
  contentViews,
  labels,
}: {
  xp: ChartPoint[];
  answers: ChartPoint[];
  contentViews: ChartPoint[];
  labels: { xp: string; answers: string; contentViews: string; empty: string };
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <AnalyticsChart title={labels.xp} data={xp} type="line" emptyLabel={labels.empty} />
      <AnalyticsChart title={labels.answers} data={answers} type="bar" emptyLabel={labels.empty} />
      <AnalyticsChart title={labels.contentViews} data={contentViews} type="donut" emptyLabel={labels.empty} />
    </section>
  );
}
