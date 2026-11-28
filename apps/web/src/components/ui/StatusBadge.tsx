import { CheckCircle2, CircleDashed, PackageCheck, Truck, XCircle } from 'lucide-react'
import cn from '../../utils/cn'

type StatusTone = 'processing' | 'shipping' | 'done' | 'cancel' | 'info' | 'warning' | 'success' | 'danger'

interface StatusBadgeProps {
  tone?: StatusTone
  children: string
  className?: string
}

const styles: Record<StatusTone, string> = {
  processing: 'bg-peach-100 text-peach-700',
  shipping: 'bg-lilac-100 text-lilac-700',
  done: 'bg-emerald-100 text-emerald-800',
  cancel: 'bg-rose-100 text-rose-700',
  info: 'bg-ink-100 text-ink-700',
  warning: 'bg-peach-100 text-peach-700',
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-rose-100 text-rose-700'
}

const icons: Record<StatusTone, typeof CircleDashed> = {
  processing: CircleDashed,
  shipping: Truck,
  done: CheckCircle2,
  cancel: XCircle,
  info: PackageCheck,
  warning: CircleDashed,
  success: CheckCircle2,
  danger: XCircle
}

export default function StatusBadge({ tone = 'info', children, className = '' }: StatusBadgeProps) {
  const Icon = icons[tone]
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold',
        styles[tone],
        className
      )}
    >
      <Icon size={13} aria-hidden />
      {children}
    </span>
  )
}
