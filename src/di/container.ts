/**
 * Composition root — the only place in the entire codebase that reads `process.env.GITHUB_TOKEN`
 * and wires concrete implementations to interfaces.
 *
 * Infrastructure singletons (client, repository) are created once and shared across requests.
 * Use cases are cheap stateless objects created per-call via factory functions.
 */
import { GithubApiClient } from '@/src/infrastructure/github/github-api.client'
import { GithubRepositoryImpl } from '@/src/infrastructure/github/github.repository.impl'
import { GetTopLanguagesUseCase } from '@/src/application/use-cases/get-top-languages.use-case'
import { GetTopRepositoriesUseCase } from '@/src/application/use-cases/get-top-repositories.use-case'
import { GetTrendingRepositoriesUseCase } from '@/src/application/use-cases/get-trending-repositories.use-case'
import { SearchUseCase } from '@/src/application/use-cases/search.use-case'

// ─── Infrastructure singletons ───────────────────────────────────────────────

/** GitHub API client. Token is optional — without it the rate limit is 60 req/hr. */
const githubApiClient = new GithubApiClient(process.env.GITHUB_TOKEN)

/** Repository implementation backed by the GitHub REST API. */
const githubRepository = new GithubRepositoryImpl(githubApiClient)

// ─── Container ───────────────────────────────────────────────────────────────

/**
 * Factory-function based DI container.
 * Each factory creates a fresh, stateless use case instance per call.
 */
export const container = {
  getGetTopLanguagesUseCase: (): GetTopLanguagesUseCase =>
    new GetTopLanguagesUseCase(githubRepository),

  getGetTopRepositoriesUseCase: (): GetTopRepositoriesUseCase =>
    new GetTopRepositoriesUseCase(githubRepository),

  getGetTrendingRepositoriesUseCase: (): GetTrendingRepositoriesUseCase =>
    new GetTrendingRepositoriesUseCase(githubRepository),

  getSearchUseCase: (): SearchUseCase => new SearchUseCase(githubRepository),
} as const
