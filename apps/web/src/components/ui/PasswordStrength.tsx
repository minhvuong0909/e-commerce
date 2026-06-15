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

const BAR_STYLES_COSMETICS: Record<number, string> = {
  1: 'bg-rose-400',
  2: 'bg-[#d4a574]',
  3: 'bg-[#b07a72]',
  4: 'bg-[#6b8f71]'
}

const TEXT_STYLES_COSMETICS: Record<number, string> = {
  1: 'text-rose-600',
  2: 'text-[#a67c52]',
  3: 'text-[#8f5f58]',
  4: 'text-[#6b8f71]'
}

type PasswordStrengthProps = {
  password: string
  variant?: 'default' | 'cosmetics'
}

export default function PasswordStrength({ password, variant = 'default' }: PasswordStrengthProps) {
  const { score, label } = useMemo(() => evaluatePasswordStrength(password), [password])
  const isCosmetics = variant === 'cosmetics'
  const barStyles = isCosmetics ? BAR_STYLES_COSMETICS : BAR_STYLES
  const textStyles = isCosmetics ? TEXT_STYLES_COSMETICS : TEXT_STYLES
  const emptyBar = isCosmetics ? 'bg-[#eaded8]' : 'bg-slate-200'

  if (!password) return null

  return (
    <div className='space-y-1.5' aria-live='polite'>
      <div className='flex gap-1.5' aria-hidden='true'>
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              level <= score ? barStyles[score] : emptyBar
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-semibold', textStyles[score])}>
        Độ mạnh mật khẩu: <span className='font-bold'>{label}</span>
      </p>
    </div>
  )
}
