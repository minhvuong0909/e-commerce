import type { ButtonHTMLAttributes, ReactNode } from 'react'
import cn from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient' | 'accent'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-berry-600 text-white hover:bg-berry-700 shadow-xs',
  accent: 'bg-berry-600 text-white hover:bg-berry-700',
  gradient: 'bg-berry-600 text-white hover:bg-berry-700',
  secondary: 'border border-ink-200 bg-white text-ink-950 hover:border-berry-300',
  outline: 'border border-berry-600 bg-transparent text-berry-700 hover:bg-berry-50',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 hover:text-ink-950',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-4 text-[13px]',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-[3.25rem] px-7 text-base'
}

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        variants[variant],
        sizes[size],
        full && 'w-full',
        isDisabled && 'pointer-events-none opacity-50 shadow-none',
        className
      )}
      {...props}
    >
      {loading ? (
        <span aria-hidden className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
      ) : null}
      {children}
    </button>
  )
}
