import React from 'react'

interface StreakBadgeProps {
  streak: number
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  if (streak < 2) return null

  const isHighStreak = streak >= 7

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
      bg-accent text-white shadow-lg shadow-accent/20
      ${isHighStreak ? 'animate-pulse' : ''}
    `}>
      <span>🔥</span>
      <span>{streak}</span>
    </div>
  )
}
