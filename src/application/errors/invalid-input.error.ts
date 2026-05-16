/**
 * Returned when the user-supplied input fails validation
 * (e.g. an empty search query or characters outside the allowed set).
 */
export class InvalidInputError extends Error {
  public readonly name = 'InvalidInputError' as const
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
