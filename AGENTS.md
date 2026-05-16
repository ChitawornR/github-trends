<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — GitHub Trends Dashboard

Project instructions for any agent (or developer) working in this repo.

## What this project is

A responsive **GitHub Trends Dashboard** built on the GitHub REST API. Full feature
spec lives in [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md); live progress is tracked
in [`CHECKLIST.md`](./CHECKLIST.md).

## Workflow rules

- **Implement against `DEVELOPMENT_PLAN.md`.** It is the source of truth for scope,
  folder layout, and API design.
- **Update `CHECKLIST.md` as you go.** Mark an item `[x]` only when it is done *and*
  verified (compiles / lints / works). Never mark partial work complete.
- Do not expand scope beyond the plan. Items deferred on purpose are in the plan's
  "Out of scope" section.

## Stack

- Next.js **16.2.6** (App Router), React **19.2.4**, TypeScript 5 (strict), Tailwind **v4**.
- Charts: **Recharts**. UI: **plain Tailwind** (no shadcn/ui).
- Package manager: **pnpm only** — never use `npm` or `yarn`.
  - Install: `pnpm install` · Add dep: `pnpm add <pkg>` · Scripts: `pnpm dev|build|lint`.

## Next.js 16 gotchas

Before writing `app/` code, consult the bundled docs at `node_modules/next/dist/docs/01-app/`.

- `params` and `searchParams` are **Promises** — always `await` them.
- `cookies()`, `headers()`, `draftMode()` are **async** — always `await` them.
- Caching is **opt-in**: `fetch` is uncached by default; use `{ next: { revalidate: N } }`.
- React 19: use `useActionState` (not `useFormState`).

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

## Commands

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Dev server | `pnpm dev` |
| Type check | `pnpm exec tsc --noEmit` |
| Lint | `pnpm lint` |
| Production build | `pnpm build` |

Run type check + lint before marking any checklist quality gate complete.

## Conventions

- Path alias: `@/*` → repo root (see `tsconfig.json`).
- File naming: `*.entity.ts`, `*.use-case.ts`, `*.dto.ts`, `*.repository.ts`, `*.client.ts`.
- TypeScript strict everywhere; no `any` — use `unknown` + narrow at boundaries.
- The GitHub token (`GITHUB_TOKEN`) is **server-only**. Never reference it in a
  client component or send it to the browser.
