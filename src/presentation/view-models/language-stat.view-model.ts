/** UI-shaped representation of a language popularity statistic. */
export interface LanguageStatViewModel {
  readonly language: string
  readonly repoCount: number
  readonly repoCountFormatted: string
  readonly percentage: number
  readonly percentageFormatted: string
  readonly rank: number
  /** Tailwind-safe colour class for chart slices / bars. */
  readonly colorClass: string
}
