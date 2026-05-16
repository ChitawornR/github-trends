import type { NextRequest } from 'next/server'
import { container } from '@/src/di/container'
import type { TrendingRange } from '@/src/application/use-cases/get-trending-repositories.use-case'

const VALID_RANGES = new Set<TrendingRange>(['today', 'week', 'month'])

function isValidRange(value: string): value is TrendingRange {
  return VALID_RANGES.has(value as TrendingRange)
}

/**
 * GET /api/trending?range=today|week|month
 *
 * Returns a list of trending repositories for the specified time range.
 * Used by the client-side TrendingSection component when switching tabs.
 *
 * Response codes:
 * - 200  Trending repositories JSON
 * - 400  Missing or invalid `range` query parameter
 * - 429  GitHub API rate limit exceeded (body includes `resetAt`)
 * - 500  Unexpected infrastructure failure
 */
export async function GET(request: NextRequest): Promise<Response> {
  const rangeParam = request.nextUrl.searchParams.get('range') ?? ''

  if (!isValidRange(rangeParam)) {
    return Response.json(
      { error: 'Invalid or missing `range` parameter. Must be one of: today, week, month.' },
      { status: 400 },
    )
  }

  const useCase = container.getGetTrendingRepositoriesUseCase()
  const result = await useCase.execute({ range: rangeParam })

  if (!result.ok) {
    const { error } = result

    if (error.name === 'RateLimitError') {
      return Response.json(
        {
          error: 'GitHub API rate limit exceeded.',
          resetAt: (error as import('@/src/application/errors/rate-limit.error').RateLimitError).resetAt.toISOString(),
        },
        { status: 429 },
      )
    }

    // InternalError or any other unexpected error — do not expose internals
    console.error('[/api/trending] InternalError', error)
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }

  return Response.json(result.value)
}
