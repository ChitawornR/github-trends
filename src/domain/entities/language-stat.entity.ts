/**
 * Represents the popularity statistics for a programming language
 * based on the number of well-starred repositories using it.
 */
export interface LanguageStat {
  readonly language: string
  /** Number of repositories with >10k stars that use this language */
  readonly repoCount: number
  /** Percentage share among all tracked languages (0–100) */
  readonly percentage: number
  /** 1-based rank (1 = most popular) */
  readonly rank: number
}
