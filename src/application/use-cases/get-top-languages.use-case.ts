import type { IGithubRepository } from '@/src/domain/repositories/github.repository'
import type { Result } from '@/src/application/result'
import type { LanguageStatDto } from '@/src/application/dtos/language-stat.dto'
import { ok, err } from '@/src/application/result'
import { RateLimitError } from '@/src/application/errors/rate-limit.error'
import { InternalError } from '@/src/application/errors/internal.error'

/** Candidate languages to evaluate for the top-languages chart. */
const CANDIDATE_LANGUAGES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C++',
  'C#',
  'PHP',
  'Ruby',
] as const

type GetTopLanguagesError = RateLimitError | InternalError

/**
 * Fetches the popularity of the 10 candidate languages by counting
 * how many repositories with >10k stars are written in each language.
 * Returns a list sorted descending by repo count, with rank and percentage.
 */
export class GetTopLanguagesUseCase {
  constructor(private readonly githubRepo: IGithubRepository) {}

  async execute(): Promise<Result<LanguageStatDto[], GetTopLanguagesError>> {
    try {
      // Fetch repo counts for all languages in parallel
      const counts = await Promise.all(
        CANDIDATE_LANGUAGES.map(async (lang) => {
          const count = await this.githubRepo.getLanguageRepoCount(lang)
          return { language: lang, repoCount: count }
        }),
      )

      // Sort descending by repo count
      const sorted = [...counts].sort((a, b) => b.repoCount - a.repoCount)

      const total = sorted.reduce((sum, s) => sum + s.repoCount, 0)

      const dtos: LanguageStatDto[] = sorted.map((stat, index) => ({
        language: stat.language,
        repoCount: stat.repoCount,
        percentage: total > 0 ? Math.round((stat.repoCount / total) * 1000) / 10 : 0,
        rank: index + 1,
      }))

      return ok(dtos)
    } catch (cause) {
      if (cause instanceof RateLimitError) {
        return err(cause)
      }
      console.error('[GetTopLanguagesUseCase] Unexpected error', cause)
      return err(new InternalError())
    }
  }
}
