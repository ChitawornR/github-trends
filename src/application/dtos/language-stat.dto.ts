/** Serialisable representation of a language popularity statistic. */
export interface LanguageStatDto {
  readonly language: string
  readonly repoCount: number
  readonly percentage: number
  readonly rank: number
}
