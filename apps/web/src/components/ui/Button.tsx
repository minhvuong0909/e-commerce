import React from 'react'

const cn = (...c: (string | undefined | null | false)[]) => c.filter(Boolean).join(' ')

export default function Button({
  children,
  className = '',
  variant = 'gradient',
  full = false,
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}: {
  children: React.ReactNode
  className?: string
  variant?: 'gradient' | 'secondary' | 'ghost' | 'danger' | 'outline'
  full?: boolean
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  [key: string]: any
}) {
  const isDisabled = disabled || loading

  const base =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-emerald-100'

  const variants = {
    gradient: 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-slate-950 active:translate-y-0',
    secondary: 'border border-slate-200 bg-white text-slate-950 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0',
    outline: 'border border-slate-300 bg-transparent text-slate-950 hover:bg-white active:scale-[0.99]',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 active:scale-[0.99]',
    danger: 'bg-rose-600 text-white shadow-lg shadow-rose-600/15 hover:bg-rose-700 active:scale-[0.99]'
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        base,
        variants[variant],
        full ? 'w-full' : '',
        isDisabled ? 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none' : '',
        className
      )}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}

function Spinner() {
  return <span className='h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current' />
}
