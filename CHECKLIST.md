# Implementation Checklist

> Agents update this file as work completes. Mark `[x]` when an item is **done and verified**.
> Spec: [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md).

## 0. Project meta

- [x] `DEVELOPMENT_PLAN.md` written
- [x] `CHECKLIST.md` written
- [x] `AGENTS.md` rewritten for this project
- [x] `.env.example` created
- [x] `recharts` added via pnpm

## 1. Domain layer (`src/domain`)

- [x] `errors/domain.error.ts` — `DomainError` base
- [x] `entities/owner.entity.ts` — `GithubOwner`
- [x] `entities/repository.entity.ts` — `GithubRepository`
- [x] `entities/language-stat.entity.ts` — `LanguageStat`
- [x] `repositories/github.repository.ts` — `IGithubRepository` port

## 2. Application layer (`src/application`)

- [x] `result.ts` — `Result<T,E>`, `ok`, `err`
- [x] `errors/` — `RateLimitError`, `NotFoundError`, `InvalidInputError`, `InternalError`
- [x] `dtos/` — repository, owner, language-stat, search-result DTOs
- [x] `use-cases/get-top-languages.use-case.ts`
- [x] `use-cases/get-top-repositories.use-case.ts`
- [x] `use-cases/get-trending-repositories.use-case.ts`
- [x] `use-cases/search.use-case.ts` (auto-detect algorithm)

## 3. Infrastructure layer (`src/infrastructure/github`)

- [x] `github.config.ts` — base URL, language list, constants
- [x] `github.types.ts` — raw API response types
- [x] `github-api.client.ts` — fetch wrapper: auth, caching, rate-limit detection
- [x] `github.mapper.ts` — raw JSON → domain entities
- [x] `github.repository.impl.ts` — `IGithubRepository` implementation

## 4. Dependency injection (`src/di`)

- [x] `container.ts` — composition root, reads `GITHUB_TOKEN`

## 5. Entry points (`app/`)

- [x] `app/api/trending/route.ts` — trending tab handler
- [x] `app/page.tsx` — dashboard (boilerplate removed)
- [x] `app/layout.tsx` — metadata updated
- [x] `app/loading.tsx` — route skeleton
- [x] `app/error.tsx` — client error boundary
- [x] `app/search/page.tsx` — search results page

## 6. Presentation layer (`src/presentation`)

- [x] `view-models/` + `mappers/` — dto → view-model
- [x] `components/layout/` — Header, Container, Section
- [x] `components/common/` — `StateMessage` (5 variants), Skeleton, Spinner, StatBadge
- [x] `components/repository/` — RepositoryCard, RepositoryList, RepositoryDetail
- [x] `components/languages/` — LanguagesSection, LanguageChart (Recharts), LanguageBar
- [x] `components/trending/` — TrendingSection (tabs)
- [x] `components/search/` — SearchBox, SearchResults

## 7. Required states

- [x] Loading — route + Suspense skeletons + trending spinner
- [x] Error — `error.tsx` + inline error messages
- [x] Empty — empty-state rendering
- [x] Invalid input — search invalid-input handling
- [x] Rate limit — banner with reset time

## 8. Quality gates

- [x] `pnpm exec tsc --noEmit` passes
- [x] `pnpm lint` passes (0 errors; 192 warnings are all in bundled skill scripts)
- [x] `pnpm build` passes
- [x] Clean Architecture boundaries reviewed (reviewer agent) — no violations found
- [x] Accessibility & responsive reviewed

## 9. Docs

- [x] `README.md` — product thinking, setup/run, endpoints + rationale, improvements
