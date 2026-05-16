import type { GithubOwner } from '@/src/domain/entities/owner.entity'

/**
 * Represents a GitHub repository with its full metadata.
 */
export interface GithubRepository {
  readonly id: number
  readonly name: string
  readonly fullName: string
  readonly owner: GithubOwner
  readonly description: string | null
  readonly stars: number
  readonly forks: number
  readonly language: string | null
  readonly updatedAt: string
  readonly createdAt: string
  readonly htmlUrl: string
  readonly topics: readonly string[]
  readonly openIssuesCount: number
  readonly isPrivate: boolean
}
