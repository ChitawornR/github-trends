import type { RepositoryDto } from '@/src/application/dtos/repository.dto'
import type { RepositoryViewModel } from '@/src/presentation/view-models/repository.view-model'
import { formatCount } from '@/src/presentation/utils/format'

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
    updatedAt: dto.updatedAt,
    htmlUrl: dto.htmlUrl,
    topics: dto.topics,
    openIssuesCount: dto.openIssuesCount,
  }
}
