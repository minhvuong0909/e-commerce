import { ImagePlus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'

export default function AdminProductEditPage() {
  const { id } = useParams()
  const nav = useNavigate()

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Product editor</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Chỉnh sửa sản phẩm</h1>
          <p className='mt-2 text-sm text-slate-500'>Cập nhật thông tin, giá bán và tồn kho cho sản phẩm #{id}.</p>
        </div>

        <Link to='/admin/products' className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại danh sách
        </Link>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <section className='surface-strong rounded-3xl p-6 md:col-span-2'>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormField label='Tên sản phẩm' className='md:col-span-2' defaultValue='Áo thun nam basic' />
            <FormField label='SKU' defaultValue='TSHIRT-001' />
            <label className='block'>
              <div className='mb-2 text-sm font-black text-ink-950'>Trạng thái</div>
              <select className='premium-input'>
                <option>Đang bán</option>
                <option>Ngừng bán</option>
              </select>
            </label>
            <FormField label='Giá bán (VND)' type='number' defaultValue='199000' />
            <FormField label='Tồn kho' type='number' defaultValue='20' />
            <label className='block'>
              <div className='mb-2 text-sm font-black text-ink-950'>Danh mục</div>
              <select className='premium-input'>
                <option>Thời trang</option>
                <option>Giày dép</option>
                <option>Phụ kiện</option>
              </select>
            </label>
            <label className='block'>
              <div className='mb-2 text-sm font-black text-ink-950'>Thương hiệu</div>
              <select className='premium-input'>
                <option>Nike</option>
                <option>Adidas</option>
                <option>Puma</option>
              </select>
            </label>
            <FormField label='Slug' className='md:col-span-2' defaultValue='ao-thun-nam-basic' />
          </div>

          <label className='mt-4 block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Mô tả sản phẩm</div>
            <textarea
              rows={6}
              defaultValue='Mô tả sản phẩm demo...'
              className='w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-950 outline-none transition focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10'
            />
          </label>

          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button onClick={() => nav('/admin/products')}>Cập nhật</Button>
            <Link
              to='/admin/products'
              className='inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-ink-950 shadow-sm transition hover:border-slate-300 hover:shadow-card'
            >
              Hủy
            </Link>
          </div>
        </section>

        <aside className='surface-card rounded-3xl p-6'>
          <div className='font-black text-ink-950'>Hình ảnh / Video</div>
          <p className='mt-1 text-sm leading-6 text-slate-500'>Quản lý ảnh hiển thị ngoài trang mua sắm.</p>

          <label className='mt-4 flex h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm font-bold text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'>
            <ImagePlus size={24} />
            <span className='mt-2'>Chọn file</span>
            <input type='file' accept='image/*' multiple className='hidden' />
          </label>

          <div className='mt-4 grid grid-cols-3 gap-3'>
            <div className='h-20 rounded-2xl bg-slate-50' />
            <div className='h-20 rounded-2xl bg-slate-50' />
            <div className='h-20 rounded-2xl bg-slate-50' />
          </div>

          <div className='mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4'>
            <div className='text-sm font-black text-rose-900'>Khu vực nguy hiểm</div>
            <p className='mt-1 text-xs leading-5 text-rose-700'>Không nên xoá sản phẩm nếu đang có đơn hàng liên quan.</p>

            <button className='mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3 text-sm font-black text-white hover:bg-rose-700'>
              <Trash2 size={16} />
              Xóa sản phẩm
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function FormField({
  label,
  className = '',
  type = 'text',
  defaultValue
}: {
  label: string
  className?: string
  type?: string
  defaultValue?: string
}) {
  return (
    <label className={className}>
      <div className='mb-2 text-sm font-black text-ink-950'>{label}</div>
      <input type={type} defaultValue={defaultValue} className='premium-input' />
    </label>
  )
}
