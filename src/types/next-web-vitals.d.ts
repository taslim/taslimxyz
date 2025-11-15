declare module "next/dist/compiled/web-vitals" {
  type MetricName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";

  export interface Metric {
    name: MetricName;
    value: number;
    delta: number;
    id: string;
    label: "web-vital" | "custom";
    entries: PerformanceEntry[];
    navigationType?: PerformanceNavigationTiming["type"] | "back-forward-cache";
  }
}
