import type { ButtonHTMLAttributes, ReactNode } from 'react'
import cn from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  full?: boolean
  loading?: boolean
}

export default function Button({
  children,
  className = '',
  variant = 'primary',
  full = false,
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-ink-950 text-white shadow-card hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lift active:translate-y-0',
    gradient:
      'bg-ink-950 text-white shadow-card hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lift active:translate-y-0',
    secondary:
      'border border-slate-200 bg-white text-ink-950 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card active:translate-y-0',
    outline:
      'border border-slate-300 bg-white/60 text-ink-900 hover:border-brand-500/50 hover:bg-white hover:text-brand-900 active:scale-[0.99]',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-ink-950 active:scale-[0.99]',
    danger:
      'bg-rose-600 text-white shadow-lg shadow-rose-600/15 hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0'
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-brand-500/15',
        variants[variant],
        full && 'w-full',
        isDisabled && 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none',
        className
      )}
      {...props}
    >
      {loading ? <span className='h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current' /> : null}
      {children}
    </button>
  )
}
