---
name: clean-architecture
description: Clean Architecture patterns for this Next.js 16 + TypeScript 5 project — layer structure, dependency rules, domain entities, use cases, DI, error handling, and testing strategy
user-invocable: true
---

# Clean Architecture

Apply these rules when designing, implementing, or reviewing any backend or fullstack code in this project.

## Layer Structure & Folder Layout

See [layers.md](./layers.md) for:
- The four-ring model (Domain → Application → Infrastructure → Presentation)
- Canonical folder structure under `src/` and how `app/` fits in
- What belongs in each layer and what is forbidden

## Dependency Rule

See [dependency-rule.md](./dependency-rule.md) for:
- The inward-only dependency constraint
- tsconfig path aliases to enforce boundaries
- ESLint import boundary rules
- Barrel file guidance

## Domain Layer

See [domain.md](./domain.md) for:
- Entities with private constructors and static factories
- Value Objects (immutable, validated on construction)
- Domain Events emitted from entities
- Repository interfaces (ports) defined in domain, not infrastructure

## Application Layer

See [application.md](./application.md) for:
- Use Case / Interactor pattern (one class per use case)
- DTOs — input/output shapes, no framework types
- Port interfaces for external services
- Use cases must be framework-agnostic

## Infrastructure Layer

See [infrastructure.md](./infrastructure.md) for:
- Repository implementations (Prisma, etc.)
- Infrastructure mappers (domain ↔ persistence)
- External service implementations
- DB client setup

## Presentation & Next.js Integration

See [presentation.md](./presentation.md) for:
- Where `page.tsx`, `layout.tsx`, `route.ts`, Server Actions fit
- Server Components calling use cases via DI container
- Route handlers as thin entry points
- Client Components — UI only, no use case imports
- Next.js 16 async API requirements (`await params`, `await cookies()`)

## Dependency Injection

See [di.md](./di.md) for:
- Composition root pattern with factory functions
- No decorators, no Inversify, no reflect-metadata
- Singleton repositories vs per-request use cases
- Swapping the container for tests

## Error Handling

See [errors.md](./errors.md) for:
- Result pattern (`ok` / `err`) vs exceptions
- Error hierarchy (DomainError → ApplicationError)
- How errors flow through layers without leaking infrastructure details
- When to throw vs return Result

## TypeScript Standards

See [typescript.md](./typescript.md) for:
- Strict tsconfig settings (`noUncheckedIndexedAccess`, etc.)
- Avoiding `any` — use `unknown` + Zod at boundaries
- Branded types for Value Objects (lightweight alternative)
- Interface segregation for repositories

## Testing Strategy

See [testing.md](./testing.md) for:
- Domain tests — pure unit, no mocks
- Application tests — in-memory fakes (not mocks)
- Infrastructure tests — integration with real DB
- Testing pyramid and what to prioritize
