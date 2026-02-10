import { useId, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'

const cn = (...c: (string | undefined)[]) => c.filter(Boolean).join(' ')

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  disabled?: boolean
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  className = '',
  value,
  onChange,
  error,
  helperText,
  leftIcon,
  rightSlot,
  disabled,
  ...props
}: InputProps) {
  const id = useId()
  const [showPass, setShowPass] = useState(false)

  const isPassword = type === 'password'
  const finalType = isPassword ? (showPass ? 'text' : 'password') : type

  return (
    <div className='space-y-1.5'>
      {label ? (
        <label htmlFor={id} className='text-sm font-semibold text-white/80'>
          {label}
        </label>
      ) : null}

      <div className='relative'>
        {/* Left icon */}
        {leftIcon ? <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white/45'>{leftIcon}</div> : null}

        <input
          id={id}
          type={finalType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-11 w-full rounded-2xl border px-4 text-sm font-medium text-white outline-none transition',
            'bg-white/5 placeholder:text-white/35',
            'border-white/10 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/25',
            leftIcon ? 'pl-10' : '',
            rightSlot || isPassword ? 'pr-12' : '',
            disabled ? 'cursor-not-allowed opacity-60' : '',
            error ? 'border-rose-500/40 focus:border-rose-500/60 focus:ring-rose-500/20' : '',
            className
          )}
          {...props}
        />

        {/* Password toggle */}
        {isPassword ? (
          <button
            type='button'
            onClick={() => setShowPass((s) => !s)}
            className='absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 px-2 py-1 text-xs font-bold text-white/70 hover:bg-white/15 hover:text-white'
          >
            {showPass ? 'Ẩn' : 'Hiện'}
          </button>
        ) : null}

        {/* Right slot */}
        {!isPassword && rightSlot ? <div className='absolute right-3 top-1/2 -translate-y-1/2'>{rightSlot}</div> : null}
      </div>

      {/* Error / helper */}
      {error ? (
        <p className='text-xs font-semibold text-rose-300'>{error}</p>
      ) : helperText ? (
        <p className='text-xs text-white/45'>{helperText}</p>
      ) : null}
    </div>
  )
}
