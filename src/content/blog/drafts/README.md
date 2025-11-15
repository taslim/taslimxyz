# Drafts

Work-in-progress blog posts. Files here are git-ignored and won't appear in the blog.

## Workflow

1. **Create**: `pnpm new`
2. **Write**: Edit your draft, add content
3. **Add summary**: Ensure `summary` field is filled (required for publishing)
4. **Publish**: `pnpm publish:drafts`

## Notes

- Draft frontmatter only needs `title` (summary + tags optional)
- Publishing adds `publishedAt` timestamp automatically
- Republishing preserves original `publishedAt` and adds `updatedAt`
- Posts sorted by `publishedAt` (newest first)
- sample-post.example shows all the supported MDX components

