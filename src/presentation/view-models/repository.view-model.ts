/** UI-shaped representation of a GitHub repository. */
export interface RepositoryViewModel {
  readonly id: number
  readonly name: string
  readonly fullName: string
  readonly ownerLogin: string
  readonly ownerAvatarUrl: string
  readonly ownerHtmlUrl: string
  readonly ownerType: 'User' | 'Organization'
  readonly description: string | null
  readonly starsFormatted: string
  readonly starsRaw: number
  readonly forksFormatted: string
  readonly forksRaw: number
  readonly language: string | null
  readonly lastUpdated: string
  readonly htmlUrl: string
  readonly topics: readonly string[]
  readonly openIssuesCount: number
}
