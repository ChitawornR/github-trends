/**
 * Maps raw GitHub API response objects to domain entities.
 * This is the only place in the codebase that knows about both raw API shapes
 * and domain types — keeping that coupling in one file.
 */
import type { GithubRepository } from '@/src/domain/entities/repository.entity'
import type { GithubOwner, OwnerType } from '@/src/domain/entities/owner.entity'
import type { RawRepository, RawOwner, RawUser } from '@/src/infrastructure/github/github.types'

export class GithubMapper {
  static toOwnerFromRawOwner(raw: RawOwner): GithubOwner {
    return {
      login: raw.login,
      type: GithubMapper.normaliseOwnerType(raw.type),
      avatarUrl: raw.avatar_url,
      htmlUrl: raw.html_url,
    }
  }

  static toOwnerFromRawUser(raw: RawUser): GithubOwner {
    return {
      login: raw.login,
      type: GithubMapper.normaliseOwnerType(raw.type),
      avatarUrl: raw.avatar_url,
      htmlUrl: raw.html_url,
      name: raw.name ?? undefined,
      bio: raw.bio ?? undefined,
    }
  }

  static toRepository(raw: RawRepository): GithubRepository {
    return {
      id: raw.id,
      name: raw.name,
      fullName: raw.full_name,
      owner: GithubMapper.toOwnerFromRawOwner(raw.owner),
      description: raw.description,
      stars: raw.stargazers_count,
      forks: raw.forks_count,
      language: raw.language,
      updatedAt: raw.updated_at,
      createdAt: raw.created_at,
      htmlUrl: raw.html_url,
      topics: raw.topics ?? [],
      openIssuesCount: raw.open_issues_count,
      isPrivate: raw.private,
    }
  }

  private static normaliseOwnerType(rawType: 'User' | 'Organization' | 'Bot'): OwnerType {
    // GitHub occasionally returns 'Bot' for automated accounts; treat as User
    return rawType === 'Organization' ? 'Organization' : 'User'
  }
}
