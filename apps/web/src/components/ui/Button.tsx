import type { ButtonHTMLAttributes, ReactNode } from 'react'
import cn from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient' | 'accent'

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
      'bg-[#1C1917] text-[#FAF7F2] shadow-sm hover:-translate-y-0.5 hover:bg-[#2E2723] hover:shadow-md active:translate-y-0',
    accent:
      'bg-[#A16207] text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#854D0E] hover:shadow-md active:translate-y-0',
    gradient:
      'bg-gradient-to-r from-[#1C1917] via-[#44403C] to-[#A16207] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#A16207]/20 active:translate-y-0',
    secondary:
      'border border-[#E7E0D8] bg-white text-[#1C1917] shadow-xs hover:-translate-y-0.5 hover:border-[#D6C8B8] hover:bg-[#FAF7F2] active:translate-y-0',
    outline:
      'border border-[#D6C8B8] bg-transparent text-[#1C1917] hover:border-[#A16207] hover:bg-[#FAF7F2] active:scale-[0.99]',
    ghost: 'bg-transparent text-[#594D42] hover:bg-[#F5EFE6] hover:text-[#1C1917] active:scale-[0.99]',
    danger:
      'bg-rose-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0'
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A16207] focus-visible:ring-offset-2',
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
