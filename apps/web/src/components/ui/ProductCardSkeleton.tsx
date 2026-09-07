export default function ProductCardSkeleton() {
  return (
    <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-[#EFECE6] bg-white p-2 shadow-sm'>
      <div className='relative aspect-square w-full animate-pulse overflow-hidden rounded-xl bg-[#F4EBE6]' />
      <div className='flex flex-1 flex-col p-2 sm:p-3'>
        <div className='h-3 w-1/3 animate-pulse rounded bg-[#EDE0D9]' />
        <div className='mt-2 h-4 w-4/5 animate-pulse rounded bg-[#E8DDD8]' />
        <div className='mt-1.5 h-4 w-3/5 animate-pulse rounded bg-[#E8DDD8]' />
        <div className='mt-3 flex items-center gap-1'>
          <div className='h-3 w-16 animate-pulse rounded bg-[#EDE0D9]' />
        </div>
        <div className='mt-auto pt-4 flex items-center justify-between'>
          <div className='h-5 w-24 animate-pulse rounded bg-[#E2D2C9]' />
          <div className='h-9 w-9 animate-pulse rounded-full bg-[#EDE0D9]' />
        </div>
      </div>
    </div>
  )
}
