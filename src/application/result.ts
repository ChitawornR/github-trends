/**
 * Discriminated union for expected business outcomes.
 *
 * - `ok(value)` — success path
 * - `err(error)` — expected, recoverable business failure
 *
 * Programming bugs should be thrown (not returned) so they surface
 * immediately rather than being silently swallowed.
 */
export type Result<T, E extends Error = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })

export const err = <E extends Error>(error: E): Result<never, E> => ({ ok: false, error })

/** Union of all application-level errors returned via Result */
export type AppError =
  | import('@/src/application/errors/rate-limit.error').RateLimitError
  | import('@/src/application/errors/not-found.error').NotFoundError
  | import('@/src/application/errors/invalid-input.error').InvalidInputError
  | import('@/src/application/errors/internal.error').InternalError
