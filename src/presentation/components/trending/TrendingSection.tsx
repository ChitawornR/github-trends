'use client'

import { useState, useCallback } from 'react'
import type { RepositoryDto } from '@/src/application/dtos/repository.dto'
import { toRepositoryViewModel } from '@/src/presentation/mappers/repository.mapper'
import { RepositoryList } from '@/src/presentation/components/repository/RepositoryList'
import { StateMessage } from '@/src/presentation/components/common/StateMessage'
import { Spinner } from '@/src/presentation/components/common/Spinner'
import { RepositoryListSkeleton } from '@/src/presentation/components/common/Skeleton'

type TrendingRange = 'today' | 'week' | 'month'

const TABS: { label: string; value: TrendingRange }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
]

export interface TrendingState {
  repos: RepositoryDto[]
  error: string | null
  resetAt: string | null
  status: 'idle' | 'loading' | 'success' | 'error' | 'rate-limit'
}

interface TrendingSectionProps {
  /** Server-rendered initial state for the "today" tab — may carry an error. */
  initialState: TrendingState
}

export function TrendingSection({ initialState }: TrendingSectionProps) {
  const [activeTab, setActiveTab] = useState<TrendingRange>('today')
  const [cache, setCache] = useState<Partial<Record<TrendingRange, TrendingState>>>({
    today: initialState,
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchTab = useCallback(async (range: TrendingRange) => {
    // Already cached
    if (cache[range]) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/trending?range=${range}`)

      if (res.status === 429) {
        const json = (await res.json()) as { error: string; resetAt?: string }
        setCache((prev) => ({
          ...prev,
          [range]: {
            repos: [],
            error: json.error,
            resetAt: json.resetAt ?? null,
            status: 'rate-limit',
          },
        }))
        return
      }

      if (!res.ok) {
        const json = (await res.json()) as { error: string }
        setCache((prev) => ({
          ...prev,
          [range]: {
            repos: [],
            error: json.error ?? 'An unexpected error occurred.',
            resetAt: null,
            status: 'error',
          },
        }))
        return
      }

      const repos = (await res.json()) as RepositoryDto[]
      setCache((prev) => ({
        ...prev,
        [range]: { repos, error: null, resetAt: null, status: 'success' },
      }))
    } catch {
      setCache((prev) => ({
        ...prev,
        [range]: {
          repos: [],
          error: 'Network error — please check your connection.',
          resetAt: null,
          status: 'error',
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }, [cache])

  const handleTabClick = (range: TrendingRange) => {
    setActiveTab(range)
    void fetchTab(range)
  }

  return (
    <div>
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Trending time range"
        className="mb-6 flex gap-1 rounded-lg border border-[#2C2C2E] bg-[#1E1E1E] p-1 w-fit"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              aria-controls={`trending-panel-${tab.value}`}
              id={`trending-tab-${tab.value}`}
              onClick={() => handleTabClick(tab.value)}
              className={`
                flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-1 focus-visible:ring-offset-[#1E1E1E]
                ${isActive
                  ? 'bg-[#00E5FF] text-[#121212] shadow-sm'
                  : 'text-[#98989D] hover:text-white hover:bg-[#252525]'
                }
              `}
            >
              {tab.label}
              {isActive && isLoading && <Spinner size="sm" />}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      {TABS.map((tab) => {
        const state = cache[tab.value]
        const isActive = activeTab === tab.value

        return (
          <div
            key={tab.value}
            role="tabpanel"
            id={`trending-panel-${tab.value}`}
            aria-labelledby={`trending-tab-${tab.value}`}
            hidden={!isActive}
          >
            {!state || state.status === 'loading' ? (
              <RepositoryListSkeleton count={6} />
            ) : state.status === 'rate-limit' ? (
              <StateMessage
                variant="rate-limit"
                message={state.error ?? undefined}
                resetAt={state.resetAt ?? undefined}
              />
            ) : state.status === 'error' ? (
              <StateMessage variant="error" message={state.error ?? undefined} />
            ) : state.repos.length === 0 ? (
              <StateMessage
                variant="empty"
                message="No trending repositories found for this period."
              />
            ) : (
              <RepositoryList
                repos={state.repos.map(toRepositoryViewModel)}
                label={`Trending repositories — ${tab.label}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
