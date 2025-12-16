import { Input } from 'antd'
import clsx from 'clsx'

interface Props {
  label: string
  type?: string
  name?: string
  value?: string
  placeholder?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const AppInput = ({ label, value, placeholder, type = 'text', ...props }: Props) => {
  const hasValue = value !== undefined && value !== ''

  return (
    <div className='relative'>
      <Input
        {...props}
        type={type}
        value={value}
        placeholder={label}
        className={clsx(
          `
          peer
          !bg-transparent
          !shadow-none
          !border-0
          !border-b-2
          !border-white/40
          text-black/40
          py-3
          placeholder-transparent
          focus:outline-none
        `,
          {
            'focus:!border-white': !hasValue,
            'focus:!border-white/40': hasValue
          }
        )}
      />

      <label
        className={clsx('absolute left-0 ps-3 transition-all text-white/60', {
          '-top-3 text-sm text-white': hasValue,
          'top-3 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-white': !hasValue
        })}
      >
        {label}
      </label>
    </div>
  )
}
