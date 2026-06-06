import React from 'react'

interface ProgressBarProps {
  progress: number // 0 to 1
  label?: string
  showTextInside?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, showTextInside = false }) => {
  const percentage = Math.round(progress * 100)

  return (
    <div className="w-full">
      <div className={`${showTextInside ? 'h-6' : 'h-2'} w-full bg-bg-tertiary rounded-full overflow-hidden relative`}>
        <div 
          className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
        {showTextInside && label && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
            {label}
          </div>
        )}
      </div>
      {!showTextInside && label && (
        <div className="mt-2 text-[10px] font-medium text-text-muted uppercase tracking-wider">
          {label}
        </div>
      )}
    </div>
  )
}
