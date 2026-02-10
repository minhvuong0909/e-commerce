import { Link } from 'react-router-dom'

export default function AdminProductCreatePage() {
  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-extrabold'>Create Product</h1>
        <Link to='/admin/products' className='font-semibold text-primary'>
          ← Back
        </Link>
      </div>

      <div className='mt-6 grid gap-6 md:grid-cols-3'>
        <div className='md:col-span-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
          <div className='grid gap-4 md:grid-cols-2'>
            <input className='rounded-2xl border p-3' placeholder='Product name' />
            <input className='rounded-2xl border p-3' placeholder='Price' />
            <input className='rounded-2xl border p-3' placeholder='Stock' />
            <select className='rounded-2xl border p-3'>
              <option>Category</option>
            </select>
            <select className='rounded-2xl border p-3'>
              <option>Brand</option>
            </select>
          </div>

          <textarea className='mt-4 w-full rounded-2xl border p-3' rows={6} placeholder='Description...' />

          <button className='mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 font-bold text-white'>
            Save Product
          </button>
        </div>

        <div className='rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
          <div className='font-bold'>Media Upload (demo)</div>
          <div className='mt-3 h-40 rounded-2xl border border-dashed flex items-center justify-center text-gray-500'>
            + Upload Images / Videos
          </div>
        </div>
      </div>
    </div>
  )
}
