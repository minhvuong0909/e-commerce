import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import cn from '../../utils/cn'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  desc?: string
  className?: string
}

const map = {
  info: { box: 'bg-lilac-50 text-lilac-700 ring-lilac-200', icon: Info },
  success: { box: 'bg-emerald-50 text-emerald-800 ring-emerald-200', icon: CheckCircle2 },
  warning: { box: 'bg-peach-50 text-peach-700 ring-peach-200', icon: AlertTriangle },
  error: { box: 'bg-rose-50 text-rose-800 ring-rose-200', icon: XCircle }
}

export default function Alert({ variant = 'info', title, desc, className = '' }: AlertProps) {
  const current = map[variant]
  const Icon = current.icon

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-2xl p-4 ring-1', current.box, className)}
    >
      <Icon size={20} className='mt-0.5 shrink-0' aria-hidden />
      <div className='min-w-0'>
        {title ? <div className='text-sm font-bold'>{title}</div> : null}
        {desc ? <div className='mt-0.5 text-[13px] leading-relaxed opacity-90'>{desc}</div> : null}
      </div>
    </div>
  )
}
