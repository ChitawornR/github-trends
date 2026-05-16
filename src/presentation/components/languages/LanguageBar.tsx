import type { LanguageStatViewModel } from '@/src/presentation/view-models/language-stat.view-model'

interface LanguageBarProps {
  stat: LanguageStatViewModel
}

export function LanguageBar({ stat }: LanguageBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: stat.colorClass }}
          />
          <span className="font-medium text-white">{stat.language}</span>
        </div>
        <div className="flex items-center gap-3 text-[#98989D]">
          <span className="text-xs">{stat.repoCountFormatted} repos</span>
          <span className="w-12 text-right font-medium text-white">
            {stat.percentageFormatted}
          </span>
        </div>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#2C2C2E]"
        role="progressbar"
        aria-label={`${stat.language}: ${stat.percentageFormatted}`}
        aria-valuenow={stat.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${stat.percentage}%`,
            backgroundColor: stat.colorClass,
          }}
        />
      </div>
    </div>
  )
}
