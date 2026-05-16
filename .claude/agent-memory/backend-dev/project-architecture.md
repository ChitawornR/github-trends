---
name: project-architecture
description: Clean Architecture layer structure, path aliases, and key conventions for the GitHub Trends Dashboard
metadata:
  type: project
---

The GitHub Trends Dashboard (Next.js 16.2.6 / React 19 / TypeScript 5 strict) uses Clean Architecture with four rings. All `src/` code lives under the repo root; the path alias `@/*` maps to the repo root (NOT `src/`), so imports are `@/src/domain/...`.

**Layer layout:**
- `src/domain/` — entities (GithubRepository, GithubOwner, LanguageStat), DomainError, IGithubRepository port interface. Zero external imports.
- `src/application/` — Result<T,E>/ok/err, AppError union (RateLimitError/NotFoundError/InvalidInputError/InternalError), DTOs (repository/owner/language-stat/search-result), four use cases. No Next.js/React/infra imports.
- `src/infrastructure/github/` — GithubApiClient (fetch wrapper), GithubMapper, GithubRepositoryImpl, github.config.ts, github.types.ts (raw API shapes).
- `src/di/container.ts` — composition root; ONLY place that reads `process.env.GITHUB_TOKEN`.
- `app/` — thin Next.js entry points only.

**Why:** Dependency rule is enforced strictly — use cases catch infra exceptions and wrap into Result errors. RateLimitError is re-thrown by the client/repo impl and caught at the use-case boundary.

**How to apply:** Any new feature follows the same ring structure. No `process.env` in domain or application. No Next.js types in use cases.
