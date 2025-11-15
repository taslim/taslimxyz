declare module "next/dist/compiled/web-vitals" {
  /**
   * Core Web Vitals metric names supported by Next.js
   * @see https://web.dev/vitals/
   */
  type MetricName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";

  /**
   * Metric interface matching web-vitals library v3+
   * @see https://github.com/GoogleChrome/web-vitals
   */
  export interface Metric {
    /** Metric name */
    name: MetricName;
    /** Metric value in milliseconds (or CLS score) */
    value: number;
    /** Delta from previous measurement */
    delta: number;
    /** Unique identifier for this metric instance */
    id: string;
    /** Always "web-vital" for these core metrics */
    label: "web-vital";
    /** Performance entries used to calculate the metric */
    entries?: PerformanceEntry[];
    /** Navigation type that triggered the metric */
    navigationType?: "navigate" | "reload" | "back_forward" | "prerender";
    /** Metric start time */
    startTime?: number;
    /** Rating based on web.dev thresholds */
    rating?: "good" | "needs-improvement" | "poor";
  }
}
