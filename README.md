# GitHub Trends Dashboard

A responsive web app that surfaces what's popular and trending on GitHub — top
programming languages, the most-starred repositories, recently trending projects, and
a flexible repository search — built on the [GitHub REST API](https://docs.github.com/en/rest).

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and
**Recharts**, following a **Clean Architecture** layering.

---

## Quick start

Prerequisites: **Node.js 20.9+** and **pnpm**.

```bash
pnpm install

# Optional but recommended — see "GitHub API rate limits" below
cp .env.example .env
# then edit .env and add a GITHUB_TOKEN

pnpm dev          # http://localhost:3000
```

Other scripts:

```bash
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # ESLint
pnpm exec tsc --noEmit   # type check
```

### GitHub API rate limits

The app works **without authentication**, but the GitHub API then allows only
**60 requests/hour** (and 10 search requests/minute). Because the dashboard issues one
search call per candidate language plus several more, an unauthenticated session can
exhaust the quota quickly — when that happens the UI shows a dedicated **rate-limit
state** with the reset time.

To get the full **5,000 requests/hour**, create a
[GitHub personal access token](https://github.com/settings/tokens) (no scopes needed —
a classic token with no scopes or a fine-grained token with public read access is
enough) and put it in `.env`:

```
GITHUB_TOKEN=ghp_your_token_here
```

The token is read **only on the server** (in `src/di/container.ts`) and is never sent
to the browser.

---

## Product thinking

### Who this dashboard is for

Developers, tech leads, and engineering managers who want a **quick pulse on the
open-source ecosystem** — what languages dominate, which projects are exploding in
popularity right now, and a fast way to look up any user, organisation, or repository.
It is a read-only "situational awareness" tool, not a project-management product.

### How the three concepts are defined

The assignment leaves these definitions to the candidate. The choices below favour
data that is **directly and cheaply obtainable from the GitHub Search API** while still
being meaningful.

| Concept | Definition used | Rationale |
|---|---|---|
| **Top programming language** | For a fixed set of 10 mainstream languages, the **number of repositories written in that language with more than 10,000 stars**. Shown as a ranked list + percentage share + pie chart. | GitHub has no "language popularity" endpoint. Counting *well-starred* repos (rather than all repos) filters out abandoned/toy projects and approximates "languages people build serious things in". The 10k threshold keeps the signal high and the numbers comparable. |
| **Top repository** | The **most-starred repositories of all time** (`stars:>50000`, sorted by stars). | Stars are GitHub's clearest, most stable popularity signal. "All-time most starred" is unambiguous and needs no time-windowing. |
| **Trending repository** | Repositories **created within the last 1 / 7 / 30 days**, sorted by stars descending. | GitHub's API exposes no official "trending" feed. A repository that gained many stars *shortly after being created* is, by definition, getting rapid attention — a solid proxy for "trending" that the Search API can express directly via the `created:` qualifier. |

### Which API endpoints are used, and why

Base URL `https://api.github.com`, version header `2022-11-28`.

| Feature | Endpoint | Why this endpoint |
|---|---|---|
| Top languages | `GET /search/repositories?q=language:{lang}+stars:>10000&per_page=1` — one call per language, reading only `total_count` | The Search API returns an aggregate `total_count` for any query. Requesting `per_page=1` makes each call cheap while still yielding the count we rank on. |
| Top repositories | `GET /search/repositories?q=stars:>50000&sort=stars&order=desc` | The Search API is the only endpoint that can rank repositories globally by stars. The `stars:>50000` floor keeps the result set small and fast. |
| Trending | `GET /search/repositories?q=created:>{date}&sort=stars&order=desc` | The `created:` qualifier is the only way to date-filter repositories server-side; combined with `sort=stars` it directly expresses our "trending" definition. |
| Search — full repo (`owner/repo`) | `GET /repos/{owner}/{repo}` | The canonical, exact lookup for a single repository — richer and cheaper than a search query. |
| Search — user / organisation | `GET /users/{name}`, then `GET /search/repositories?q=user:{name}&sort=stars` | `/users/{name}` resolves both users and organisations and tells us which it is. `q=user:` then lists their repositories ranked by stars in one call. |
| Search — repository name | `GET /search/repositories?q={term}+in:name&sort=stars` | Fallback when the input is not a user/org: `in:name` matches the term against repository names, ranked by stars so the best-known matches surface first. |

**Why the Search API does most of the work:** it is the single GitHub endpoint that can
*rank* and *aggregate* across all of GitHub. The dedicated `/repos/{owner}/{repo}` and
`/users/{name}` endpoints are used only for exact lookups, where they are faster and
return more detail than a search query.

**Search input auto-detection:** the search box accepts one free-text field and infers
intent — `owner/repo` (one slash) → repository detail; otherwise try user/org → list
their repos; if no such user, fall back to a repository-name search.

---

## Architecture

The codebase follows **Clean Architecture** — dependencies point inward only:

```
src/
  domain/          Entities, errors, repository interface (ports). Zero framework code.
  application/     Use cases, DTOs, Result type, app errors. Framework-agnostic.
  infrastructure/  GitHub API client + repository implementation. The only layer that
                   does fetch / reads env vars.
  presentation/    React components, view-models, dto -> view-model mappers.
  di/              Composition root — wires everything; reads GITHUB_TOKEN here.
app/               Next.js entry points (pages, route handler) — thin adapters only.
```

- **Use cases** return a `Result<T, E>` — expected failures (not found, invalid input,
  rate limit) are values, not thrown exceptions.
- **Entry points** (`app/page.tsx`, `app/search/page.tsx`, `app/api/trending/route.ts`)
  parse input, call a use case via the DI container, and map the result to UI or HTTP.
- The GitHub token and all `fetch` calls stay in the infrastructure layer.

Data fetching uses Next.js cache revalidation (dashboard data 30 min, search 5 min) to
stay well within the API rate limit.

### Handled states

Every data view handles: **loading** (route + Suspense skeletons), **error** (error
boundary + inline messages), **empty** (no results), **invalid input** (malformed
search query), and **API rate limit** (banner with reset time).

---

## What I would improve with more time

- **Real trending signal** — current "trending" uses *creation date*. A better metric
  is *stars gained within the window* (star velocity), which would require storing
  historical snapshots or using a star-history service.
- **Automated tests** — unit tests for the search auto-detect logic, the mappers, and
  the rate-limit detection; component tests for the state rendering.
- **Pagination / infinite scroll** for search results and the trending lists.
- **Smarter language ranking** — weight by total stars or recent commit activity
  instead of a simple repo count, and let the user pick the language set.
- **Caching layer** — a short-lived server cache (or GitHub conditional requests with
  `ETag`) to further reduce API usage and improve resilience to rate limits.
- **Richer repository detail** — README preview, contributor list, language breakdown,
  and a star-history chart.
- **Dark mode** and persisted user preferences.

---

## Project documents

- [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) — the implementation spec.
- [`CHECKLIST.md`](./CHECKLIST.md) — implementation progress.
- [`AGENTS.md`](./AGENTS.md) — contributor / agent guidelines.
