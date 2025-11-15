# taslimxyz

Personal website and blog built with Next.js, TypeScript, and Tailwind CSS.

## Development

```bash
pnpm install   # Install dependencies
pnpm dev       # Start dev server
pnpm build     # Build for production
pnpm check     # Run linter + type check
```

## Blog Workflow

```bash
pnpm new              # Create a new draft
pnpm publish:drafts   # Publish selected drafts
```

See [`src/content/drafts/README.md`](src/content/drafts/README.md) for workflow documentation.

## Analytics

Google Analytics 4 is integrated using Next.js' official `@next/third-parties/google` package, with a lightweight client tracker for SPA navigation. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in `.env.local` to enable analytics. If omitted, analytics will be disabled.

- **Initial pageview:** The `GoogleAnalytics` component in `src/app/layout.tsx` handles the first page load.
- **SPA navigation:** `AnalyticsClient` (`src/components/analytics-client.tsx`) tracks subsequent client-side route changes via `page_view` events.
- **Web Vitals:** `WebVitalsReporter` (`src/components/web-vitals-reporter.tsx`) forwards Core Web Vitals (CLS, FCP, INP, LCP, TTFB) to GA4 via `useReportWebVitals`.
- **Internal traffic tagging:** All events in non-production environments automatically include `traffic_type: "internal"` to help filter dev/preview traffic in GA4.
- **Custom events:** Use `trackEvent("event_name", { ...params })` from `src/lib/analytics.ts` for future interactions; it automatically no-ops when analytics is disabled or `window.gtag` is unavailable.

## Tech Stack

- [Next.js](https://nextjs.org) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [MDX](https://mdxjs.com/) - Blog content with React components
- [date-fns](https://date-fns.org/) - Date formatting

## Deployment

Deployed on [Vercel](https://vercel.com). Pushes to `main` trigger automatic deployments.
