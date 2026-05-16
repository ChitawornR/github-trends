# Testing Strategy

## Testing Pyramid

```
E2E (Playwright)              few, slow — test full user flows end-to-end
Integration (Vitest)          infrastructure + real DB — test repositories
Application (Vitest)          use cases + in-memory fakes — fast, many
Domain (Vitest)               entities + value objects — fastest, zero I/O
```

## Domain Tests — Pure Unit, No Mocks Needed

Domain code has no dependencies to mock. Test entities, value objects, and domain logic directly.

```ts
// src/domain/entities/user.test.ts
import { describe, it, expect } from 'vitest'
import { User } from '@domain/entities/user'
import { Email } from '@domain/value-objects/email'
import { UserId } from '@domain/value-objects/user-id'
import { UserRegisteredEvent } from '@domain/events/user-registered.event'
import { DomainError } from '@domain/errors/domain.error'

describe('User', () => {
  it('emits UserRegisteredEvent on creation', () => {
    const user = User.create(UserId.generate(), Email.create('a@b.com'), 'Alice')
    const events = user.pullEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toBeInstanceOf(UserRegisteredEvent)
  })

  it('does not emit event when reconstituted from DB', () => {
    const user = User.reconstitute(
      UserId.from('some-id'), Email.create('a@b.com'), 'Alice', new Date()
    )
    expect(user.pullEvents()).toHaveLength(0)
  })

  it('throws DomainError when renamed to empty string', () => {
    const user = User.create(UserId.generate(), Email.create('a@b.com'), 'Alice')
    expect(() => user.rename('')).toThrow(DomainError)
  })
})

describe('Email value object', () => {
  it('normalizes to lowercase', () => {
    const email = Email.create('Alice@EXAMPLE.COM')
    expect(email.toString()).toBe('alice@example.com')
  })

  it('throws DomainError for invalid format', () => {
    expect(() => Email.create('not-an-email')).toThrow(DomainError)
  })
})
```

## Application Tests — In-Memory Fakes

Use **fakes** (real implementations backed by in-memory storage), not mocks. Fakes are more reliable, shareable across tests, and reveal interface design issues early.

### Writing a Fake Repository

```ts
// tests/fakes/in-memory-user.repository.ts
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { User } from '@domain/entities/user'
import type { UserId } from '@domain/value-objects/user-id'
import type { Email } from '@domain/value-objects/email'

export class InMemoryUserRepository implements IUserRepository {
  private store = new Map<string, User>()

  async findById(id: UserId): Promise<User | null> {
    return this.store.get(UserId.toString(id)) ?? null
  }

  async findByEmail(email: Email): Promise<User | null> {
    return [...this.store.values()].find(
      u => u.email.toString() === email.toString()
    ) ?? null
  }

  async save(user: User): Promise<void> {
    this.store.set(UserId.toString(user.id), user)
  }

  async delete(id: UserId): Promise<void> {
    this.store.delete(UserId.toString(id))
  }

  // Test helpers
  all(): User[] { return [...this.store.values()] }
  clear(): void { this.store.clear() }
  size(): number { return this.store.size }
}
```

### Writing a Fake Service

```ts
// tests/fakes/fake-email.service.ts
import type { IEmailService } from '@application/ports/email-service.port'
import type { Email } from '@domain/value-objects/email'

export class FakeEmailService implements IEmailService {
  readonly sentEmails: Array<{ to: string; type: string }> = []

  async sendWelcome(to: Email): Promise<void> {
    this.sentEmails.push({ to: to.toString(), type: 'welcome' })
  }

  async sendPasswordReset(to: Email, token: string): Promise<void> {
    this.sentEmails.push({ to: to.toString(), type: 'password-reset' })
  }
}
```

### Use Case Tests

```ts
// src/application/use-cases/register-user.use-case.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case'
import { UserAlreadyExistsError } from '@application/errors/user-already-exists.error'
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user.repository'
import { FakeEmailService } from '@tests/fakes/fake-email.service'

describe('RegisterUserUseCase', () => {
  let repo: InMemoryUserRepository
  let emailService: FakeEmailService
  let useCase: RegisterUserUseCase

  beforeEach(() => {
    repo = new InMemoryUserRepository()
    emailService = new FakeEmailService()
    useCase = new RegisterUserUseCase(repo, emailService)
  })

  it('creates a user and sends welcome email', async () => {
    const result = await useCase.execute({ name: 'Alice', email: 'alice@example.com' })

    expect(result.ok).toBe(true)
    expect(repo.size()).toBe(1)
    expect(emailService.sentEmails).toHaveLength(1)
    expect(emailService.sentEmails[0]?.type).toBe('welcome')
  })

  it('returns UserAlreadyExistsError for duplicate email', async () => {
    await useCase.execute({ name: 'Alice', email: 'alice@example.com' })
    const result = await useCase.execute({ name: 'Alice2', email: 'alice@example.com' })

    expect(result.ok).toBe(false)
    expect(result.ok === false && result.error).toBeInstanceOf(UserAlreadyExistsError)
  })
})
```

## Infrastructure Tests — Integration with Real DB

```ts
// tests/integration/prisma-user.repository.test.ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { PrismaUserRepository } from '@infrastructure/repositories/prisma-user.repository'
import { prisma } from '@infrastructure/database/prisma.client'
import { User } from '@domain/entities/user'
import { Email } from '@domain/value-objects/email'
import { UserId } from '@domain/value-objects/user-id'

describe('PrismaUserRepository', () => {
  const repo = new PrismaUserRepository()

  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('saves and retrieves a user by email', async () => {
    const user = User.create(UserId.generate(), Email.create('a@b.com'), 'Alice')
    await repo.save(user)

    const found = await repo.findByEmail(Email.create('a@b.com'))

    expect(found).not.toBeNull()
    expect(found?.name).toBe('Alice')
  })
})
```

Run integration tests against a real test database (Docker Postgres, or SQLite if using Prisma). Never mock the database in integration tests.

## What Not to Test

- Don't test framework behavior (Next.js routing, React rendering)
- Don't write tests for `app/` entry points — they're thin adapters with no logic
- Don't mock what you can fake — fakes reveal design problems, mocks hide them
