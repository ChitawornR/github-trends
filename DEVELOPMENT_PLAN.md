# Development Plan — GitHub Trends Dashboard

> This document is the implementation spec. Agents implement against it and tick items
> off in [`CHECKLIST.md`](./CHECKLIST.md) as they complete them.

## 1. Goal

A responsive web app that displays GitHub trends using the GitHub REST API:

1. **Top Programming Languages** — ranked + Recharts chart + percentage share.
2. **Top Repositories** — most-starred repos with full metadata.
3. **Top Recently Trending Repositories** — Today / This Week / This Month.
4. **Repository Search** — auto-detecting input (user/org, repo name, full `owner/repo`).

The app must handle five states everywhere: **loading, error, empty, invalid input, rate limit**.

## 2. Stack & Conventions

- Next.js 16.2.6 (App Router), React 19.2.4, TypeScript 5 (strict), Tailwind v4.
- Package manager: **pnpm** only.
- Chart library: **Recharts**.
- Styling: **plain Tailwind v4**, hand-built components (no shadcn/ui).
- Architecture: **Clean Architecture** per the project `clean-architecture` skill —
  Domain → Application → Infrastructure → Presentation, `app/` = thin entry points.
- Next.js 16: `params`/`searchParams` are Promises (`await` them); caching is opt-in.

## 3. Architecture & Folder Layout

```
src/
  domain/
    entities/
      repository.entity.ts      # GithubRepository — name, owner, description, stars,
                                #   forks, language, updatedAt, htmlUrl, ...
      owner.entity.ts           # GithubOwner — login, type (User|Organization),
                                #   avatarUrl, htmlUrl, name?, bio?
      language-stat.entity.ts   # LanguageStat — language, repoCount, percentage, rank
    errors/
      domain.error.ts           # DomainError base
    repositories/
      github.repository.ts      # IGithubRepository port (interface)
  application/
    result.ts                   # Result<T,E>, ok(), err()
    errors/
      rate-limit.error.ts        # RateLimitError(resetAt: Date)
      not-found.error.ts         # NotFoundError(resource: string)
      invalid-input.error.ts     # InvalidInputError(message: string)
      internal.error.ts          # InternalError
    dtos/
      repository.dto.ts
      owner.dto.ts
      language-stat.dto.ts
      search-result.dto.ts       # discriminated union: repo-detail | owner-repos | repo-list
    use-cases/
      get-top-languages.use-case.ts
      get-top-repositories.use-case.ts
      get-trending-repositories.use-case.ts
      search.use-case.ts
  infrastructure/
    github/
      github.config.ts           # base URL, language list, constants
      github-api.client.ts       # fetch wrapper: auth header, caching, rate-limit detection
      github.repository.impl.ts  # GithubRepositoryImpl implements IGithubRepository
      github.mapper.ts           # raw GitHub JSON -> domain entities
      github.types.ts            # raw API response types (RawRepo, RawUser, RawSearch)
  presentation/
    view-models/                 # UI-shaped types
    mappers/                     # dto -> view-model
    components/
      layout/      Header, Container, Section
      common/      StateMessage (loading/error/empty/invalid/rate-limit), Skeleton,
                   StatBadge, Spinner
      repository/  RepositoryCard, RepositoryList, RepositoryDetail
      languages/   LanguagesSection, LanguageChart (client, Recharts), LanguageBar
      trending/    TrendingSection (client, tabs -> /api/trending)
      search/      SearchBox (client), SearchResults
  di/
    container.ts                 # composition root; reads process.env.GITHUB_TOKEN
app/
  layout.tsx        # metadata + shell
  page.tsx          # dashboard (RSC): languages + top repos + trending + search box
  loading.tsx       # route-level skeleton
  error.tsx         # client error boundary
  search/page.tsx   # RSC, reads ?q= searchParams -> SearchUseCase
  api/trending/route.ts   # thin handler for trending tab switches
```

**Dependency rule** (inward only): `domain` ← `application` ← `infrastructure`/`presentation` ← `di`/`app`.
Use cases never import Next.js, React, or `infrastructure`. Entry points (`page.tsx`, `route.ts`)
are thin: parse input → call use case via `container` → map `Result` to UI/HTTP.

## 4. GitHub API Integration

Base: `https://api.github.com`. Header `Accept: application/vnd.github+json`,
`X-GitHub-Api-Version: 2022-11-28`. If `GITHUB_TOKEN` env var is set, add
`Authorization: Bearer <token>` (server-only — never exposed to the browser).

### 4.1 Endpoints & definitions

| Feature | Request | Definition |
|---|---|---|
| Top languages | `GET /search/repositories?q=language:{lang}+stars:>10000&per_page=1` per language → read `total_count` | popularity = number of well-starred (>10k) repos in that language |
| Top repositories | `GET /search/repositories?q=stars:>50000&sort=stars&order=desc&per_page=20` | "top" = most-starred all time |
| Trending | `GET /search/repositories?q=created:>{ISO date}&sort=stars&order=desc&per_page=20` | "trending" = repos created in the last 1/7/30 days, ranked by stars |
| Search — full repo | `GET /repos/{owner}/{repo}` | input matches `owner/repo` |
| Search — user/org | `GET /users/{name}` → if 200, `GET /search/repositories?q=user:{name}&sort=stars&order=desc&per_page=30` | `/users/{name}` exists |
| Search — repo name | `GET /search/repositories?q={term}+in:name&sort=stars&order=desc&per_page=30` | fallback when not a user/org |

Candidate languages (10): `TypeScript, JavaScript, Python, Java, Go, Rust, C++, C#, PHP, Ruby`.

### 4.2 Search auto-detect algorithm (`search.use-case.ts`)

1. Trim input. If empty or contains characters outside `[A-Za-z0-9._/-]` → `InvalidInputError`.
2. If input matches `^[\w.-]+/[\w.-]+$` (one slash) → fetch repo detail.
   404 → `NotFoundError`. Success → `search-result.dto` kind `repo-detail`.
3. Else fetch `/users/{input}`:
   - 200 → kind `owner-repos` (owner profile + their repos).
   - 404 → fall through to step 4.
4. Repo-name search → kind `repo-list`. Empty `items` → caller renders empty state.

### 4.3 Caching & rate limits

- Use `fetch(url, { next: { revalidate: N } })`. Dashboard data `N=1800`, search `N=300`.
- Rate limit: GitHub returns `403`/`429`. If response has header
  `x-ratelimit-remaining: 0`, read `x-ratelimit-reset` (unix seconds) →
  throw/return `RateLimitError(resetAt)`. The API client surfaces this; use cases
  wrap it into `Result` `err(RateLimitError)`.
- All other non-2xx (except 404, handled per-endpoint) → `InternalError`.

## 5. Use Cases (application layer)

Each use case: one `execute(input)` method returning `Promise<Result<OutputDto, AppError>>`.
Constructor-injected `IGithubRepository`. Catches infra errors → wraps in `Result`.

- `GetTopLanguagesUseCase` → `LanguageStatDto[]` (sorted desc, with `percentage` + `rank`).
- `GetTopRepositoriesUseCase` → `RepositoryDto[]`.
- `GetTrendingRepositoriesUseCase(input: { range: 'today'|'week'|'month' })` → `RepositoryDto[]`.
- `SearchUseCase(input: { query: string })` → `SearchResultDto` (discriminated union).

## 6. Presentation & States

- **Dashboard (`app/page.tsx`)** — RSC. Renders, top to bottom: `Header`, `SearchBox`,
  `LanguagesSection`, `TrendingSection`, top `RepositoryList`. Each data section wrapped
  in `<Suspense>` with a skeleton fallback; an async sub-component awaits its use case.
- **Search page (`app/search/page.tsx`)** — RSC reading `searchParams.q`. Runs
  `SearchUseCase`, renders `SearchResults` (switches on result kind).
- **Trending** — `TrendingSection` is a client component: three tabs
  (Today/Week/Month) fetching `/api/trending?range=`; shows spinner on switch.
- **`SearchBox`** — client component; on submit `router.push('/search?q=' + encoded)`.
- **`StateMessage`** — single reusable component with a `variant` prop:
  `loading | error | empty | invalid | rate-limit`. Rate-limit variant shows reset time
  and a "retry later" hint.

### Required states mapping

| State | Where handled |
|---|---|
| Loading | `app/loading.tsx`, `<Suspense>` skeletons, trending tab spinner |
| Error | `app/error.tsx` boundary + inline `StateMessage variant="error"` per section |
| Empty | `StateMessage variant="empty"` when a result list is empty |
| Invalid input | `SearchUseCase` → `InvalidInputError` → `StateMessage variant="invalid"` |
| Rate limit | `RateLimitError` → `StateMessage variant="rate-limit"` with reset time |

## 7. Repository card data (assignment requirement)

`RepositoryCard` must show: repository name, owner (+ avatar), description, stars, forks,
main language, last-updated date, and a link to GitHub.

## 8. Accessibility & Responsive

- Mobile-first Tailwind; grid collapses to single column on small screens.
- Semantic landmarks, `aria-label`s on icon buttons, focus-visible rings,
  tabs use `role="tab"`/`aria-selected`, errors use `role="alert"`.

## 9. Environment

`.env.example`:
```
# Optional — raises GitHub API rate limit from 60/hr to 5000/hr.
GITHUB_TOKEN=
```
The app must work without a token (degraded rate limit).

## 10. Verification

1. `pnpm install` → `pnpm exec tsc --noEmit` → `pnpm lint` → `pnpm build` all pass.
2. `pnpm dev`: dashboard renders all sections; trending tabs switch; search handles
   `facebook/react` (detail), `vercel` (org repos), `react` (repo list), garbage (invalid).
3. Loading skeletons appear on first paint; rate-limit banner renders when limit hit.
4. Responsive check at mobile width.

## 11. Out of scope (note in README "improvements")

Automated tests, pagination/infinite scroll, real trending via star-history,
auth/OAuth, dark-mode toggle persistence.
