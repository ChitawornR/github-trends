# Presentation Layer & Next.js Integration

The outermost layer before Next.js entry points. Handles HTTP/UI concerns: parsing requests, calling use cases, mapping results to view models or HTTP responses.

## Where Next.js Constructs Fit

| Next.js construct | Belongs in | Role |
|---|---|---|
| `app/**/page.tsx` | `app/` entry point | Calls use case via DI container; renders RSC |
| `app/**/layout.tsx` | `app/` entry point | Shell UI; DI init if needed |
| `app/api/**/route.ts` | `app/` entry point | Parse Request → call use case → return Response |
| `app/actions/*.ts` | `app/` entry point | Parse FormData → call use case → return typed result |
| `src/presentation/controllers/` | Presentation | Thin orchestrators (optional; use directly in app/ for simple cases) |
| `src/presentation/components/` | Presentation | Server + Client Components; receive view models as props |
| `src/presentation/view-models/` | Presentation | UI-shaped data types |

## Next.js 16 Breaking Changes — Read Before Writing Any App/ Code

- `params` and `searchParams` are **Promises** — always `await` them
- `cookies()`, `headers()`, `draftMode()` are **async** — always `await` them
- `useActionState` (React 19) replaces `useFormState`
- `'use cache'` directive replaces implicit caching — caching is opt-in
- Minimum Node.js 20.9+

## Server Actions — Thin Entry Points

Server Actions parse Next.js-specific input and call use cases. Business logic stays in the use case.

```ts
// app/actions/auth.actions.ts
'use server'

import { z } from 'zod'
import { container } from '@di/container'
import type { FormState } from '@application/types/form-state'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

export async function registerAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const result = await container.getRegisterUserUseCase().execute(parsed.data)

  if (!result.ok) {
    return { errors: { _form: [result.error.message] } }
  }

  return { success: true, data: result.value }
}
```

## Route Handlers — Thin Entry Points

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { container } from '@di/container'

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null)
  const parsed = CreateUserSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const result = await container.getRegisterUserUseCase().execute(parsed.data)

  if (!result.ok) {
    const status = result.error.name === 'UserAlreadyExistsError' ? 409 : 500
    return NextResponse.json({ error: result.error.message }, { status })
  }

  return NextResponse.json(result.value, { status: 201 })
}
```

## Server Components — Read Data via Use Case

```tsx
// app/dashboard/page.tsx
import { container } from '@di/container'
import { UserDashboard } from '@presentation/components/user-dashboard'

// Next.js 16: params is a Promise — must await
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const result = await container.getGetUserUseCase().execute({ userId })

  if (!result.ok) {
    throw result.error  // Let Next.js error.tsx handle it
  }

  return <UserDashboard user={result.value} />
}
```

## Client Components — UI Only

```tsx
// src/presentation/components/signup-form.client.tsx
'use client'

import { useActionState } from 'react'
import { registerAction } from '@/app/actions/auth.actions'
import type { FormState } from '@application/types/form-state'

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState | undefined, FormData>(
    registerAction,
    undefined,
  )

  return (
    <form action={action}>
      <input name="name" required />
      {state?.errors?.name && <p role="alert">{state.errors.name[0]}</p>}

      <input name="email" type="email" required />
      {state?.errors?.email && <p role="alert">{state.errors.email[0]}</p>}

      {state?.errors?._form && <p role="alert">{state.errors._form[0]}</p>}

      <button type="submit" disabled={pending}>
        {pending ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
```

**Client Component rules:**
- Never import use cases, repositories, or domain entities
- Receive data as props from Server Components or via Server Actions
- `'use client'` only when you need interactivity (state, effects, browser APIs)

## Anti-Patterns

```ts
// ❌ Business logic in a Server Action
export async function badAction(formData: FormData) {
  'use server'
  const email = formData.get('email')
  const user = await prisma.user.findUnique({ where: { email } })  // WRONG
  if (user) throw new Error('exists')
  await prisma.user.create({ data: { email, name: '...' } })       // WRONG
}

// ❌ Missing await on Next.js 16 async params
export default async function Page({ params }) {
  const { id } = params  // WRONG in Next.js 16 — params is a Promise
}

// ❌ Client Component fetching directly from DB
'use client'
async function fetchUser() {
  const user = await prisma.user.findUnique(...)  // WRONG — prisma can't run in browser
}

// ❌ Importing app/ from src/
import { registerAction } from '@/app/actions/auth.actions'  // WRONG inside src/
```
