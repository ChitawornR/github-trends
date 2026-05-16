/**
 * Application-internal helpers to map domain entities to DTOs.
 * These are NOT infrastructure mappers — they only know about domain types and DTOs,
 * both of which live within the inward-pointing dependency cone.
 */
import type { GithubRepository } from '@/src/domain/entities/repository.entity'
import type { GithubOwner } from '@/src/domain/entities/owner.entity'
import type { RepositoryDto } from '@/src/application/dtos/repository.dto'
import type { OwnerDto } from '@/src/application/dtos/owner.dto'

export function toOwnerDto(owner: GithubOwner): OwnerDto {
  return {
    login: owner.login,
    type: owner.type,
    avatarUrl: owner.avatarUrl,
    htmlUrl: owner.htmlUrl,
    name: owner.name,
    bio: owner.bio,
  }
}

export function toRepositoryDto(repo: GithubRepository): RepositoryDto {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.fullName,
    owner: toOwnerDto(repo.owner),
    description: repo.description,
    stars: repo.stars,
    forks: repo.forks,
    language: repo.language,
    updatedAt: repo.updatedAt,
    createdAt: repo.createdAt,
    htmlUrl: repo.htmlUrl,
    topics: repo.topics,
    openIssuesCount: repo.openIssuesCount,
  }
}
