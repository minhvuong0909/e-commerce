import { Link } from 'react-router-dom'
import AdminTableShell from '../../../components/ui/AdminTable'

const products = [
  { id: 1, name: 'Áo thun nam', price: 199000, stock: 20 },
  { id: 2, name: 'Giày sneaker', price: 499000, stock: 0 }
]

export default function AdminProductsPage() {
  return (
    <AdminTableShell title='Products' createTo='/admin/products/create'>
      <table className='w-full text-sm'>
        <thead className='bg-gray-50 text-gray-600'>
          <tr>
            <th className='p-4 text-left'>Name</th>
            <th className='p-4 text-left'>Price</th>
            <th className='p-4 text-left'>Stock</th>
            <th className='p-4 text-left'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className='border-t'>
              <td className='p-4 font-semibold'>{p.name}</td>
              <td className='p-4'>₫ {p.price.toLocaleString()}</td>
              <td className='p-4'>
                {p.stock > 0 ? (
                  <span className='rounded-full bg-green-50 px-3 py-1 text-green-700 font-semibold'>{p.stock}</span>
                ) : (
                  <span className='rounded-full bg-red-50 px-3 py-1 text-red-700 font-semibold'>Out</span>
                )}
              </td>
              <td className='p-4'>
                <div className='flex gap-2'>
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    className='rounded-xl border px-3 py-1 font-semibold hover:bg-gray-50'
                  >
                    ✏️ Edit
                  </Link>
                  <button className='rounded-xl border px-3 py-1 font-semibold hover:bg-gray-50'>🗑 Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableShell>
  )
}
