import cn from '../../utils/cn'

type BrandMarkProps = {
  className?: string
  tone?: 'dark' | 'light'
  compact?: boolean
}

/** Vibrant Mart wordmark: a "V" monogram tile + lime dot, then the name. */
export default function BrandMark({ className, tone = 'dark', compact = false }: BrandMarkProps) {
  const light = tone === 'light'
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden
        className={cn(
          'relative grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem]',
          light ? 'bg-white text-ink-950' : 'bg-berry-600 text-white'
        )}
      >
        <svg viewBox='0 0 24 24' className='h-5 w-5' fill='currentColor'>
          <path d='M3.5 4h4.2L12 15.6 16.3 4h4.2L14 20h-4z' />
        </svg>
        <span className='absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-lime-300 ring-2 ring-canvas' />
      </span>
      {!compact ? (
        <span
          className={cn(
            'font-display text-[1.35rem] font-extrabold leading-none tracking-tight',
            light ? 'text-white' : 'text-ink-950'
          )}
        >
          vibrant<span className='text-berry-500'>.</span>mart
        </span>
      ) : null}
    </span>
  )
}
