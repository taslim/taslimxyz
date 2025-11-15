import { env } from "@/env";

const measurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const hasMeasurementId =
  typeof measurementId === "string" && measurementId.length > 0;

type EventParams = Record<string, string | number | boolean | null | undefined>;

export type PageviewParams = {
  page_location: string;
  page_path: string;
  page_title?: string;
};

const getGtag = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return typeof window.gtag === "function" ? window.gtag : undefined;
};

export const trackPageview = (params: PageviewParams) => {
  if (!hasMeasurementId) {
    return;
  }

  const gtag = getGtag();

  if (!gtag) {
    return;
  }

  gtag("event", "page_view", {
    send_to: measurementId,
    ...params,
  });
};

export const trackEvent = (eventName: string, params?: EventParams): void => {
  if (!hasMeasurementId) {
    return;
  }

  const gtag = getGtag();

  if (!gtag) {
    return;
  }

  gtag("event", eventName, {
    send_to: measurementId,
    ...params,
  });
};

export const analytics = {
  measurementId,
  isEnabled: () => hasMeasurementId,
};
