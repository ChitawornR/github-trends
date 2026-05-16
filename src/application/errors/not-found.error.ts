/**
 * Returned when a requested resource does not exist on GitHub.
 */
export class NotFoundError extends Error {
  public readonly name = 'NotFoundError' as const
  constructor(public readonly resource: string) {
    super(`Not found: ${resource}`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
