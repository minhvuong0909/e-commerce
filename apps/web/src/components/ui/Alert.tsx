const cn = (...c: string[]) => c.filter(Boolean).join(' ')

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  desc?: string
  className?: string
}

export default function Alert({
  variant = 'info', // info | success | warning | error
  title,
  desc,
  className = ''
}: AlertProps) {
  const map = {
    info: {
      box: 'border-sky-500/25 bg-sky-500/10',
      title: 'text-sky-100',
      desc: 'text-white/70',
      icon: <InfoIcon />
    },
    success: {
      box: 'border-emerald-500/25 bg-emerald-500/10',
      title: 'text-emerald-100',
      desc: 'text-white/70',
      icon: <SuccessIcon />
    },
    warning: {
      box: 'border-orange-500/25 bg-orange-500/10',
      title: 'text-orange-100',
      desc: 'text-white/70',
      icon: <WarnIcon />
    },
    error: {
      box: 'border-rose-500/25 bg-rose-500/10',
      title: 'text-rose-100',
      desc: 'text-white/70',
      icon: <ErrorIcon />
    }
  }

  const s = map[variant]

  return (
    <div className={cn('rounded-2xl border p-4 backdrop-blur', s.box, className)}>
      <div className='flex gap-3'>
        <div className='mt-0.5'>{s.icon}</div>
        <div className='min-w-0'>
          {title ? <div className={cn('text-sm font-extrabold', s.title)}>{title}</div> : null}
          {desc ? <div className={cn('mt-1 text-sm', s.desc)}>{desc}</div> : null}
        </div>
      </div>
    </div>
  )
}

/* Icons */
function InfoIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
      <path d='M12 2a10 10 0 100 20 10 10 0 000-20z' stroke='currentColor' strokeWidth='2' opacity='0.9' />
      <path d='M12 11v6' stroke='currentColor' strokeWidth='2' />
      <path d='M12 7h.01' stroke='currentColor' strokeWidth='3' />
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
      <path d='M20 6L9 17l-5-5' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function WarnIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
      <path
        d='M10.3 4.3a2 2 0 013.4 0l8 13.3A2 2 0 0120 20H4a2 2 0 01-1.7-3L10.3 4.3z'
        stroke='currentColor'
        strokeWidth='2'
        opacity='0.9'
      />
      <path d='M12 9v4' stroke='currentColor' strokeWidth='2' />
      <path d='M12 17h.01' stroke='currentColor' strokeWidth='3' />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
      <path d='M12 2a10 10 0 100 20 10 10 0 000-20z' stroke='currentColor' strokeWidth='2' opacity='0.9' />
      <path d='M15 9l-6 6' stroke='currentColor' strokeWidth='2.2' />
      <path d='M9 9l6 6' stroke='currentColor' strokeWidth='2.2' />
    </svg>
  )
}
