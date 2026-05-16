/**
 * Returned when the GitHub API rate limit has been exceeded.
 * `resetAt` is the UTC time when the limit resets.
 */
export class RateLimitError extends Error {
  public readonly name = 'RateLimitError' as const
  constructor(public readonly resetAt: Date) {
    super(`GitHub API rate limit exceeded. Resets at ${resetAt.toISOString()}`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
