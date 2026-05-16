'use client'

import { useEffect } from 'react'
import { Container } from '@/src/presentation/components/layout/Container'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <main className="flex flex-1 items-center justify-center py-20">
      <Container>
        <div
          role="alert"
          className="mx-auto max-w-md rounded-2xl border border-[#FF453A] bg-[#3A1C1C] p-8 text-center"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="mx-auto mb-4 h-12 w-12 text-[#FF453A]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>

          <h1 className="mb-2 text-lg font-semibold text-white">
            Something went wrong
          </h1>
          <p className="mb-6 text-sm text-[#98989D]">
            An unexpected error occurred while loading the dashboard.
            {error.digest && (
              <span className="mt-1 block text-xs text-[#98989D]">
                Reference: {error.digest}
              </span>
            )}
          </p>

          <button
            onClick={unstable_retry}
            className="rounded-lg bg-[#FF453A] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#FF453A]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF453A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3A1C1C]"
          >
            Try again
          </button>
        </div>
      </Container>
    </main>
  )
}
