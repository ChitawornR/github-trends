/**
 * Raw response types from the GitHub REST API.
 * These types mirror the JSON shape returned by GitHub and are used only
 * within the infrastructure layer. They must never leak into domain or application layers.
 */

export interface RawOwner {
  readonly login: string
  readonly id: number
  readonly avatar_url: string
  readonly html_url: string
  readonly type: 'User' | 'Organization' | 'Bot'
}

export interface RawRepository {
  readonly id: number
  readonly name: string
  readonly full_name: string
  readonly owner: RawOwner
  readonly description: string | null
  readonly stargazers_count: number
  readonly forks_count: number
  readonly language: string | null
  readonly updated_at: string
  readonly created_at: string
  readonly html_url: string
  readonly topics?: readonly string[]
  readonly open_issues_count: number
  readonly private: boolean
}

export interface RawUser {
  readonly login: string
  readonly id: number
  readonly avatar_url: string
  readonly html_url: string
  /** 'User' | 'Organization' from the /users/{name} endpoint */
  readonly type: 'User' | 'Organization' | 'Bot'
  readonly name: string | null
  readonly bio: string | null
}

export interface RawSearchRepositoriesResponse {
  readonly total_count: number
  readonly incomplete_results: boolean
  readonly items: readonly RawRepository[]
}

/** Response shape for GET /search/repositories?per_page=1 (used for language counts). */
export interface RawLanguageCountResponse {
  readonly total_count: number
  readonly incomplete_results: boolean
  readonly items: readonly RawRepository[]
}
