interface StatBadgeProps {
  icon: React.ReactNode
  label: string
  value: string
}

export function StatBadge({ icon, label, value }: StatBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 text-sm text-[#98989D]"
      aria-label={`${label}: ${value}`}
    >
      <span aria-hidden="true" className="text-[#98989D]">
        {icon}
      </span>
      <span>{value}</span>
    </span>
  )
}
