<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ
from your training data. **Do not write any framework-specific code from memory.**
Always consult current docs first (see "Research gate" below).
<!-- END:nextjs-agent-rules -->

# AGENTS.md — GitHub Trends Dashboard

Project instructions for any agent (or developer) working in this repo.

## What this project is

A responsive **GitHub Trends Dashboard** built on the GitHub REST API. Full feature
spec lives in [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md); live progress is tracked
in [`CHECKLIST.md`](./CHECKLIST.md).

---

## Research gate — mandatory before writing any code

**Every agent must pass this gate before touching any file in `src/` or `app/`.**

### Step 1 — Identify what you are about to use

List every library, framework API, or external service the task touches. Common examples:

- Next.js App Router patterns (routing, caching, streaming, params, cookies…)
- React rendering model (SSR, hydration, client components, Suspense…)
- GitHub REST API (endpoints, version headers, auth requirements…)
- Tailwind v4 utilities, Recharts props

### Step 2 — Fetch current docs with context7

For **every item** in Step 1, run:

```
npx ctx7@latest library "<LibraryName>" "<specific question>"
npx ctx7@latest docs <libraryId> "<specific question>"
```

Use the **bundled Next.js docs** as a cross-reference for Next.js-specific questions:
`node_modules/next/dist/docs/01-app/`

Do **not** skip this step because "I already know this API." Training data is frozen;
breaking changes are not.

### Step 3 — Confirm findings before writing code

Write a one-paragraph summary of what the docs say, then proceed. If the docs
contradict your assumption, the docs win.

### Step 4 — Confirm before delegating

If you are about to delegate a task to another agent (sub-agent, tool call, parallel
worker), you **must** complete Steps 1–3 yourself first and include the findings in
the prompt you hand to the other agent. Never let a sub-agent decide what the API
contract is on its own — verify it here, then tell it.

---

## Workflow rules

- **Implement against `DEVELOPMENT_PLAN.md`.** It is the source of truth for scope,
  folder layout, and API design.
- **Update `CHECKLIST.md` as you go.** Mark an item `[x]` only when it is done *and*
  verified (compiles / lints / works). Never mark partial work complete.
- Do not expand scope beyond the plan. Items deferred on purpose are in the plan's
  "Out of scope" section.

---

## Stack

- Next.js **16.2.6** (App Router), React **19.2.4**, TypeScript 5 (strict), Tailwind **v4**.
- Charts: **Recharts**. UI: **plain Tailwind** (no shadcn/ui).
- Package manager: **pnpm only** — never use `npm` or `yarn`.
  - Install: `pnpm install` · Add dep: `pnpm add <pkg>` · Scripts: `pnpm dev|build|lint`.

---

## Known gotchas (lessons from past bugs — read before touching these areas)

### Next.js 16 / React 19

Consult `node_modules/next/dist/docs/01-app/` for any App Router code.

- `params` and `searchParams` are **Promises** — always `await` them.
- `cookies()`, `headers()`, `draftMode()` are **async** — always `await` them.
- Caching is **opt-in**: `fetch` is uncached by default; use `{ next: { revalidate: N } }`.
- React 19: use `useActionState` (not `useFormState`).

### SSR / Hydration — time-sensitive content

**Never compute time-relative strings (`"3 minutes ago"`, `toLocaleDateString()`,
`Date.now()`, `Math.random()`) inside a mapper or component that runs on both server
and client.** The value will differ between SSR and hydration and React will throw a
hydration mismatch error.

Correct pattern:

1. Pass the raw ISO string through the ViewModel (`updatedAt: string`).
2. Format the string inside the render function of the component.
3. Add `suppressHydrationWarning` to the element — this tells React the difference
   is intentional and it should silently use the client value.

```tsx
<span suppressHydrationWarning>
  Updated {formatRelativeDate(repo.updatedAt)}
</span>
```

Verify against: `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.mdx`

### GitHub REST API versioning

Two versions are currently supported:

| Version | Status |
|---|---|
| `2026-03-10` | Current — **requires authentication for all requests** |
| `2022-11-28` | Deprecated March 2028 — allows unauthenticated calls (60 req/hr) |

Before changing the `X-GitHub-Api-Version` header:
1. Look up breaking changes for that version in the GitHub docs.
2. Confirm the `GITHUB_TOKEN` in `.env` is valid — use `2026-03-10` only with a live
   token; a missing or expired token returns `401` immediately.

Validate the token is live before running the dev server:
```
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user
```
Expected: `200`. Any other code → regenerate the token at github.com/settings/tokens
(no scopes needed for public data).

---

## Architecture — Clean Architecture (mandatory)

This repo follows the project `clean-architecture` skill. Four rings, dependencies point
**inward only**:

```
domain  <-  application  <-  infrastructure / presentation  <-  di / app
```

- `src/domain/` — entities, errors, repository *interfaces* (ports). Zero framework imports.
- `src/application/` — use cases, DTOs, `Result<T,E>`, app errors. No Next.js, no React,
  no `infrastructure` imports. One `execute()` method per use case, constructor injection.
- `src/infrastructure/` — implements ports; the only layer allowed to call `fetch`,
  read `process.env`, or touch third-party SDKs.
- `src/presentation/` — React components, view-models, dto→view-model mappers.
- `src/di/container.ts` — composition root; wires everything; reads env vars here.
- `app/` — thin Next.js entry points only. Parse input → call a use case via
  `container` → map the `Result` to UI/HTTP. **No business logic, no `fetch`, no
  `process.env` in `app/`.**

Errors: expected business failures → `Result` `err(...)`; programming bugs → `throw`.
Never leak raw errors, stack traces, or tokens to the client.

---

## Commands

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Dev server | `pnpm dev` |
| Type check | `pnpm exec tsc --noEmit` |
| Lint | `pnpm lint` |
| Production build | `pnpm build` |

Run type check + lint before marking any checklist quality gate complete.

---

## Conventions

- Path alias: `@/*` → repo root (see `tsconfig.json`).
- File naming: `*.entity.ts`, `*.use-case.ts`, `*.dto.ts`, `*.repository.ts`, `*.client.ts`.
- TypeScript strict everywhere; no `any` — use `unknown` + narrow at boundaries.
- The GitHub token (`GITHUB_TOKEN`) is **server-only**. Never reference it in a
  client component or send it to the browser.
