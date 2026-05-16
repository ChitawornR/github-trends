---
name: review-findings
description: Patterns and recurring issues found during the initial GitHub Trends Dashboard review
metadata:
  type: project
---

Key findings from first code review:

1. **Silent error swallow in TrendingSectionLoader** (`app/page.tsx` line 66): Initial trending fetch errors are silently converted to empty state. The `TrendingSection` client component receives `initialRepos=[]` and shows empty state even on rate-limit/internal errors. Should pass error metadata or render an error StateMessage from the server side.

2. **`getRepositoriesByUser` error log label** (`src/application/use-cases/search.use-case.ts` line 95): The catch block that covers both `getUserOrOrg` and `getRepositoriesByUser` logs `[SearchUseCase] getUserOrOrg error` — imprecise when `getRepositoriesByUser` throws.

3. **`colorClass` naming** (`src/presentation/view-models/language-stat.view-model.ts`): Field name implies a CSS class but stores hex color strings. Works correctly but is a readability issue. Could be renamed `color` or `colorHex`.

4. **`RepositoryCard` missing explicit GitHub link in card footer**: The card does show the repo name as a link to `repo.htmlUrl`, and owner as a link to `repo.ownerHtmlUrl`. There is no dedicated "View on GitHub" button in RepositoryCard (unlike RepositoryDetail). The spec says "a link to GitHub" — the name link satisfies this, but could be more explicit.

5. **Clean architecture dependency rule**: Fully respected. No violations found. domain imports nothing outward; application imports only domain+application; infrastructure is the only layer calling fetch/process.env; app/ is thin.

**Why:** Recorded so future reviews can re-verify these patterns haven't regressed.
**How to apply:** Focus review attention on TrendingSectionLoader error path and the search use-case error logging.
