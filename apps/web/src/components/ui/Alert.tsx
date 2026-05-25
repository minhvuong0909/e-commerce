import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import cn from '../../utils/cn'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  desc?: string
  className?: string
}

export default function Alert({ variant = 'info', title, desc, className = '' }: AlertProps) {
  const map = {
    info: {
      box: 'border-sky-200 bg-sky-50/80 text-sky-900',
      icon: Info,
      iconBox: 'bg-sky-100 text-sky-700'
    },
    success: {
      box: 'border-emerald-200 bg-emerald-50/80 text-emerald-900',
      icon: CheckCircle2,
      iconBox: 'bg-emerald-100 text-emerald-700'
    },
    warning: {
      box: 'border-amber-200 bg-amber-50/85 text-amber-950',
      icon: AlertTriangle,
      iconBox: 'bg-amber-100 text-amber-700'
    },
    error: {
      box: 'border-rose-200 bg-rose-50/85 text-rose-950',
      icon: XCircle,
      iconBox: 'bg-rose-100 text-rose-700'
    }
  }

  const current = map[variant]
  const Icon = current.icon

  return (
    <div className={cn('rounded-2xl border p-4 shadow-sm', current.box, className)}>
      <div className='flex gap-3'>
        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', current.iconBox)}>
          <Icon size={18} />
        </span>
        <div className='min-w-0'>
          {title ? <div className='text-sm font-extrabold'>{title}</div> : null}
          {desc ? <div className='mt-1 text-sm leading-6 opacity-75'>{desc}</div> : null}
        </div>
      </div>
    </div>
  )
}
