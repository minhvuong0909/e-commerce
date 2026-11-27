export default function ProductCardSkeleton() {
  return (
    <div aria-hidden className='flex h-full flex-col'>
      <div className='aspect-[4/5] w-full animate-pulse rounded-3xl bg-ink-100' />
      <div className='mt-3 space-y-2 px-1'>
        <div className='h-3 w-1/3 animate-pulse rounded-full bg-ink-100' />
        <div className='h-4 w-4/5 animate-pulse rounded-full bg-ink-100' />
        <div className='h-5 w-1/3 animate-pulse rounded-full bg-ink-200' />
      </div>
    </div>
  )
}
