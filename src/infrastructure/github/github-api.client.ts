import { GITHUB_API_BASE, GITHUB_API_VERSION } from '@/src/infrastructure/github/github.config'
import { RateLimitError } from '@/src/application/errors/rate-limit.error'

/**
 * A thin fetch wrapper for the GitHub REST API.
 *
 * Responsibilities:
 * - Attaches required headers (`Accept`, `X-GitHub-Api-Version`, optional `Authorization`)
 * - Opts into Next.js fetch caching via `{ next: { revalidate } }`
 * - Detects rate-limit responses (`x-ratelimit-remaining: 0`) and throws `RateLimitError`
 * - Returns parsed JSON for 2xx responses; throws for all other non-2xx/non-404 cases
 *
 * The client does NOT catch its own exceptions — callers (repository impl) handle
 * 404s per endpoint and use cases catch everything else.
 */
export class GithubApiClient {
  private readonly baseHeaders: Record<string, string>

  constructor(token?: string) {
    this.baseHeaders = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  /**
   * Performs a GET request to the GitHub API.
   *
   * @param path    - Path relative to `https://api.github.com`, e.g. `/repos/vercel/next.js`
   * @param revalidate - Next.js ISR revalidation period in seconds
   * @returns       Parsed JSON body on success
   * @throws        `RateLimitError` when the rate limit is exceeded
   * @throws        `Error` with status code for any other non-2xx / non-404 response
   *                (404 is signalled by returning the special sentinel `NOT_FOUND`)
   */
  async get<T>(path: string, revalidate: number): Promise<T> {
    const url = `${GITHUB_API_BASE}${path}`

    const response = await fetch(url, {
      headers: this.baseHeaders,
      next: { revalidate },
    })

    // Rate-limit detection: GitHub sends 403 or 429 when limited.
    // The canonical check is x-ratelimit-remaining === '0'.
    if (
      (response.status === 403 || response.status === 429) &&
      response.headers.get('x-ratelimit-remaining') === '0'
    ) {
      const resetHeader = response.headers.get('x-ratelimit-reset')
      const resetUnixSeconds = resetHeader ? parseInt(resetHeader, 10) : NaN
      const resetAt = Number.isFinite(resetUnixSeconds)
        ? new Date(resetUnixSeconds * 1000)
        : new Date(Date.now() + 60_000) // fallback: 1 min from now
      throw new RateLimitError(resetAt)
    }

    if (response.status === 404) {
      // Signal a 404 to the caller without throwing; caller converts to null / NotFoundError
      return NOT_FOUND as T
    }

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText} for ${url}`,
      )
    }

    return response.json() as Promise<T>
  }
}

/**
 * Sentinel value returned by `get()` when the GitHub API responds with 404.
 * Callers check `isNotFound(result)` and convert to domain-appropriate behaviour.
 */
export const NOT_FOUND = Symbol('NOT_FOUND')
export type NotFound = typeof NOT_FOUND

/** Type guard to detect the 404 sentinel. */
export function isNotFound(value: unknown): value is NotFound {
  return value === NOT_FOUND
}
