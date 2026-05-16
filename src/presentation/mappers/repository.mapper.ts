import type { RepositoryDto } from '@/src/application/dtos/repository.dto'
import type { RepositoryViewModel } from '@/src/presentation/view-models/repository.view-model'

/** Formats a raw number into a compact human-readable string (e.g. 12300 → "12.3k"). */
function formatCount(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return String(n)
}

/** Returns a relative "last updated" label (e.g. "3 days ago", "2 months ago"). */
function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 60) return 'just now'
  if (diffSeconds < 3600) {
    const m = Math.floor(diffSeconds / 60)
    return `${m} minute${m === 1 ? '' : 's'} ago`
  }
  if (diffSeconds < 86400) {
    const h = Math.floor(diffSeconds / 3600)
    return `${h} hour${h === 1 ? '' : 's'} ago`
  }
  if (diffSeconds < 2592000) {
    const d = Math.floor(diffSeconds / 86400)
    return `${d} day${d === 1 ? '' : 's'} ago`
  }
  if (diffSeconds < 31536000) {
    const mo = Math.floor(diffSeconds / 2592000)
    return `${mo} month${mo === 1 ? '' : 's'} ago`
  }
  const y = Math.floor(diffSeconds / 31536000)
  return `${y} year${y === 1 ? '' : 's'} ago`
}

export function toRepositoryViewModel(dto: RepositoryDto): RepositoryViewModel {
  return {
    id: dto.id,
    name: dto.name,
    fullName: dto.fullName,
    ownerLogin: dto.owner.login,
    ownerAvatarUrl: dto.owner.avatarUrl,
    ownerHtmlUrl: dto.owner.htmlUrl,
    ownerType: dto.owner.type,
    description: dto.description,
    starsFormatted: formatCount(dto.stars),
    starsRaw: dto.stars,
    forksFormatted: formatCount(dto.forks),
    forksRaw: dto.forks,
    language: dto.language,
    lastUpdated: formatRelativeDate(dto.updatedAt),
    htmlUrl: dto.htmlUrl,
    topics: dto.topics,
    openIssuesCount: dto.openIssuesCount,
  }
}
