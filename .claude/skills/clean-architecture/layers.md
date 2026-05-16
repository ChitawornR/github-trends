# Layer Structure & Folder Layout

## The Four-Ring Model

Dependencies flow **inward only**. Outer layers know about inner layers; inner layers never know about outer layers.

```
Domain (innermost — zero external dependencies)
  Application (depends on Domain only)
    Infrastructure (depends on Domain + Application)
      Presentation (depends on Application + Domain)
        app/ (Next.js entry points — depends on Presentation + Di + Application)
```

## Canonical Folder Structure

```
src/
  domain/
    entities/          # Pure TS classes — no framework imports ever
    value-objects/     # Immutable, validated on construction
    events/            # Domain events emitted by entities
    errors/            # DomainError subclasses
    repositories/      # Repository INTERFACES (ports) — not implementations

  application/
    use-cases/         # One file per use case
    dtos/              # Input/output plain objects (no class instances)
    ports/             # External service interfaces (email, payment, etc.)
    errors/            # Application-level errors
    result.ts          # Result<T, E> type

  infrastructure/
    repositories/      # Concrete repository implementations
    services/          # External service implementations (email, payment)
    mappers/           # Translate domain ↔ persistence records
    database/          # DB clients and connection setup

  presentation/
    controllers/       # Thin orchestrators calling use cases
    mappers/           # Domain/DTO → view model
    view-models/       # UI-shaped data types
    components/        # Shared UI components (Server + Client)

  di/
    container.ts       # Composition root — wires everything together
    factories/         # Per-domain factory helpers if needed

app/                   # Next.js App Router — entry points ONLY
  (route-groups)/
    page.tsx           # Calls DI container, renders RSC
    layout.tsx         # Shell UI, DI init if needed
  api/
    **/route.ts        # Parse request → call use case → return Response
  actions/
    *.actions.ts       # Parse FormData → call use case → return typed result
```

## What Each Layer Is Allowed to Do

| Layer | Can import from | Cannot import from |
|---|---|---|
| `domain/` | `domain/` only | Everything else |
| `application/` | `domain/`, `application/` | `infrastructure/`, `presentation/`, `app/`, Next.js |
| `infrastructure/` | `domain/`, `application/`, `infrastructure/` | `presentation/`, `app/` |
| `presentation/` | `domain/`, `application/`, `presentation/` | `infrastructure/`, `app/` |
| `di/` | All `src/` layers | `app/` |
| `app/` | `di/`, `presentation/`, `application/`, `domain/` | May not be imported BY `src/` |

## What MUST NOT Be in `app/`

- Business logic of any kind
- Database queries
- Validation schemas (use these in the action/handler, but define them in `application/` or `presentation/`)
- Direct repository calls

`app/` files are thin adapters: parse the Next.js-specific input (Request, FormData, params), call a use case via the DI container, and serialize the output.
