import React from 'react'
import { formatDate } from '../../utils/dateUtils'

interface HeaderProps {
  title: string
  showDate?: boolean
  action?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({ title, showDate = true, action }) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary tracking-tight">
          {title}
        </h1>
        {showDate && (
          <p className="text-text-muted mt-1 first-letter:uppercase">
            {formatDate(new Date())}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </header>
  )
}
