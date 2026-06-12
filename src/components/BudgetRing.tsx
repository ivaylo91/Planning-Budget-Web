import { useEffect, useState } from 'react'

const RADIUS = 62
const STROKE = 10
const SIZE = (RADIUS + STROKE) * 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface BudgetRingProps {
  /** Percentage of budget spent (0-100+, will be clamped for the ring fill). */
  percent: number
}

/** The "Budget Ring" — DESIGN.md §5 signature donut, terracotta turns red past 90% spent. */
export default function BudgetRing({ percent }: BudgetRingProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDashOffset(CIRCUMFERENCE * (1 - clamped / 100))
    })
    return () => cancelAnimationFrame(frame)
  }, [clamped])

  const ringColor = percent > 90 ? '#EF4444' : '#ffffff'

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="budget-ring-arc"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[20px] font-extrabold text-white tabular-nums">{Math.round(clamped)}%</span>
      </div>
    </div>
  )
}
