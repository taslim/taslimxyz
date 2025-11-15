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

## Tech Stack

- [Next.js](https://nextjs.org) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [MDX](https://mdxjs.com/) - Blog content with React components
- [date-fns](https://date-fns.org/) - Date formatting

## Deployment

Deployed on [Vercel](https://vercel.com). Pushes to `main` trigger automatic deployments.
