import type { RepositoryViewModel } from '@/src/presentation/view-models/repository.view-model'
import { formatRelativeDate } from '@/src/presentation/mappers/repository.mapper'
import { StatBadge } from '@/src/presentation/components/common/StatBadge'

interface RepositoryDetailProps {
  repo: RepositoryViewModel
}

export function RepositoryDetail({ repo }: RepositoryDetailProps) {
  return (
    <article
      className="rounded-2xl border border-[#2C2C2E] bg-[#1E1E1E] p-6"
      aria-label={`Repository detail: ${repo.fullName}`}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={repo.ownerAvatarUrl}
          alt={`${repo.ownerLogin} avatar`}
          width={56}
          height={56}
          className="h-14 w-14 rounded-full border border-[#2C2C2E] object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={repo.ownerHtmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#98989D] hover:text-[#00E5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-sm"
            >
              {repo.ownerLogin}
            </a>
            {repo.ownerType === 'Organization' && (
              <span className="rounded-full bg-[#2C2C2E] px-2 py-0.5 text-xs font-medium text-[#00E5FF]">
                Org
              </span>
            )}
          </div>
          <h1 className="mt-0.5 text-2xl font-bold text-white">
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#00E5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-sm"
            >
              {repo.name}
            </a>
          </h1>
        </div>

        {/* GitHub link button */}
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${repo.fullName} on GitHub`}
          className="shrink-0 rounded-md border border-[#2C2C2E] bg-[#2C2C2E] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#252525] hover:border-[#00E5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
        >
          View on GitHub
        </a>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="mt-4 text-base leading-relaxed text-[#98989D]">{repo.description}</p>
      )}

      {/* Stats */}
      <div className="mt-5 flex flex-wrap gap-4 border-t border-[#2C2C2E] pt-4">
        <StatBadge
          label="Stars"
          value={repo.starsFormatted}
          icon={
            <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
            </svg>
          }
        />
        <StatBadge
          label="Forks"
          value={repo.forksFormatted}
          icon={
            <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
              <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          }
        />
        {repo.openIssuesCount > 0 && (
          <StatBadge
            label="Open issues"
            value={String(repo.openIssuesCount)}
            icon={
              <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
                <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
              </svg>
            }
          />
        )}
        {repo.language && (
          <span className="flex items-center gap-1.5 text-sm text-[#98989D]">
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#00E5FF]" />
            {repo.language}
          </span>
        )}
        <span className="text-sm text-[#98989D]" suppressHydrationWarning>
          Updated {formatRelativeDate(repo.updatedAt)}
        </span>
      </div>

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Topics">
          {repo.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-[#2C2C2E] px-3 py-1 text-xs font-medium text-[#00E5FF]"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
