declare module "next/dist/compiled/web-vitals" {
  /**
   * Metric interface matching web-vitals library v5+
   * @see https://github.com/GoogleChrome/web-vitals
   */
  export interface Metric {
    /** Metric name (in acronym form) */
    name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
    /** Metric value in milliseconds (or CLS score) */
    value: number;
    /** Rating based on web.dev thresholds */
    rating: "good" | "needs-improvement" | "poor";
    /** Delta from previous measurement */
    delta: number;
    /** Unique identifier for this metric instance */
    id: string;
    /** Performance entries used to calculate the metric */
    entries: PerformanceEntry[];
    /** Navigation type that triggered the metric */
    navigationType:
      | "navigate"
      | "reload"
      | "back-forward"
      | "back-forward-cache"
      | "prerender"
      | "restore";
  }

  /**
   * Core Web Vitals metric names supported by Next.js
   * @see https://web.dev/vitals/
   */
  type MetricName = Metric["name"];
}
