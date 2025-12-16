export const AuthCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div
      className='
    w-full max-w-lg
    rounded-3xl
    bg-slate-800/30
    backdrop-blur-2xl
    border border-slate-200/20
    shadow-[0_30px_60px_rgba(0,0,0,0.18)]
    px-10 py-12
    text-slate-100
      '
    >
      <h2 className='text-2xl font-bold text-center mb-10 tracking-wide'>{title}</h2>
      {children}
    </div>
  )
}
