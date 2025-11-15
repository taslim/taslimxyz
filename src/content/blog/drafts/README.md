# Drafts

Work-in-progress blog posts. Files here are git-ignored and won't appear in the blog.

## Workflow

1. **Create**: `pnpm new` (creates `drafts/<slug>/index.mdx`)
2. **Write**: Edit your draft, add content and images
3. **Add images**: Place images in the same folder as `index.mdx`, then import them:
   ```mdx
   import hero from "./hero.jpg";
   
   <Figure src={hero} alt="Description" caption="Optional caption" />
   ```
4. **Add summary**: Ensure `summary` field is filled (required for publishing)
5. **Publish**: `pnpm publish:drafts` (moves entire folder to `blog/`)

## Notes

- Draft frontmatter only needs `title` (summary + tags optional)
- Publishing adds `publishedAt` timestamp automatically
- Republishing preserves original `publishedAt` and adds `updatedAt`
- Posts sorted by `publishedAt` (newest first)
- `sample-post.example` shows all the supported MDX components

