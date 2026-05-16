---
name: project-overview
description: GitHub Trends Dashboard — stack, architecture, and key conventions
metadata:
  type: project
---

Next.js 16.2.6 / React 19.2.4 / TypeScript 5 strict / Tailwind v4 / pnpm. Clean Architecture: domain -> application -> infrastructure/presentation -> di/app. `app/` is thin entry points only. GITHUB_TOKEN is server-only in `src/di/container.ts`. searchParams/params must be awaited (Promise in Next.js 16). Error boundary uses `unstable_retry` prop (not `reset`) per Next.js 16 docs. `colorClass` field in LanguageStatViewModel stores hex color strings (misleadingly named but used correctly).

**Why:** Spec lives in DEVELOPMENT_PLAN.md; rules in AGENTS.md.
**How to apply:** Check Next.js bundled docs at `node_modules/next/dist/docs/01-app/` before making framework claims.
