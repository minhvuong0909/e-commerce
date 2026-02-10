import { Link } from 'react-router-dom'
import AdminTableShell from '../../../components/ui/AdminTable'
const brands = [
  { id: 1, name: 'Nike', productsCount: 12 },
  { id: 2, name: 'Adidas', productsCount: 0 },
  { id: 3, name: 'Puma', productsCount: 5 }
]

export default function AdminBrandsPage() {
  const handleDelete = (b: (typeof brands)[number]) => {
    // RULE: Không được xoá nếu có product
    if (b.productsCount > 0) {
      alert('❌ Không thể xoá Brand vì đang có Product thuộc Brand này.')
      return
    }
    alert('✅ Xoá thành công (demo).')
  }

  return (
    <AdminTableShell title='Brands' createTo='/admin/brands/create'>
      <table className='w-full text-sm'>
        <thead className='bg-gray-50 text-gray-600'>
          <tr>
            <th className='p-4 text-left'>Brand</th>
            <th className='p-4 text-left'>Products</th>
            <th className='p-4 text-left'>Actions</th>
          </tr>
        </thead>

        <tbody>
          {brands.map((b) => (
            <tr key={b.id} className='border-t'>
              <td className='p-4 font-semibold'>{b.name}</td>
              <td className='p-4'>
                <span
                  className={[
                    'rounded-full px-3 py-1 font-semibold',
                    b.productsCount > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                  ].join(' ')}
                >
                  {b.productsCount}
                </span>
              </td>

              <td className='p-4'>
                <div className='flex gap-2'>
                  <Link
                    to={`/admin/brands/${b.id}/edit`}
                    className='rounded-xl border px-3 py-1 font-semibold hover:bg-gray-50'
                  >
                    ✏️ Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(b)}
                    className='rounded-xl border px-3 py-1 font-semibold hover:bg-gray-50'
                  >
                    🗑 Delete
                  </button>
                </div>

                {b.productsCount > 0 && (
                  <div className='mt-2 text-xs text-gray-500'>⚠️ Không thể xoá khi Products &gt; 0</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableShell>
  )
}
