import { cn, getStatusIconColor } from '@/lib/utils'
import { CheckCircle2, Circle, Clock, Truck } from 'lucide-react'

interface TimelineEvent {
  id: string
  status: string
  title: string
  description: string
  timestamp: string
  isCompleted: boolean
  isCurrent: boolean
}

interface ShipmentTimelineProps {
  events: TimelineEvent[]
  className?: string
}

export function ShipmentTimeline({ events, className }: ShipmentTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1

        return (
          <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[19px] top-10 w-0.5 h-[calc(100%-2.5rem)]',
                  event.isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                event.isCompleted
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : event.isCurrent
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                  : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
              )}
            >
              {event.isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : event.isCurrent ? (
                <Truck className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={cn(
                    'font-semibold',
                    event.isCompleted || event.isCurrent
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {event.title}
                </h4>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {event.timestamp}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
              {event.isCurrent && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                  </span>
                  In Progress
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}