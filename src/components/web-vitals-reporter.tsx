"use client";

import { useReportWebVitals } from "next/web-vitals";

import { analytics, trackEvent } from "@/lib/analytics";

const toIntegerValue = (metricName: string, value: number) =>
  Math.round(metricName === "CLS" ? value * 1000 : value);

type ReportCallback = Parameters<typeof useReportWebVitals>[0];

const handleMetric: ReportCallback = (metric) => {
  if (!analytics.isEnabled()) {
    return;
  }

  trackEvent(metric.name, {
    value: toIntegerValue(metric.name, metric.value),
    event_label: metric.id,
    event_category: "Web Vitals",
    non_interaction: true,
  });
};

export function WebVitalsReporter() {
  useReportWebVitals(handleMetric);

  return null;
}
