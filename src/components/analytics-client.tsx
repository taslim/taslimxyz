"use client";

import { useEffect, useRef } from "react";

import { usePathname, useSearchParams } from "next/navigation";

import { analytics, trackPageview } from "@/lib/analytics";

export function AnalyticsClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialLoad = useRef(true);

  const searchParamsString = searchParams?.toString() ?? "";

  useEffect(() => {
    if (!analytics.isEnabled() || !pathname) {
      return;
    }

    // Skip the first effect run to avoid double page_view on initial load
    // (GoogleAnalytics component handles the first pageview)
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const pagePath = searchParamsString
      ? `${pathname}?${searchParamsString}`
      : pathname;

    // Defer pageview tracking until the next frame to let Next.js update
    // document.title after navigation. This ensures we capture the correct
    // page title. Using requestAnimationFrame is more reliable than setTimeout(0).
    const rafId = window.requestAnimationFrame(() => {
      trackPageview({
        page_location: window.location.href,
        page_path: pagePath,
        page_title: document.title,
      });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [pathname, searchParamsString]);

  return null;
}
