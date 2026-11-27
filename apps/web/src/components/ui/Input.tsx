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
  const errorId = `${id}-error`
  const helperId = `${id}-helper`
  const [showPass, setShowPass] = useState(false)

  const isPassword = type === 'password'
  const finalType = isPassword ? (showPass ? 'text' : 'password') : type
  const describedBy = error ? errorId : helperText ? helperId : undefined

  return (
    <div>
      {label ? (
        <label htmlFor={id} className='field-label'>
          {label}
        </label>
      ) : null}

      <div className='relative'>
        {leftIcon ? (
          <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400'>{leftIcon}</div>
        ) : null}

        <input
          id={id}
          type={finalType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'field',
            leftIcon ? 'pl-11' : null,
            rightSlot || isPassword ? 'pr-12' : null,
            disabled && 'cursor-not-allowed bg-ink-50 opacity-70',
            error && '!border-rose-400',
            className
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type='button'
            onClick={() => setShowPass((s) => !s)}
            className='absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-950'
            aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            aria-pressed={showPass}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}

        {!isPassword && rightSlot ? <div className='absolute right-3 top-1/2 -translate-y-1/2'>{rightSlot}</div> : null}
      </div>

      {error ? (
        <p id={errorId} role='alert' className='mt-1.5 text-xs font-semibold text-rose-600'>
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className='mt-1.5 text-xs text-ink-500'>
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
