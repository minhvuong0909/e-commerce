import { DatePicker } from 'antd'
import clsx from 'clsx'
import { Dayjs } from 'dayjs'

interface Props {
  label: string
  value?: Dayjs | null
  placeholder?: string
  onChange?: (date: Dayjs | null) => void
}

export const AppDate = ({ label, value, onChange }: Props) => {
  const hasValue = value !== undefined && value !== null

  return (
    <div className='relative'>
      <DatePicker
        value={value}
        onChange={onChange}
        placeholder={label}
        className={clsx(
          `
          peer
          w-full
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
        className={clsx('absolute left-0 ps-3 transition-all text-white/60 pointer-events-none', {
          '-top-3 text-sm text-white': hasValue,
          'top-3 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-white': !hasValue
        })}
      >
        {label}
      </label>
    </div>
  )
}
