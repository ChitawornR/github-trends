# Dependency Injection

No decorators, no `reflect-metadata`, no Inversify. Use a simple **composition root** with factory functions — compatible with TypeScript strict mode and Next.js.

## The DI Container (Composition Root)

```ts
// src/di/container.ts
import { PrismaUserRepository } from '@infrastructure/repositories/prisma-user.repository'
import { SendgridEmailService } from '@infrastructure/services/sendgrid-email.service'
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case'
import { GetUserUseCase } from '@application/use-cases/get-user.use-case'

// Singletons — expensive to create, safe to share across requests
const userRepository = new PrismaUserRepository()
const emailService = new SendgridEmailService(process.env.SENDGRID_API_KEY!)

// Factory functions — create a fresh use case per call
// Use cases are stateless, so per-request instantiation is safe and preferred
export const container = {
  getRegisterUserUseCase: () =>
    new RegisterUserUseCase(userRepository, emailService),

  getGetUserUseCase: () =>
    new GetUserUseCase(userRepository),
} as const
```

## Why Factory Functions, Not Singleton Use Cases

- Use cases are lightweight and stateless — creating them per request avoids accidental shared mutable state between concurrent requests.
- Repositories and DB clients are expensive (connection pools) — keep those as singletons.
- Factory functions make the dependency graph explicit and easy to read.

## Usage in Entry Points

```ts
// app/api/users/route.ts
import { container } from '@di/container'

export async function POST(request: NextRequest) {
  const useCase = container.getRegisterUserUseCase()
  const result = await useCase.execute(dto)
  // ...
}
```

## Swapping the Container for Tests

```ts
// tests/support/test-container.ts
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user.repository'
import { FakeEmailService } from '@tests/fakes/fake-email.service'
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case'

export const testContainer = {
  getRegisterUserUseCase: () =>
    new RegisterUserUseCase(new InMemoryUserRepository(), new FakeEmailService()),
}
```

Tests import `testContainer` instead of `container`. No mocking framework needed.

## Constructor Injection — The Only Pattern

Dependencies are always declared in the constructor. Never use property injection or service locator.

```ts
// ✅ Constructor injection — explicit, testable
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}
}

// ❌ Service locator — hides dependencies, untestable
export class RegisterUserUseCase {
  execute(input: Dto) {
    const repo = ServiceLocator.get('UserRepository')  // WRONG
  }
}

// ❌ Global import — impossible to swap in tests
import { prisma } from '@infrastructure/database/prisma.client'  // WRONG in use case
```

## Environment Variables

Access environment variables only in `infrastructure/` or `di/`. Never read `process.env` in `domain/` or `application/` — pass what's needed via constructor injection.

```ts
// ✅ Environment variable access in composition root
const emailService = new SendgridEmailService(process.env.SENDGRID_API_KEY!)

// ❌ Environment variable access in use case
export class RegisterUserUseCase {
  async execute() {
    const key = process.env.SENDGRID_API_KEY  // WRONG
  }
}
```
