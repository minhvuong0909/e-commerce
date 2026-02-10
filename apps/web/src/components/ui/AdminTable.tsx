import { Link } from 'react-router-dom'

export default function AdminTableShell({
  title,
  createTo,
  children
}: {
  title: string
  createTo?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold text-gray-900'>{title}</h1>
          <p className='mt-1 text-gray-600'>Demo UI - chưa gắn API.</p>
        </div>

        <div className='flex gap-2'>
          <input
            placeholder='Search...'
            className='w-full md:w-72 rounded-2xl border bg-white px-4 py-2 outline-none focus:ring-4 focus:ring-orange-100'
          />
          {createTo && (
            <Link
              to={createTo}
              className='rounded-2xl px-4 py-2 font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-md'
            >
              + Create
            </Link>
          )}
        </div>
      </div>

      <div className='mt-6 rounded-3xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden'>{children}</div>
    </div>
  )
}
