import type { LanguageStatDto } from '@/src/application/dtos/language-stat.dto'
import type { LanguageStatViewModel } from '@/src/presentation/view-models/language-stat.view-model'
import { formatCount } from '@/src/presentation/utils/format'

/**
 * Fixed palette of muted, accessible colours for the chart.
 * One colour per language slot (10 languages max).
 */
const PALETTE = [
  '#00E5FF', // cyan (primary accent)
  '#32D74B', // green (success accent)
  '#FFD60A', // vivid yellow
  '#FF6B6B', // soft red-pink
  '#BF5AF2', // vivid purple
  '#30D158', // bright green variant
  '#FF9F0A', // vivid orange
  '#64D2FF', // light cyan
  '#FF453A', // alert red
  '#AC8EE3', // lavender
] as const


export function toLanguageStatViewModel(
  dto: LanguageStatDto,
  index: number,
): LanguageStatViewModel {
  return {
    language: dto.language,
    repoCount: dto.repoCount,
    repoCountFormatted: formatCount(dto.repoCount),
    percentage: dto.percentage,
    percentageFormatted: `${dto.percentage.toFixed(1)}%`,
    rank: dto.rank,
    colorClass: PALETTE[index % PALETTE.length] ?? '#4a6fa5',
  }
}
