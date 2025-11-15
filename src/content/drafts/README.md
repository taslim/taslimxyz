# Drafts

Work-in-progress blog posts. Files here are git-ignored and won't appear in the blog.

## Workflow

1. **Create**: `pnpm new` (creates `drafts/<slug>/index.mdx`)
2. **Write**: Edit your draft, add content and images
3. **Add images**: Place images in the same folder as `index.mdx` (e.g. `hero.jpg`)
4. **Reference images**: Use relative filenames in MDX (the slug is applied automatically):
   ```mdx
   <Figure
     src="hero.jpg"
     alt="Description"
     caption="Optional caption"
   />
   ```
5. **Add summary**: Ensure `summary` field is filled (required for publishing)
6. **Publish**: `pnpm publish:drafts` (moves entire folder to `blog/{year}/{slug}/`)

## Notes

- Draft frontmatter only needs `title` (summary + tags optional)
- Publishing adds `publishedAt` timestamp automatically
- Republishing preserves original `publishedAt` and adds `updatedAt`
- Posts sorted by `publishedAt` (newest first)
- `sample-post.example` shows all the supported MDX components
- Images are mirrored from `src/content/blog/{year}/<slug>/` to `public/images/blog/<slug>/`
  by `pnpm sync:blog-images` (automatically run before `pnpm build`)

