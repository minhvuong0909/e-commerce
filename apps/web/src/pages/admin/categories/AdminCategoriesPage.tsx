import { Link } from 'react-router-dom'
import AdminTableShell from '../../../components/ui/AdminTable'
const categories = [
  { id: 1, name: 'Clothes', productsCount: 10 },
  { id: 2, name: 'Shoes', productsCount: 0 },
  { id: 3, name: 'Bags', productsCount: 4 }
]

export default function AdminCategoriesPage() {
  const handleDelete = (c: (typeof categories)[number]) => {
    // RULE: Không được xoá nếu có product
    if (c.productsCount > 0) {
      alert('❌ Không thể xoá Category vì đang có Product thuộc Category này.')
      return
    }
    alert('✅ Xoá thành công (demo).')
  }

  return (
    <AdminTableShell title='Categories' createTo='/admin/categories/create'>
      <table className='w-full text-sm'>
        <thead className='bg-gray-50 text-gray-600'>
          <tr>
            <th className='p-4 text-left'>Category</th>
            <th className='p-4 text-left'>Products</th>
            <th className='p-4 text-left'>Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className='border-t'>
              <td className='p-4 font-semibold'>{c.name}</td>
              <td className='p-4'>
                <span
                  className={[
                    'rounded-full px-3 py-1 font-semibold',
                    c.productsCount > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                  ].join(' ')}
                >
                  {c.productsCount}
                </span>
              </td>

              <td className='p-4'>
                <div className='flex gap-2'>
                  <Link
                    to={`/admin/categories/${c.id}/edit`}
                    className='rounded-xl border px-3 py-1 font-semibold hover:bg-gray-50'
                  >
                    ✏️ Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(c)}
                    className='rounded-xl border px-3 py-1 font-semibold hover:bg-gray-50'
                  >
                    🗑 Delete
                  </button>
                </div>

                {c.productsCount > 0 && (
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
