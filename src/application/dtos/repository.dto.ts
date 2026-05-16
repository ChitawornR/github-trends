import type { OwnerDto } from '@/src/application/dtos/owner.dto'

/** Serialisable representation of a GitHub repository. */
export interface RepositoryDto {
  readonly id: number
  readonly name: string
  readonly fullName: string
  readonly owner: OwnerDto
  readonly description: string | null
  readonly stars: number
  readonly forks: number
  readonly language: string | null
  readonly updatedAt: string
  readonly createdAt: string
  readonly htmlUrl: string
  readonly topics: readonly string[]
  readonly openIssuesCount: number
}
