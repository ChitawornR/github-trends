---
name: project-design-system
description: Colour tokens, typography, component patterns, a11y conventions, and Next.js 16 gotchas for the GitHub Trends Dashboard
metadata:
  type: project
---

GitHub Trends Dashboard — presentation layer design decisions.

**Why:** Dark-only design applied 2026-05-16 per explicit DESIGN.md spec.
**How to apply:** Follow these conventions for any new components or pages. Never add `dark:` variant classes — apply colours directly.

## Colour palette — dark-only (applied 2026-05-16)

| Role | Hex | Tailwind arbitrary |
|---|---|---|
| Background primary | `#121212` | `bg-[#121212]` |
| Card surface | `#1E1E1E` | `bg-[#1E1E1E]` |
| Border subtle | `#2C2C2E` | `border-[#2C2C2E]` |
| Primary accent (cyan) | `#00E5FF` | `text-[#00E5FF]` / `bg-[#00E5FF]` |
| Alert / error | `#FF453A` | `text-[#FF453A]` / `border-[#FF453A]` |
| Success / green | `#32D74B` | `text-[#32D74B]` |
| Text primary | `#FFFFFF` | `text-white` |
| Text secondary | `#98989D` | `text-[#98989D]` |
| Row hover | `#252525` | `hover:bg-[#252525]` |
| Alert box bg | `#3A1C1C` | `bg-[#3A1C1C]` |

## Language chart palette (vivid, dark-background-friendly)
`#00E5FF`, `#32D74B`, `#FFD60A`, `#FF6B6B`, `#BF5AF2`, `#30D158`, `#FF9F0A`, `#64D2FF`, `#FF453A`, `#AC8EE3`
Defined in `src/presentation/mappers/language-stat.mapper.ts`.

## Component patterns

### Card
```
rounded-2xl border border-[#2C2C2E] bg-[#1E1E1E] p-5
```

### Active / inactive tab
```
active:   bg-[#00E5FF] text-[#121212] shadow-sm
inactive: text-[#98989D] hover:text-white hover:bg-[#252525]
```

### Search input
```
bg-[#1E1E1E] border-[#2C2C2E] text-white placeholder-[#98989D]
focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/30
```

### CTA / search button
```
bg-[#00E5FF] text-[#121212] hover:bg-[#00E5FF]/90
```

### Error / alert box (StateMessage)
```
bg-[#3A1C1C] border-l-4 border-[#FF453A]
```

### Spinner
```
border-[#2C2C2E] border-t-[#00E5FF] animate-spin rounded-full
```

### Skeleton block
```
bg-[#2C2C2E] animate-pulse rounded-md
```

## Typography
- Font: Geist Sans (`font-sans` via CSS variable from `layout.tsx`)
- Headings: `text-white font-semibold` / `font-bold`
- Body / descriptions: `text-[#98989D]`
- Accent links: `text-[#00E5FF] hover:text-[#00E5FF]/80`
- Focus rings: `focus-visible:ring-2 focus-visible:ring-[#00E5FF]`

## Layout
- Max-width container: `max-w-7xl px-4 sm:px-6 lg:px-8` (`Container` component)
- Repository grid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
- Language layout: single-column mobile, `lg:flex-row` for chart+bars side-by-side

## Accessibility
- Errors: `role="alert" aria-live="assertive"`
- Loading: `aria-live="polite"` and `role="status"` (Spinner)
- Progress bars: `role="progressbar" aria-valuenow aria-valuemin aria-valuemax`
- Icon-only buttons get `aria-label`
- Images: plain `<img>` with descriptive `alt` (not next/image for avatars)

## Next.js 16 specifics
- `error.tsx` uses `unstable_retry` prop (not `reset`)
- `searchParams` is awaited in `search/page.tsx` and `generateMetadata`
- `next.config.ts` requires `qualities: [75]` for image optimization

## Pre-existing lint issue (do not fix unless asked)
`LanguageChart.tsx` line 45: `react-hooks/set-state-in-effect` on `useEffect(() => setMounted(true), [])`.
This SSR hydration guard is intentional — `ResponsiveContainer` cannot measure during SSR.
