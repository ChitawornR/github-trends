import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@/src/di/container'
import { toRepositoryViewModel } from '@/src/presentation/mappers/repository.mapper'
import { toOwnerViewModel } from '@/src/presentation/mappers/owner.mapper'
import { Header } from '@/src/presentation/components/layout/Header'
import { Container } from '@/src/presentation/components/layout/Container'
import { SearchBox } from '@/src/presentation/components/search/SearchBox'
import { SearchResults } from '@/src/presentation/components/search/SearchResults'
import { StateMessage } from '@/src/presentation/components/common/StateMessage'
import type { RateLimitError } from '@/src/application/errors/rate-limit.error'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q} — GitHub Trends` : 'Search — GitHub Trends',
    description: q ? `GitHub search results for "${q}"` : 'Search GitHub repositories',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Next.js 16: searchParams is a Promise — always await
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="main-content" className="flex-1">
        <Container className="py-8">
          {/* Back nav */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"
                clipRule="evenodd"
              />
            </svg>
            Back to dashboard
          </Link>

          {/* Search box */}
          <div className="mb-8 max-w-2xl">
            <h1 className="mb-4 text-2xl font-bold text-neutral-900">
              {query ? `Results for "${query}"` : 'Search GitHub'}
            </h1>
            <SearchBox defaultValue={query} />
          </div>

          {/* Results */}
          <SearchResultsSection query={query} />
        </Container>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-6">
        <Container>
          <p className="text-center text-sm text-neutral-400">
            Data sourced from the{' '}
            <a
              href="https://docs.github.com/en/rest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 underline underline-offset-2 hover:text-neutral-700"
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

async function SearchResultsSection({ query }: { query: string }) {
  if (!query) {
    return (
      <StateMessage
        variant="empty"
        message="Enter a repository name, owner, or full owner/repo to search."
      />
    )
  }

  const result = await container.getSearchUseCase().execute({ query })

  if (!result.ok) {
    const { error } = result

    if (error.name === 'InvalidInputError') {
      return (
        <StateMessage
          variant="invalid"
          message={error.message}
        />
      )
    }

    if (error.name === 'NotFoundError') {
      return (
        <StateMessage
          variant="empty"
          message={`No results found for "${query}". Try a different search term.`}
        />
      )
    }

    if (error.name === 'RateLimitError') {
      const resetAt = (error as RateLimitError).resetAt.toISOString()
      return <StateMessage variant="rate-limit" resetAt={resetAt} />
    }

    return <StateMessage variant="error" />
  }

  const searchResult = result.value

  // Map view models once server-side
  const repoViewModels =
    searchResult.kind === 'repo-detail'
      ? []
      : searchResult.repositories.map(toRepositoryViewModel)

  const repoViewModel =
    searchResult.kind === 'repo-detail'
      ? toRepositoryViewModel(searchResult.repository)
      : undefined

  const ownerViewModel =
    searchResult.kind === 'owner-repos'
      ? toOwnerViewModel(searchResult.owner)
      : undefined

  // Empty repo-list
  if (searchResult.kind === 'repo-list' && searchResult.repositories.length === 0) {
    return (
      <StateMessage
        variant="empty"
        message={`No repositories matched "${query}". Try a more specific term.`}
      />
    )
  }

  return (
    <SearchResults
      result={searchResult}
      repoViewModels={repoViewModels}
      ownerViewModel={ownerViewModel}
      repoViewModel={repoViewModel}
    />
  )
}
