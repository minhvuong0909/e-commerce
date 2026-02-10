import { Link, useParams } from 'react-router-dom'

export default function AdminProductEditPage() {
  const { id } = useParams()

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-extrabold'>Edit Product #{id}</h1>
        <Link to='/admin/products' className='font-semibold text-primary'>
          ← Back
        </Link>
      </div>

      <div className='mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
        <div className='grid gap-4 md:grid-cols-2'>
          <input className='rounded-2xl border p-3' defaultValue='Áo thun nam' />
          <input className='rounded-2xl border p-3' defaultValue='199000' />
          <input className='rounded-2xl border p-3' defaultValue='20' />
          <select className='rounded-2xl border p-3'>
            <option selected>Category: Clothes</option>
          </select>
          <select className='rounded-2xl border p-3'>
            <option selected>Brand: Nike</option>
          </select>
        </div>

        <textarea className='mt-4 w-full rounded-2xl border p-3' rows={6} defaultValue='Mô tả demo...' />

        <button className='mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 font-bold text-white'>
          Update Product
        </button>
      </div>
    </div>
  )
}
