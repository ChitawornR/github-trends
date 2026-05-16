import type { IGithubRepository } from '@/src/domain/repositories/github.repository'
import type { Result } from '@/src/application/result'
import type { RepositoryDto } from '@/src/application/dtos/repository.dto'
import { ok, err } from '@/src/application/result'
import { RateLimitError } from '@/src/application/errors/rate-limit.error'
import { InternalError } from '@/src/application/errors/internal.error'
import { toRepositoryDto } from '@/src/application/use-cases/_mappers'

export type TrendingRange = 'today' | 'week' | 'month'

export interface GetTrendingRepositoriesInputDto {
  readonly range: TrendingRange
}

type GetTrendingRepositoriesError = RateLimitError | InternalError

/**
 * Retrieves repositories created within the given time range, ranked by stars.
 *
 * - today  → last 1 day
 * - week   → last 7 days
 * - month  → last 30 days
 */
export class GetTrendingRepositoriesUseCase {
  constructor(private readonly githubRepo: IGithubRepository) {}

  async execute(
    input: GetTrendingRepositoriesInputDto,
  ): Promise<Result<RepositoryDto[], GetTrendingRepositoriesError>> {
    try {
      const sinceDate = this.getSinceDate(input.range)
      const repositories = await this.githubRepo.getTrendingRepositories(sinceDate)
      return ok(repositories.map(toRepositoryDto))
    } catch (cause) {
      if (cause instanceof RateLimitError) {
        return err(cause)
      }
      console.error('[GetTrendingRepositoriesUseCase] Unexpected error', cause)
      return err(new InternalError())
    }
  }

  /**
   * Computes an ISO-8601 date string representing the start of the trending window.
   * The GitHub API expects `created:>{date}` in the search query.
   */
  private getSinceDate(range: TrendingRange): string {
    const now = new Date()
    const daysBack = range === 'today' ? 1 : range === 'week' ? 7 : 30
    now.setDate(now.getDate() - daysBack)
    return now.toISOString().split('T')[0] ?? now.toISOString().substring(0, 10)
  }
}
