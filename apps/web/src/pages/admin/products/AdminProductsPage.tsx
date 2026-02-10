import { Link } from 'react-router-dom'
import AdminTableShell from '../../../components/ui/AdminTable'

const products = [
  { id: 1, name: 'Áo thun nam', price: 199000, stock: 20, sku: 'TSHIRT-001', brand: 'Vibrant', category: 'Thời trang' },
  { id: 2, name: 'Giày sneaker', price: 499000, stock: 2, sku: 'SNEAKER-002', brand: 'Vibrant', category: 'Giày dép' },
  { id: 3, name: 'Túi xách', price: 799000, stock: 0, sku: 'BAG-003', brand: 'Vibrant', category: 'Phụ kiện' }
]

export default function AdminProductsPage() {
  const money = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

  const stockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className='rounded-full bg-rose-500/20 px-3 py-1 text-xs font-extrabold text-rose-300'>Hết hàng</span>
      )
    }

    if (stock <= 5) {
      return (
        <span className='rounded-full bg-orange-500/20 px-3 py-1 text-xs font-extrabold text-orange-300'>
          Sắp hết ({stock})
        </span>
      )
    }

    return (
      <span className='rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300'>
        Còn {stock}
      </span>
    )
  }

  return (
    <AdminTableShell title='Sản phẩm' createTo='/admin/products/create'>
      {/* TOOLBAR */}
      <div className='mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='w-full md:max-w-sm'>
          <input
            placeholder='Tìm theo tên, SKU...'
            className='h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
          />
        </div>

        <div className='flex gap-2'>
          <select className='h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none'>
            <option>Tất cả danh mục</option>
            <option>Thời trang</option>
            <option>Giày dép</option>
            <option>Phụ kiện</option>
          </select>

          <select className='h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none'>
            <option>Tất cả tồn kho</option>
            <option>Còn hàng</option>
            <option>Sắp hết</option>
            <option>Hết hàng</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className='overflow-hidden border border-white/10'>
        <table className='w-full text-sm'>
          <thead className='border-b border-white/10 bg-black/20 text-white/60'>
            <tr>
              <th className='p-4 text-left font-semibold'>Sản phẩm</th>
              <th className='p-4 text-left font-semibold'>SKU</th>
              <th className='p-4 text-left font-semibold'>Giá</th>
              <th className='p-4 text-left font-semibold'>Tồn kho</th>
              <th className='p-4 text-right font-semibold'>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className='border-b border-white/5 transition hover:bg-white/5'>
                {/* PRODUCT */}
                <td className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-12 w-12 rounded-2xl bg-white/5' />
                    <div>
                      <div className='font-extrabold'>{p.name}</div>
                      <div className='mt-0.5 text-xs text-white/50'>
                        {p.brand} • {p.category}
                      </div>
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className='p-4 text-white/70'>{p.sku}</td>

                {/* PRICE */}
                <td className='p-4 font-bold'>{money(p.price)}</td>

                {/* STOCK */}
                <td className='p-4'>{stockBadge(p.stock)}</td>

                {/* ACTION */}
                <td className='p-4'>
                  <div className='flex justify-end gap-2'>
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className='rounded-2xl bg-white/5 px-4 py-2 font-semibold text-white/80 transition hover:bg-white/10 hover:text-white'
                    >
                      Sửa
                    </Link>

                    <button className='rounded-2xl bg-rose-500/20 px-4 py-2 font-semibold text-rose-300 transition hover:bg-rose-500/30'>
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTableShell>
  )
}
