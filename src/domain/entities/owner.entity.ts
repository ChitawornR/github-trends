/**
 * Represents a GitHub user or organization that owns repositories.
 */
export type OwnerType = 'User' | 'Organization'

export interface GithubOwner {
  readonly login: string
  readonly type: OwnerType
  readonly avatarUrl: string
  readonly htmlUrl: string
  readonly name?: string
  readonly bio?: string
}
