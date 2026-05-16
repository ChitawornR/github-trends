/**
 * Base class for all domain-level errors.
 * These represent invariant violations or programming bugs
 * at the domain layer — they should be thrown, not returned as Results.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
