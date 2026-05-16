import { Suspense } from 'react'
import { container } from '@/src/di/container'
import { toRepositoryViewModel } from '@/src/presentation/mappers/repository.mapper'
import { toLanguageStatViewModel } from '@/src/presentation/mappers/language-stat.mapper'
import { Header } from '@/src/presentation/components/layout/Header'
import { Container } from '@/src/presentation/components/layout/Container'
import { Section } from '@/src/presentation/components/layout/Section'
import { SearchBox } from '@/src/presentation/components/search/SearchBox'
import { RepositoryList } from '@/src/presentation/components/repository/RepositoryList'
import { LanguagesSection } from '@/src/presentation/components/languages/LanguagesSection'
import { TrendingSection } from '@/src/presentation/components/trending/TrendingSection'
import { StateMessage } from '@/src/presentation/components/common/StateMessage'
import {
  RepositoryListSkeleton,
  LanguagesSectionSkeleton,
} from '@/src/presentation/components/common/Skeleton'

// ─── Async sub-components (server) ───────────────────────────────────────────

async function LanguagesSectionLoader() {
  const result = await container.getGetTopLanguagesUseCase().execute()

  if (!result.ok) {
    const { error } = result
    if (error.name === 'RateLimitError') {
      const resetAt = (error as import('@/src/application/errors/rate-limit.error').RateLimitError).resetAt.toISOString()
      return <StateMessage variant="rate-limit" resetAt={resetAt} />
    }
    return <StateMessage variant="error" />
  }

  const stats = result.value.map((dto, index) => toLanguageStatViewModel(dto, index))
  return <LanguagesSection stats={stats} />
}

async function TopRepositoriesLoader() {
  const result = await container.getGetTopRepositoriesUseCase().execute()

  if (!result.ok) {
    const { error } = result
    if (error.name === 'RateLimitError') {
      const resetAt = (error as import('@/src/application/errors/rate-limit.error').RateLimitError).resetAt.toISOString()
      return <StateMessage variant="rate-limit" resetAt={resetAt} />
    }
    return <StateMessage variant="error" />
  }

  if (result.value.length === 0) {
    return <StateMessage variant="empty" message="No top repositories found." />
  }

  const repos = result.value.map(toRepositoryViewModel)
  return (
    <RepositoryList
      repos={repos}
      label="Top repositories by stars"
    />
  )
}

async function TrendingSectionLoader() {
  const result = await container.getGetTrendingRepositoriesUseCase().execute({ range: 'today' })

  if (result.ok) {
    return (
      <TrendingSection
        initialState={{ repos: result.value, error: null, resetAt: null, status: 'success' }}
      />
    )
  }

  const { error } = result
  if (error.name === 'RateLimitError') {
    const resetAt = (error as import('@/src/application/errors/rate-limit.error').RateLimitError).resetAt.toISOString()
    return (
      <TrendingSection
        initialState={{ repos: [], error: 'GitHub API rate limit exceeded.', resetAt, status: 'rate-limit' }}
      />
    )
  }

  return (
    <TrendingSection
      initialState={{ repos: [], error: 'An unexpected error occurred.', resetAt: null, status: 'error' }}
    />
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="main-content" className="flex-1">
        <Container className="py-8">
          {/* Hero / search */}
          <div className="mb-10">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
              GitHub Trends
            </h1>
            <p className="mb-6 text-base text-[#98989D]">
              Explore trending repositories, top programming languages, and search GitHub.
            </p>
            <div className="max-w-2xl">
              <SearchBox />
            </div>
          </div>

          {/* Languages */}
          <Section
            id="languages"
            title="Top Programming Languages"
            description="Ranked by number of repositories with more than 10k stars."
            className="border-t border-[#2C2C2E]"
          >
            <Suspense fallback={<LanguagesSectionSkeleton />}>
              <LanguagesSectionLoader />
            </Suspense>
          </Section>

          {/* Trending */}
          <Section
            id="trending"
            title="Trending Repositories"
            description="Repositories created recently and gaining the most stars."
            className="border-t border-[#2C2C2E]"
          >
            <Suspense fallback={<RepositoryListSkeleton count={6} />}>
              <TrendingSectionLoader />
            </Suspense>
          </Section>

          {/* Top repos */}
          <Section
            id="top-repos"
            title="All-Time Top Repositories"
            description="The most-starred open-source repositories on GitHub."
            className="border-t border-[#2C2C2E]"
          >
            <Suspense fallback={<RepositoryListSkeleton count={6} />}>
              <TopRepositoriesLoader />
            </Suspense>
          </Section>
        </Container>
      </main>

      <footer className="border-t border-[#2C2C2E] bg-[#1E1E1E] py-6">
        <Container>
          <p className="text-center text-sm text-[#98989D]">
            Data sourced from the{' '}
            <a
              href="https://docs.github.com/en/rest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#98989D] underline underline-offset-2 hover:text-[#00E5FF]"
            >
              GitHub REST API
            </a>
            . Rate limits apply.
          </p>
        </Container>
      </footer>
    </div>
  )
}
