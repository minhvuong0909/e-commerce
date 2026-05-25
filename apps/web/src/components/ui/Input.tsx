import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import cn from '../../utils/cn'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
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
        <label htmlFor={id} className='text-sm font-bold text-ink-900'>
          {label}
        </label>
      ) : null}

      <div className='relative'>
        {leftIcon ? <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'>{leftIcon}</div> : null}

        <input
          id={id}
          type={finalType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'premium-input',
            leftIcon ? 'pl-11' : '',
            rightSlot || isPassword ? 'pr-12' : '',
            disabled ? 'cursor-not-allowed opacity-60' : '',
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' : '',
            className
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type='button'
            onClick={() => setShowPass((s) => !s)}
            className='absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-ink-950'
            aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        ) : null}

        {!isPassword && rightSlot ? <div className='absolute right-3 top-1/2 -translate-y-1/2'>{rightSlot}</div> : null}
      </div>

      {error ? (
        <p className='text-xs font-semibold text-rose-600'>{error}</p>
      ) : helperText ? (
        <p className='text-xs font-medium text-slate-500'>{helperText}</p>
      ) : null}
    </div>
  )
}
