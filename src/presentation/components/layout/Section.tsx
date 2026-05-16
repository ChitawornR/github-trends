import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  /** Passed to the wrapping <section> element */
  id?: string
}

export function Section({ title, description, children, className = '', id }: SectionProps) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-heading` : undefined} className={`py-8 ${className}`}>
      <div className="mb-6">
        <h2
          id={id ? `${id}-heading` : undefined}
          className="text-xl font-semibold text-white"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-[#98989D]">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}
