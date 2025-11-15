type GtagEventParameters = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: GtagEventParameters,
    ) => void;
  }
}

export {};
