import type { IGithubRepository } from '@/src/domain/repositories/github.repository'
import type { Result } from '@/src/application/result'
import type { RepositoryDto } from '@/src/application/dtos/repository.dto'
import { ok, err } from '@/src/application/result'
import { RateLimitError } from '@/src/application/errors/rate-limit.error'
import { InternalError } from '@/src/application/errors/internal.error'
import { toRepositoryDto } from '@/src/application/use-cases/_mappers'

type GetTopRepositoriesError = RateLimitError | InternalError

/**
 * Retrieves the most-starred GitHub repositories of all time (top 20).
 */
export class GetTopRepositoriesUseCase {
  constructor(private readonly githubRepo: IGithubRepository) {}

  async execute(): Promise<Result<RepositoryDto[], GetTopRepositoriesError>> {
    try {
      const repositories = await this.githubRepo.getTopRepositories()
      return ok(repositories.map(toRepositoryDto))
    } catch (cause) {
      if (cause instanceof RateLimitError) {
        return err(cause)
      }
      console.error('[GetTopRepositoriesUseCase] Unexpected error', cause)
      return err(new InternalError())
    }
  }
}
