import type { ReactNode } from 'react'

interface BezelProps {
  children: ReactNode
  /** "full" = nested Double-Bezel (outer shell + inner core), for hero/showpiece surfaces.
   *  "flat" = single elevated layer, for repeating list rows. */
  variant?: 'full' | 'flat'
  /** Classes for the surface that holds the content (background, padding, text color, etc). */
  className?: string
  /** Classes for the outer shell (only used by the "full" variant). */
  shellClassName?: string
}

/** Soft Structuralism card architecture (DESIGN.md §5) — diffused shadows, no hairline borders. */
export default function Bezel({ children, variant = 'full', className = '', shellClassName = '' }: BezelProps) {
  if (variant === 'flat') {
    return <div className={`rounded-2xl shadow-diffused ${className}`}>{children}</div>
  }

  return (
    <div className={`p-1.5 rounded-[1.75rem] bg-black/[0.03] ring-1 ring-black/5 shadow-diffused ${shellClassName}`}>
      <div className={`rounded-[calc(1.75rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] ${className}`}>
        {children}
      </div>
    </div>
  )
}
