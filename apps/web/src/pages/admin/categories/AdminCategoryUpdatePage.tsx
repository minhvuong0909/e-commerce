import { Link, useParams } from 'react-router-dom'

export default function AdminCategoryEditPage() {
  const { id } = useParams()

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-extrabold'>Edit Category #{id}</h1>
        <Link to='/admin/categories' className='font-semibold text-primary'>
          ← Back
        </Link>
      </div>

      <div className='mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
        <input className='w-full rounded-2xl border p-3' defaultValue='Clothes' />

        <textarea className='mt-4 w-full rounded-2xl border p-3' rows={6} defaultValue='Category description demo...' />

        <button className='mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 font-bold text-white'>
          Update Category
        </button>
      </div>
    </div>
  )
}
