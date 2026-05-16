'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBoxProps {
  defaultValue?: string
  placeholder?: string
}

export function SearchBox({
  defaultValue = '',
  placeholder = 'Search repos (e.g. facebook/react, vercel, react)',
}: SearchBoxProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form
      role="search"
      aria-label="Search GitHub repositories"
      onSubmit={handleSubmit}
      className="flex w-full gap-2"
    >
      <div className="relative flex-1">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#98989D]"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search query"
          autoComplete="off"
          spellCheck="false"
          className="w-full rounded-lg border border-[#2C2C2E] bg-[#1E1E1E] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#98989D] transition-colors focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
        />
      </div>
      <button
        type="submit"
        disabled={!query.trim()}
        className="rounded-lg bg-[#00E5FF] px-5 py-2.5 text-sm font-medium text-[#121212] transition-colors hover:bg-[#00E5FF]/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
      >
        Search
      </button>
    </form>
  )
}
