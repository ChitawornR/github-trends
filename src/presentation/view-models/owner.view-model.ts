/** UI-shaped representation of a GitHub user or organisation. */
export interface OwnerViewModel {
  readonly login: string
  readonly type: 'User' | 'Organization'
  readonly avatarUrl: string
  readonly htmlUrl: string
  readonly name?: string
  readonly bio?: string
}
