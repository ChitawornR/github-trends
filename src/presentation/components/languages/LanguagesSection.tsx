import type { LanguageStatViewModel } from '@/src/presentation/view-models/language-stat.view-model'
import { LanguageChart } from '@/src/presentation/components/languages/LanguageChart'
import { LanguageBar } from '@/src/presentation/components/languages/LanguageBar'

interface LanguagesSectionProps {
  stats: LanguageStatViewModel[]
}

export function LanguagesSection({ stats }: LanguagesSectionProps) {
  if (stats.length === 0) {
    return (
      <p className="text-sm text-[#98989D]">No language data available.</p>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Pie chart — client component */}
      <div className="w-full rounded-2xl border border-[#2C2C2E] bg-[#1E1E1E] p-4 lg:w-80 lg:shrink-0">
        <LanguageChart stats={stats} />
      </div>

      {/* Bar list */}
      <div className="flex-1 space-y-3 rounded-2xl border border-[#2C2C2E] bg-[#1E1E1E] p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[#98989D]">
          Repositories with &gt;10k stars
        </p>
        {stats.map((stat) => (
          <LanguageBar key={stat.language} stat={stat} />
        ))}
      </div>
    </div>
  )
}
