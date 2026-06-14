import { useMemo } from 'react'
import cn from '../../utils/cn'
import { evaluatePasswordStrength } from '../../utils/passwordStrength'

const BAR_STYLES: Record<number, string> = {
  1: 'bg-rose-500',
  2: 'bg-amber-500',
  3: 'bg-lime-500',
  4: 'bg-emerald-500'
}

const TEXT_STYLES: Record<number, string> = {
  1: 'text-rose-600',
  2: 'text-amber-600',
  3: 'text-lime-700',
  4: 'text-emerald-700'
}

export default function PasswordStrength({ password }: { password: string }) {
  const { score, label } = useMemo(() => evaluatePasswordStrength(password), [password])

  if (!password) return null

  return (
    <div className='space-y-1.5' aria-live='polite'>
      <div className='flex gap-1.5' aria-hidden='true'>
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              level <= score ? BAR_STYLES[score] : 'bg-slate-200'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-semibold', TEXT_STYLES[score])}>
        Độ mạnh mật khẩu: <span className='font-black'>{label}</span>
      </p>
    </div>
  )
}
