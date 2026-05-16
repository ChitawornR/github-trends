# Dependency Rule

## The Rule

**Dependencies ALWAYS point inward.** Inner layers never import from outer layers. This is non-negotiable.

```
✅ application/ imports from domain/
✅ infrastructure/ imports from application/ and domain/
❌ domain/ imports from application/
❌ application/ imports from infrastructure/
❌ domain/ imports from Next.js, React, Prisma, or any npm package
```

## tsconfig Path Aliases

Define these in `tsconfig.json` so violations are obvious at a glance:

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@domain/*":         ["src/domain/*"],
      "@application/*":   ["src/application/*"],
      "@infrastructure/*":["src/infrastructure/*"],
      "@presentation/*":  ["src/presentation/*"],
      "@di/*":            ["src/di/*"]
    }
  }
}
```

An import like `import { prisma } from '@infrastructure/database/prisma.client'` inside `src/domain/` is an immediate red flag.

## ESLint Boundary Enforcement

Install `eslint-plugin-boundaries` and add:

```js
// eslint.config.mjs
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'domain',         pattern: 'src/domain/**' },
        { type: 'application',    pattern: 'src/application/**' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**' },
        { type: 'presentation',   pattern: 'src/presentation/**' },
        { type: 'di',             pattern: 'src/di/**' },
        { type: 'app',            pattern: 'app/**' },
      ],
    },
    rules: {
      'boundaries/element-types': [2, {
        default: 'disallow',
        rules: [
          { from: 'domain',         allow: ['domain'] },
          { from: 'application',    allow: ['domain', 'application'] },
          { from: 'infrastructure', allow: ['domain', 'application', 'infrastructure'] },
          { from: 'presentation',   allow: ['domain', 'application', 'presentation'] },
          { from: 'di',             allow: ['domain', 'application', 'infrastructure', 'presentation', 'di'] },
          { from: 'app',            allow: ['domain', 'application', 'presentation', 'di'] },
        ],
      }],
    },
  },
]
```

## Barrel Files

Use sparingly — barrel files can cause circular dependency issues.

**Allowed:** One barrel per layer root that exports only what other layers should consume:

```ts
// src/domain/index.ts
export type { IUserRepository } from './repositories/user.repository'
export { User } from './entities/user'
export { Email } from './value-objects/email'
export { DomainError } from './errors/domain.error'
```

**Never re-export infrastructure implementations from a domain barrel.**

## Common Violations to Catch

```ts
// ❌ Domain importing from infrastructure
// src/domain/entities/user.ts
import { prisma } from '@infrastructure/database/prisma.client'  // WRONG

// ❌ Application importing from Next.js
// src/application/use-cases/register-user.use-case.ts
import { cookies } from 'next/headers'  // WRONG

// ❌ Use case accepting a Request object
async execute(request: Request): Promise<Response>  // WRONG — presentation concern

// ❌ app/ imported by src/
// src/presentation/components/Form.tsx
import { registerAction } from '@/app/actions/auth.actions'  // WRONG
```
