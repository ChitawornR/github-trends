import type { OwnerDto } from '@/src/application/dtos/owner.dto'
import type { OwnerViewModel } from '@/src/presentation/view-models/owner.view-model'

export function toOwnerViewModel(dto: OwnerDto): OwnerViewModel {
  return {
    login: dto.login,
    type: dto.type,
    avatarUrl: dto.avatarUrl,
    htmlUrl: dto.htmlUrl,
    name: dto.name,
    bio: dto.bio,
  }
}
