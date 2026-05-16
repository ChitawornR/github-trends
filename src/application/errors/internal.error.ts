/**
 * Wraps unexpected infrastructure failures (network errors, unexpected API responses, etc.)
 * that are caught at the use-case boundary and sanitised before reaching the client.
 */
export class InternalError extends Error {
  public readonly name = 'InternalError' as const
  constructor(message = 'An unexpected error occurred') {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
