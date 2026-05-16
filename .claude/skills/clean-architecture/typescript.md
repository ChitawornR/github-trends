# TypeScript Standards

## tsconfig.json Baseline

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "incremental": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"],
      "@di/*": ["src/di/*"]
    }
  }
}
```

`noUncheckedIndexedAccess` is critical — it types `array[0]` as `T | undefined`, forcing you to handle the missing-element case instead of assuming presence.

## No `any` — Use `unknown` + Zod at Boundaries

```ts
// ❌ WRONG
function processWebhook(payload: any) {
  return payload.userId  // no type safety
}

// ✅ RIGHT — validate at boundary, use typed result inside
const WebhookSchema = z.object({
  userId: z.string().uuid(),
  event: z.enum(['created', 'updated', 'deleted']),
})

function processWebhook(raw: unknown) {
  const parsed = WebhookSchema.safeParse(raw)
  if (!parsed.success) throw new Error('Invalid webhook payload')
  return parsed.data.userId  // fully typed
}
```

Always parse with Zod (or equivalent) at:
- Route handler `request.json()`
- Server Action `formData.get()`
- External API responses
- Environment variables used at runtime

## Branded Types for Value Objects

When a full Value Object class is overkill, use branded types to prevent mixing IDs of different entities:

```ts
// src/domain/value-objects/ids.ts
declare const __brand: unique symbol
type Brand<T, B> = T & { readonly [__brand]: B }

export type UserId = Brand<string, 'UserId'>
export type OrderId = Brand<string, 'OrderId'>
export type ProductId = Brand<string, 'ProductId'>

export const UserId = {
  generate: (): UserId => crypto.randomUUID() as UserId,
  from: (raw: string): UserId => raw as UserId,
  toString: (id: UserId): string => id,
}
```

```ts
// Now this is a compile error — can't mix IDs
function getOrder(id: OrderId): Promise<Order> { ... }
const userId = UserId.generate()
getOrder(userId)  // ← TypeScript error: UserId is not assignable to OrderId
```

## Interface Segregation

Split interfaces by consumer need. Don't build one fat interface when use cases only need part of it.

```ts
// ✅ Segregated — read-only use cases depend only on IUserReader
export interface IUserReader {
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
}

export interface IUserWriter {
  save(user: User): Promise<void>
  delete(id: UserId): Promise<void>
}

export interface IUserRepository extends IUserReader, IUserWriter {}

// GetUserUseCase only needs to read
export class GetUserUseCase {
  constructor(private readonly repo: IUserReader) {}
}
```

## Strict Null Handling

```ts
// ❌ Assumes array[0] exists
const first = items[0].name  // runtime error if items is empty

// ✅ noUncheckedIndexedAccess forces this
const first = items[0]
if (first === undefined) return null
const name = first.name  // safe

// ❌ Asserts non-null without checking
const user = await repo.findById(id)
return user!.name  // runtime error if null

// ✅ Check first
const user = await repo.findById(id)
if (!user) return err(new UserNotFoundError(id))
return ok(user.name)
```

## Avoid Type Assertions

```ts
// ❌ Bypasses type safety
const email = formData.get('email') as string

// ✅ Parse and validate
const raw = formData.get('email')
if (typeof raw !== 'string') return { errors: { email: ['Required'] } }
```

The only acceptable `as` casts are branded type construction (e.g., `raw as UserId`) where you control the invariant being asserted.

## Readonly by Default

Mark DTOs and Value Objects as deeply readonly:

```ts
export interface RegisterUserInputDto {
  readonly name: string
  readonly email: string
}

// For complex nested readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}
```
