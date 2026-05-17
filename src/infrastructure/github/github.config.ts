/** Base URL for all GitHub REST API v3 calls. */
export const GITHUB_API_BASE = 'https://api.github.com' as const

/** GitHub API version header value (stable as of 2026-03-10). */
export const GITHUB_API_VERSION = '2026-03-10' as const

/**
 * The ten candidate languages tracked by the Top Languages feature.
 * Order here is irrelevant — they are sorted by repo count at the application layer.
 */
export const CANDIDATE_LANGUAGES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C++',
  'C#',
  'PHP',
  'Ruby',
] as const

export type CandidateLanguage = (typeof CANDIDATE_LANGUAGES)[number]

/** Revalidation intervals (seconds) used in fetch cache options. */
export const REVALIDATE = {
  /** Dashboard data: top languages, top repos. 30 minutes. */
  DASHBOARD: 1800,
  /** Search results. 5 minutes. */
  SEARCH: 300,
} as const

/** Number of results to request per paginated endpoint. */
export const PER_PAGE = {
  TOP_REPOS: 10,
  TRENDING_REPOS: 10,
  USER_REPOS: 30,
  SEARCH_REPOS: 30,
} as const
