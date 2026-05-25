import { CheckCircle2, CircleDashed, PackageCheck, Truck, XCircle } from 'lucide-react'
import cn from '../../utils/cn'

type StatusTone = 'processing' | 'shipping' | 'done' | 'cancel' | 'info' | 'warning' | 'success' | 'danger'

interface StatusBadgeProps {
  tone?: StatusTone
  children: string
  className?: string
}

const styles: Record<StatusTone, string> = {
  processing: 'border-amber-200 bg-amber-50 text-amber-800',
  shipping: 'border-sky-200 bg-sky-50 text-sky-800',
  done: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  cancel: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-slate-200 bg-slate-50 text-slate-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-800'
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
        'inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold',
        styles[tone],
        className
      )}
    >
      <Icon size={14} />
      {children}
    </span>
  )
}
