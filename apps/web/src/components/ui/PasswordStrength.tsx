import { useMemo } from 'react'
import cn from '../../utils/cn'
import { evaluatePasswordStrength } from '../../utils/passwordStrength'

const BAR: Record<number, string> = { 1: 'bg-rose-500', 2: 'bg-peach-500', 3: 'bg-lime-500', 4: 'bg-emerald-500' }
const TEXT: Record<number, string> = {
  1: 'text-rose-600',
  2: 'text-peach-700',
  3: 'text-lime-700',
  4: 'text-emerald-700'
}

type PasswordStrengthProps = {
  password: string
  /** kept for backwards compatibility; both variants share one look */
  variant?: 'default' | 'cosmetics'
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label } = useMemo(() => evaluatePasswordStrength(password), [password])
  if (!password) return null

  return (
    <div className='space-y-1.5' aria-live='polite'>
      <div className='flex gap-1.5' aria-hidden='true'>
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn('h-1.5 flex-1 rounded-full transition-colors', level <= score ? BAR[score] : 'bg-ink-100')}
          />
        ))}
      </div>
      <p className={cn('text-xs font-semibold', TEXT[score])}>
        Độ mạnh mật khẩu: <span className='font-bold'>{label}</span>
      </p>
    </div>
  )
}
