# Application Layer

Orchestrates domain logic. Framework-agnostic — no Next.js, no React, no HTTP types, no Prisma. Depends only on `domain/` and its own `application/` code.

## Use Case / Interactor Pattern

One class per use case. All dependencies injected via constructor (never via service locator or global imports).

```ts
// src/application/use-cases/register-user.use-case.ts
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { IEmailService } from '@application/ports/email-service.port'
import type { RegisterUserInputDto } from '@application/dtos/register-user.dto'
import type { Result } from '@application/result'
import { User } from '@domain/entities/user'
import { Email } from '@domain/value-objects/email'
import { UserId } from '@domain/value-objects/user-id'
import { ok, err } from '@application/result'
import { UserAlreadyExistsError } from '@application/errors/user-already-exists.error'

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    input: RegisterUserInputDto,
  ): Promise<Result<{ userId: string }, UserAlreadyExistsError>> {
    const email = Email.create(input.email)  // throws DomainError if invalid
    const existing = await this.userRepository.findByEmail(email)

    if (existing !== null) {
      return err(new UserAlreadyExistsError(input.email))
    }

    const id = UserId.generate()
    const user = User.create(id, email, input.name)
    await this.userRepository.save(user)
    await this.emailService.sendWelcome(email)

    return ok({ userId: UserId.toString(id) })
  }
}
```

**Rules:**
- One public method: `execute(input: InputDto): Promise<Result<OutputDto, AppError>>`
- Never accepts `Request`, `FormData`, `NextRequest`, or React types
- Never imports from `infrastructure/` or `presentation/` or `app/`
- Catches infrastructure exceptions and wraps them — never leaks raw DB errors

## DTOs

Plain objects — no methods, no class instances, no framework types. Serializable by nature.

```ts
// src/application/dtos/register-user.dto.ts
export interface RegisterUserInputDto {
  readonly name: string
  readonly email: string  // raw string — Email VO constructed inside use case
}

export interface RegisterUserOutputDto {
  readonly userId: string
}
```

**Anti-pattern:** Never put `FormData`, `File`, `Request`, `Date` objects, or domain entity instances in a DTO. Parse at the boundary, pass primitives in.

## Port Interfaces (External Services)

Define what the application needs from the outside world. Implementations live in `infrastructure/`.

```ts
// src/application/ports/email-service.port.ts
import type { Email } from '@domain/value-objects/email'

export interface IEmailService {
  sendWelcome(to: Email): Promise<void>
  sendPasswordReset(to: Email, token: string): Promise<void>
}
```

```ts
// src/application/ports/payment-gateway.port.ts
export interface IPaymentGateway {
  charge(amountCents: number, currency: string, token: string): Promise<{ transactionId: string }>
  refund(transactionId: string): Promise<void>
}
```

## Application Errors

Application-level expected failures — not programming errors.

```ts
// src/application/errors/user-already-exists.error.ts
export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User already exists: ${email}`)
    this.name = 'UserAlreadyExistsError'
  }
}

// src/application/errors/internal.error.ts
export class InternalError extends Error {
  constructor(message = 'Internal error') {
    super(message)
    this.name = 'InternalError'
  }
}
```

## Result Type

```ts
// src/application/result.ts
export type Result<T, E extends Error = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export const ok = <T>(value: T): Result<T, never> =>
  ({ ok: true, value })

export const err = <E extends Error>(error: E): Result<never, E> =>
  ({ ok: false, error })
```

Use `ok` for success, `err` for expected business failures. Throw (don't return) for programming errors — those should never be caught at the application layer.
