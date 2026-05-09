import { cn, getStatusColor } from '@/lib/utils'
import { CheckCircle2, Clock, Truck, AlertCircle, Package } from 'lucide-react'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
  showIcon?: boolean
  light?: boolean
}

const statusIcons: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-3.5 h-3.5" />,
  'In Transit': <Truck className="w-3.5 h-3.5" />,
  'Out for Delivery': <Package className="w-3.5 h-3.5" />,
  Delivered: <CheckCircle2 className="w-3.5 h-3.5" />,
  Failed: <AlertCircle className="w-3.5 h-3.5" />,
}

export function StatusBadge({ status, size = 'md', showIcon = true, light = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        light
          ? 'bg-white/20 text-white border-white/30 backdrop-blur-sm'
          : getStatusColor(status)
      )}
    >
      {showIcon && statusIcons[status]}
      {status}
    </span>
  )
}