import React from 'react'

const cn = (...c: (string | undefined | null | false)[]) => c.filter(Boolean).join(' ')

export default function Button({
  children,
  className = '',
  variant = 'gradient', // gradient | secondary | ghost | danger | outline
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
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition focus:outline-none focus:ring-2 focus:ring-orange-500/50'

  const variants = {
    gradient:
      'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/15 hover:opacity-95 active:scale-[0.99]',
    secondary: 'border border-white/10 bg-white/10 text-white hover:bg-white/15 active:scale-[0.99]',
    outline: 'border border-white/15 bg-transparent text-white hover:bg-white/10 active:scale-[0.99]',
    ghost: 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white active:scale-[0.99]',
    danger: 'bg-rose-500/85 text-white shadow-lg shadow-rose-500/15 hover:bg-rose-500 active:scale-[0.99]'
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        base,
        variants[variant],
        full ? 'w-full' : '',
        isDisabled ? 'cursor-not-allowed opacity-60 active:scale-100' : '',
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
  return <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
}
