import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'

export default function AdminProductEditPage() {
  const { id } = useParams()
  const nav = useNavigate()

  return (
    <div className='space-y-6'>
      {/* TOP */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold'>Chỉnh sửa sản phẩm</h1>
          <p className='mt-1 text-sm text-white/60'>Cập nhật thông tin, giá bán và tồn kho cho sản phẩm #{id}.</p>
        </div>

        <Link to='/admin/products' className='text-sm font-semibold text-white/60 hover:text-white'>
          ← Quay lại danh sách
        </Link>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* FORM */}
        <div className='md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* NAME */}
            <label className='block md:col-span-2'>
              <div className='text-sm font-semibold text-white/70'>Tên sản phẩm</div>
              <input
                defaultValue='Áo thun nam basic'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </label>

            {/* SKU */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>SKU</div>
              <input
                defaultValue='TSHIRT-001'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </label>

            {/* STATUS */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Trạng thái</div>
              <select className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'>
                <option>Đang bán</option>
                <option>Ngừng bán</option>
              </select>
            </label>

            {/* PRICE */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Giá bán (VND)</div>
              <input
                type='number'
                defaultValue='199000'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </label>

            {/* STOCK */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Tồn kho</div>
              <input
                type='number'
                defaultValue='20'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </label>

            {/* CATEGORY */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Danh mục</div>
              <select className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'>
                <option>Thời trang</option>
                <option>Giày dép</option>
                <option>Phụ kiện</option>
              </select>
            </label>

            {/* BRAND */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Thương hiệu</div>
              <select className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'>
                <option>Nike</option>
                <option>Adidas</option>
                <option>Puma</option>
              </select>
            </label>

            {/* SLUG */}
            <label className='block md:col-span-2'>
              <div className='text-sm font-semibold text-white/70'>Slug (tuỳ chọn)</div>
              <input
                defaultValue='ao-thun-nam-basic'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
              <p className='mt-1 text-xs text-white/45'>Slug dùng cho URL thân thiện. Có thể để trống.</p>
            </label>
          </div>

          {/* DESC */}
          <label className='mt-4 block'>
            <div className='text-sm font-semibold text-white/70'>Mô tả sản phẩm</div>
            <textarea
              rows={6}
              defaultValue='Mô tả sản phẩm demo...'
              className='mt-1 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
            />
          </label>

          {/* ACTION */}
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button full variant='gradient' onClick={() => nav('/admin/products')}>
              Cập nhật
            </Button>

            <Link to='/admin/products' className='w-full'>
              <Button full variant='secondary'>
                Huỷ
              </Button>
            </Link>
          </div>
        </div>

        {/* MEDIA */}
        <div className='rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
          <div className='font-extrabold'>Hình ảnh / Video</div>
          <p className='mt-1 text-sm text-white/60'>Quản lý ảnh hiển thị ngoài trang mua sắm.</p>

          <label className='mt-4 flex h-40 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/10 text-sm text-white/60 hover:bg-black/20'>
            Kéo thả hoặc bấm để chọn file
            <input type='file' accept='image/*' multiple className='hidden' />
          </label>

          <div className='mt-4 grid grid-cols-3 gap-3'>
            <div className='h-20 rounded-2xl bg-white/5' />
            <div className='h-20 rounded-2xl bg-white/5' />
            <div className='h-20 rounded-2xl bg-white/5' />
          </div>

          <div className='mt-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4'>
            <div className='text-sm font-extrabold text-rose-200'>Khu vực nguy hiểm</div>
            <p className='mt-1 text-xs text-rose-100/80'>Không nên xoá sản phẩm nếu đang có đơn hàng liên quan.</p>

            <button className='mt-3 w-full rounded-2xl bg-rose-500/20 py-3 text-sm font-extrabold text-rose-200 hover:bg-rose-500/30'>
              Xoá sản phẩm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
