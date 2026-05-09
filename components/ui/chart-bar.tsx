import { cn } from '@/lib/utils'

interface ChartBarProps {
  data: { label: string; value: number; color?: string }[]
  maxValue: number
  className?: string
}

export function ChartBar({ data, maxValue, className }: ChartBarProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item, index) => {
        const percentage = Math.min((item.value / maxValue) * 100, 100)
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
              <span className="text-slate-500 dark:text-slate-400">{item.value}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000 ease-out',
                  item.color || 'bg-blue-500'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}