export const HeaderBackground = () => {
  return (
    <div className='absolute inset-0 -z-10 overflow-hidden rounded-t-3xl'>
      {/* Gradient */}
      <div className='absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-500' />

      {/* Blob */}
      <div className='absolute -top-24 -left-40 w-[360px] h-[360px] bg-cyan-300 rounded-full blur-[120px] opacity-60' />
      <div className='absolute -top-10 right-0 w-[420px] h-[420px] bg-blue-600 rounded-full blur-[140px] opacity-60' />

      {/* Line pattern */}
      <div className='absolute top-6 left-40 w-64 h-24 border-t border-l border-white/30 rotate-12' />
    </div>
  )
}
