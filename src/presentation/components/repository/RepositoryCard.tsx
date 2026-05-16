import type { RepositoryViewModel } from '@/src/presentation/view-models/repository.view-model'
import { StatBadge } from '@/src/presentation/components/common/StatBadge'

interface RepositoryCardProps {
  repo: RepositoryViewModel
}

/** Language dot — small coloured circle next to the language name. */
function LanguageDot() {
  return (
    <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full bg-[#00E5FF]" />
  )
}

export function RepositoryCard({ repo }: RepositoryCardProps) {
  return (
    <article
      className="flex flex-col gap-3 rounded-2xl border border-[#2C2C2E] bg-[#1E1E1E] p-5 transition-colors hover:bg-[#252525]"
      aria-label={`Repository: ${repo.fullName}`}
    >
      {/* Owner */}
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={repo.ownerAvatarUrl}
          alt={`${repo.ownerLogin} avatar`}
          width={28}
          height={28}
          className="h-7 w-7 rounded-full border border-[#2C2C2E] object-cover"
          loading="lazy"
        />
        <a
          href={repo.ownerHtmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#98989D] transition-colors hover:text-[#00E5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-sm"
        >
          {repo.ownerLogin}
        </a>
        {repo.ownerType === 'Organization' && (
          <span className="rounded-full bg-[#2C2C2E] px-2 py-0.5 text-xs font-medium text-[#00E5FF]">
            Org
          </span>
        )}
      </div>

      {/* Repo name */}
      <h3 className="text-base font-semibold leading-tight">
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-colors hover:text-[#00E5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-sm"
        >
          {repo.name}
        </a>
      </h3>

      {/* Description */}
      {repo.description ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-[#98989D]">
          {repo.description}
        </p>
      ) : (
        <p className="text-sm italic text-[#98989D]">No description</p>
      )}

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1" aria-label="Topics">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-[#2C2C2E] px-2 py-0.5 text-xs text-[#00E5FF]"
            >
              {topic}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className="text-xs text-[#98989D]">+{repo.topics.length - 4} more</span>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-sm text-[#98989D]">
        {/* Stars */}
        <StatBadge
          label="Stars"
          value={repo.starsFormatted}
          icon={
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
            </svg>
          }
        />

        {/* Forks */}
        <StatBadge
          label="Forks"
          value={repo.forksFormatted}
          icon={
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          }
        />

        {/* Language */}
        {repo.language && (
          <span className="flex items-center gap-1 text-sm text-[#98989D]">
            <LanguageDot />
            <span>{repo.language}</span>
          </span>
        )}

        {/* Last updated */}
        <span className="ml-auto text-xs text-[#98989D]" title={`Updated ${repo.lastUpdated}`}>
          Updated {repo.lastUpdated}
        </span>
      </div>
    </article>
  )
}
