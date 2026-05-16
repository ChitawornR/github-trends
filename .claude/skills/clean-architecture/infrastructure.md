# Infrastructure Layer

Implements the interfaces (ports) defined in `domain/` and `application/`. The only layer that imports DB clients, ORMs, HTTP clients, and third-party SDKs. Never imported by `domain/` or `application/`.

## Repository Implementations

```ts
// src/infrastructure/repositories/prisma-user.repository.ts
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { User } from '@domain/entities/user'
import type { UserId } from '@domain/value-objects/user-id'
import type { Email } from '@domain/value-objects/email'
import { prisma } from '@infrastructure/database/prisma.client'
import { UserMapper } from '@infrastructure/mappers/user.mapper'

export class PrismaUserRepository implements IUserRepository {
  async findById(id: UserId): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { id: UserId.toString(id) },
    })
    return record ? UserMapper.toDomain(record) : null
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { email: email.toString() },
    })
    return record ? UserMapper.toDomain(record) : null
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user)
    await prisma.user.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    })
  }

  async delete(id: UserId): Promise<void> {
    await prisma.user.delete({ where: { id: UserId.toString(id) } })
  }
}
```

## Infrastructure Mappers

Mappers live in `infrastructure/` because they know about both domain types AND persistence types. They are the only place that translates between the two worlds.

```ts
// src/infrastructure/mappers/user.mapper.ts
import { User } from '@domain/entities/user'
import { Email } from '@domain/value-objects/email'
import { UserId } from '@domain/value-objects/user-id'
import type { User as PrismaUser } from '@prisma/client'

export class UserMapper {
  static toDomain(record: PrismaUser): User {
    return User.reconstitute(
      UserId.from(record.id),
      Email.create(record.email),
      record.name,
      record.createdAt,
    )
  }

  static toPersistence(user: User): Omit<PrismaUser, 'updatedAt'> {
    return {
      id: UserId.toString(user.id),
      email: user.email.toString(),
      name: user.name,
      createdAt: user.createdAt,
    }
  }
}
```

**Rules:**
- Never expose Prisma types to `domain/` or `application/`
- `toDomain()` uses `reconstitute()`, not `create()` — no events emitted when loading from DB
- `toPersistence()` converts to plain persistence record types

## External Service Implementations

```ts
// src/infrastructure/services/sendgrid-email.service.ts
import type { IEmailService } from '@application/ports/email-service.port'
import type { Email } from '@domain/value-objects/email'
import sgMail from '@sendgrid/mail'

export class SendgridEmailService implements IEmailService {
  constructor(private readonly apiKey: string) {
    sgMail.setApiKey(apiKey)
  }

  async sendWelcome(to: Email): Promise<void> {
    await sgMail.send({
      to: to.toString(),
      from: 'noreply@example.com',
      subject: 'Welcome!',
      text: 'Welcome to our platform.',
    })
  }

  async sendPasswordReset(to: Email, token: string): Promise<void> {
    await sgMail.send({
      to: to.toString(),
      from: 'noreply@example.com',
      subject: 'Reset your password',
      text: `Reset token: ${token}`,
    })
  }
}
```

## Database Client

```ts
// src/infrastructure/database/prisma.client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

The global singleton pattern prevents connection pool exhaustion during Next.js hot reloads in development.
