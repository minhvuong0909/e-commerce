import { Link } from 'react-router-dom'

export default function AdminCategoryCreatePage() {
  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-extrabold'>Create Category</h1>
        <Link to='/admin/categories' className='font-semibold text-primary'>
          ← Back
        </Link>
      </div>

      <div className='mt-6 grid gap-6 md:grid-cols-3'>
        <div className='md:col-span-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
          <input className='w-full rounded-2xl border p-3' placeholder='Category name' />

          <textarea className='mt-4 w-full rounded-2xl border p-3' rows={6} placeholder='Description (optional)' />

          <button className='mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 font-bold text-white'>
            Save Category
          </button>
        </div>

        <div className='rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
          <div className='font-bold'>Category Thumbnail</div>
          <div className='mt-3 h-40 rounded-2xl border border-dashed flex items-center justify-center text-gray-500'>
            + Upload Image
          </div>
        </div>
      </div>
    </div>
  )
}
