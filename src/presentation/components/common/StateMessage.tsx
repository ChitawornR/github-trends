interface BaseProps {
  variant: 'loading' | 'error' | 'empty' | 'invalid' | 'rate-limit'
  message?: string
}

interface RateLimitProps extends BaseProps {
  variant: 'rate-limit'
  resetAt?: string // ISO string
}

type StateMessageProps = BaseProps | RateLimitProps

function formatResetTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return isoString
  }
}

const CONFIGS = {
  loading: {
    icon: (
      <span
        aria-hidden="true"
        className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#2C2C2E] border-t-[#00E5FF]"
      />
    ),
    title: 'Loading…',
    textColor: 'text-[#98989D]',
    bgColor: 'bg-[#1E1E1E]',
    borderColor: 'border-[#2C2C2E]',
  },
  error: {
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-[#FF453A]">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    ),
    title: 'Something went wrong',
    textColor: 'text-[#FF453A]',
    bgColor: 'bg-[#3A1C1C]',
    borderColor: 'border-[#FF453A]',
  },
  empty: {
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[#98989D]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    title: 'Nothing here yet',
    textColor: 'text-[#98989D]',
    bgColor: 'bg-[#1E1E1E]',
    borderColor: 'border-[#2C2C2E]',
  },
  invalid: {
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-[#FF453A]">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
    title: 'Invalid input',
    textColor: 'text-[#FF453A]',
    bgColor: 'bg-[#3A1C1C]',
    borderColor: 'border-[#FF453A]',
  },
  'rate-limit': {
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-[#FF453A]">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
    ),
    title: 'GitHub API rate limit reached',
    textColor: 'text-[#FF453A]',
    bgColor: 'bg-[#3A1C1C]',
    borderColor: 'border-[#FF453A]',
  },
} as const

export function StateMessage(props: StateMessageProps) {
  const config = CONFIGS[props.variant]
  const isError = props.variant === 'error' || props.variant === 'rate-limit' || props.variant === 'invalid'

  const resetAt = props.variant === 'rate-limit' && 'resetAt' in props ? props.resetAt : undefined

  const defaultMessages: Record<string, string> = {
    loading: 'Fetching data from GitHub…',
    error: 'An unexpected error occurred. Please try again later.',
    empty: 'No results found for your request.',
    invalid: 'Your input contains invalid characters. Only letters, digits, dots, hyphens, underscores, and slashes are allowed.',
    'rate-limit': 'The GitHub API rate limit has been exceeded.',
  }

  const message = props.message ?? defaultMessages[props.variant] ?? ''

  return (
    <div
      role={isError ? 'alert' : undefined}
      aria-live={isError ? 'assertive' : props.variant === 'loading' ? 'polite' : undefined}
      className={`flex flex-col items-center gap-4 rounded-lg border-l-4 px-6 py-10 text-center ${config.bgColor} ${config.borderColor}`}
    >
      {config.icon}

      <div className="space-y-1">
        <p className={`font-semibold ${config.textColor}`}>{config.title}</p>
        <p className="text-sm text-[#98989D]">{message}</p>

        {props.variant === 'rate-limit' && resetAt && (
          <p className="mt-2 text-sm font-medium text-[#98989D]">
            Resets at {formatResetTime(resetAt)} — please retry after that.
          </p>
        )}

        {props.variant === 'rate-limit' && !resetAt && (
          <p className="mt-2 text-sm text-[#98989D]">
            Please wait a moment and try again.
          </p>
        )}
      </div>
    </div>
  )
}
