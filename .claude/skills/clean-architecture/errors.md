# Error Handling

## Result Pattern

Use the Result pattern for **expected business failures**. Throw for **programming errors** (invariant violations, illegal arguments from code bugs).

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

## Error Hierarchy

```
Error
  DomainError               ← programming/invariant errors from domain
    UserNotFoundError
    InvalidEmailError
  UserAlreadyExistsError    ← application-level business failures
  InternalError             ← infrastructure failures wrapped at application boundary
```

```ts
// src/domain/errors/domain.error.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

// src/application/errors/user-already-exists.error.ts
export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User already exists: ${email}`)
    this.name = 'UserAlreadyExistsError'
  }
}

// src/application/errors/internal.error.ts
export class InternalError extends Error {
  constructor(message = 'An unexpected error occurred') {
    super(message)
    this.name = 'InternalError'
  }
}
```

## Error Flow Through Layers

```
Domain throws DomainError (invariant violated — programming bug)
  ↓
Application catches infrastructure exceptions, wraps as Result<T, AppError>
Application returns err(new UserAlreadyExistsError(...)) for expected business failures
  ↓
Presentation checks result.ok, maps to HTTP status or UI error state
  ↓
Never expose DB errors, stack traces, or internal paths to the client
```

## Application Layer — Wrapping Infrastructure Errors

```ts
// src/application/use-cases/get-user.use-case.ts
async execute(input: GetUserInputDto): Promise<Result<UserDto, UserNotFoundError | InternalError>> {
  try {
    const user = await this.userRepository.findById(UserId.from(input.userId))

    if (!user) {
      return err(new UserNotFoundError(input.userId))
    }

    return ok(UserMapper.toDto(user))
  } catch (cause) {
    // Infrastructure error (DB down, timeout, etc.) — log and wrap
    console.error('[GetUserUseCase] Repository failure', cause)
    return err(new InternalError())
  }
}
```

## Presentation Layer — Mapping to HTTP

```ts
// app/api/users/[id]/route.ts
const result = await container.getGetUserUseCase().execute({ userId: id })

if (!result.ok) {
  if (result.error.name === 'UserNotFoundError') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  // InternalError or unknown — don't expose details
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
}

return NextResponse.json(result.value)
```

## Presentation Layer — Mapping to Server Action State

```ts
const result = await useCase.execute(dto)

if (!result.ok) {
  return { errors: { _form: [result.error.message] } }
}

return { success: true }
```

## When to Throw vs Return Result

| Scenario | Approach |
|---|---|
| Email format invalid | `DomainError` thrown by Value Object (programming error if raw input reaches domain unchecked) |
| User not found | `return err(new UserNotFoundError(...))` |
| Email already taken | `return err(new UserAlreadyExistsError(...))` |
| DB connection failed | Caught in use case, returned as `err(new InternalError())` |
| Null pointer / assertion failed | Throw — these are bugs, not flow control |

## What Never to Expose to Clients

```ts
// ❌ NEVER — exposes internal paths and DB schema
return NextResponse.json({
  error: e.message,       // "Cannot read property 'id' of null"
  stack: e.stack,         // full stack trace
  query: e.meta?.query,   // Prisma query that failed
})

// ✅ Safe
return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
```

Log the full error server-side. Return only a sanitized message to the client.
