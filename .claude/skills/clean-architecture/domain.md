# Domain Layer

The innermost ring. **Zero external dependencies** — no React, no Prisma, no Next.js, no npm packages except pure utility types if absolutely needed.

## Entities

Entities have identity, enforce business invariants, and emit domain events. Use private constructors with static factory methods to guarantee valid state on creation.

```ts
// src/domain/entities/user.ts
import { Email } from '@domain/value-objects/email'
import { UserId } from '@domain/value-objects/user-id'
import { UserRegisteredEvent } from '@domain/events/user-registered.event'
import { DomainError } from '@domain/errors/domain.error'

export class User {
  private readonly _events: UserRegisteredEvent[] = []

  private constructor(
    public readonly id: UserId,
    public readonly email: Email,
    private _name: string,
    private readonly _createdAt: Date,
  ) {}

  // For new users — emits domain event
  static create(id: UserId, email: Email, name: string): User {
    if (name.trim().length === 0) throw new DomainError('Name cannot be empty')
    const user = new User(id, email, name, new Date())
    user._events.push(new UserRegisteredEvent(id, email))
    return user
  }

  // For loading from persistence — skips event emission
  static reconstitute(id: UserId, email: Email, name: string, createdAt: Date): User {
    return new User(id, email, name, createdAt)
  }

  rename(name: string): void {
    if (name.trim().length === 0) throw new DomainError('Name cannot be empty')
    this._name = name
  }

  get name(): string { return this._name }
  get createdAt(): Date { return this._createdAt }

  pullEvents(): UserRegisteredEvent[] {
    return this._events.splice(0)
  }
}
```

**Rules:**
- No `async` methods
- No DB calls, no HTTP calls
- `static create()` — factory for new entities (emits events, validates invariants)
- `static reconstitute()` — factory for loading from DB (no events, trusts stored data)
- `pullEvents()` drains the event list — call after saving to dispatch events

## Value Objects

Immutable, no identity, validated on construction. Two Value Objects with the same value are equal.

```ts
// src/domain/value-objects/email.ts
import { DomainError } from '@domain/errors/domain.error'

export class Email {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new DomainError(`Invalid email: ${raw}`)
    }
    return new Email(normalized)
  }

  toString(): string { return this.value }
  equals(other: Email): boolean { return this.value === other.value }
}
```

For lightweight Value Objects (IDs, simple wrappers), prefer branded types over full classes:

```ts
// src/domain/value-objects/user-id.ts
declare const __brand: unique symbol
type Brand<T, B> = T & { readonly [__brand]: B }

export type UserId = Brand<string, 'UserId'>

export const UserId = {
  generate: (): UserId => crypto.randomUUID() as UserId,
  from: (raw: string): UserId => raw as UserId,
  toString: (id: UserId): string => id,
}
```

## Domain Events

Plain data objects. Emitted by entities, dispatched after persistence.

```ts
// src/domain/events/user-registered.event.ts
import type { UserId } from '@domain/value-objects/user-id'
import type { Email } from '@domain/value-objects/email'

export class UserRegisteredEvent {
  readonly occurredAt = new Date()

  constructor(
    public readonly userId: UserId,
    public readonly email: Email,
  ) {}
}
```

## Repository Interfaces (Ports)

**Critical:** Repository interfaces live in `domain/`, not `infrastructure/`. Domain defines what it needs; infrastructure delivers it. Never import Prisma or any DB type here.

```ts
// src/domain/repositories/user.repository.ts
import type { User } from '@domain/entities/user'
import type { UserId } from '@domain/value-objects/user-id'
import type { Email } from '@domain/value-objects/email'

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>
  delete(id: UserId): Promise<void>
}
```

Apply interface segregation — split read/write if some use cases only read:

```ts
export interface IUserReader {
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
}

export interface IUserWriter {
  save(user: User): Promise<void>
  delete(id: UserId): Promise<void>
}

export interface IUserRepository extends IUserReader, IUserWriter {}
```

## Domain Errors

```ts
// src/domain/errors/domain.error.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

// src/domain/errors/user-not-found.error.ts
import { DomainError } from './domain.error'

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User not found: ${userId}`)
    this.name = 'UserNotFoundError'
  }
}
```

Domain errors signal **programming errors** or **invariant violations** — they should never be silently swallowed. Use the Result pattern at the application layer for expected business failures.
