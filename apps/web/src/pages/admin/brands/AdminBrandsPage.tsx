import { Link } from 'react-router-dom'
import AdminTableShell from '../../../components/ui/AdminTable'

const brands = [
  { id: 1, name: 'Nike', productsCount: 12 },
  { id: 2, name: 'Adidas', productsCount: 0 },
  { id: 3, name: 'Puma', productsCount: 5 }
]

export default function AdminBrandsPage() {
  return (
    <AdminTableShell
      title='Thương hiệu'
      subTitle='Quản lý danh sách thương hiệu và sản phẩm liên kết.'
      createTo='/admin/brands/create'
      createLabel='Thêm thương hiệu'
      searchPlaceholder='Tìm theo tên thương hiệu...'
    >
      <table className='w-full text-sm'>
        <thead className='border-b border-white/10 bg-black/20 text-white/60'>
          <tr>
            <th className='p-4 text-left font-semibold'>Thương hiệu</th>
            <th className='p-4 text-left font-semibold'>Số sản phẩm</th>
            <th className='p-4 text-right font-semibold'>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {brands.map((b) => {
            const canDelete = b.productsCount === 0

            return (
              <tr key={b.id} className='border-b border-white/5 transition hover:bg-white/5'>
                {/* NAME */}
                <td className='p-4 font-extrabold'>{b.name}</td>

                {/* COUNT */}
                <td className='p-4'>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-xs font-extrabold',
                      b.productsCount > 0 ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-white/70'
                    ].join(' ')}
                  >
                    {b.productsCount} sản phẩm
                  </span>
                </td>

                {/* ACTION */}
                <td className='p-4'>
                  <div className='flex justify-end gap-2'>
                    <Link
                      to={`/admin/brands/${b.id}/edit`}
                      className='rounded-2xl bg-white/5 px-4 py-2 font-semibold text-white/80 transition hover:bg-white/10 hover:text-white'
                    >
                      Sửa
                    </Link>

                    <button
                      disabled={!canDelete}
                      className={[
                        'rounded-2xl px-4 py-2 font-semibold transition',
                        canDelete
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          : 'cursor-not-allowed bg-white/5 text-white/30'
                      ].join(' ')}
                      title={canDelete ? 'Xoá thương hiệu' : 'Không thể xoá khi còn sản phẩm'}
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </AdminTableShell>
  )
}
