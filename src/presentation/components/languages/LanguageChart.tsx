'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { LanguageStatViewModel } from '@/src/presentation/view-models/language-stat.view-model'

interface LanguageChartProps {
  stats: LanguageStatViewModel[]
}

interface TooltipPayload {
  name: string
  value: number
  payload: LanguageStatViewModel & { percentage: number }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  if (!item) return null

  return (
    <div className="rounded-lg border border-[#2C2C2E] bg-[#1E1E1E] px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-white">{item.name}</p>
      <p className="text-[#98989D]">{item.payload.percentageFormatted} of repos</p>
      <p className="text-[#98989D]">{item.payload.repoCountFormatted} repos</p>
    </div>
  )
}

export function LanguageChart({ stats }: LanguageChartProps) {
  const data = stats.map((s) => ({
    ...s,
    name: s.language,
    value: s.percentage,
  }))

  // ResponsiveContainer cannot measure dimensions during SSR — render only after mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="h-72 w-full" role="img" aria-label="Language popularity pie chart">
      {mounted && (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="55%"
            outerRadius="75%"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.colorClass} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#98989D' }}
          />
        </PieChart>
      </ResponsiveContainer>
      )}
    </div>
  )
}
