import type { OwnerType } from '@/src/domain/entities/owner.entity'

/** Serialisable representation of a GitHub user or organisation. */
export interface OwnerDto {
  readonly login: string
  readonly type: OwnerType
  readonly avatarUrl: string
  readonly htmlUrl: string
  readonly name?: string
  readonly bio?: string
}
