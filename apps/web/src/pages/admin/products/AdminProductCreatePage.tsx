import { Link, useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import { useRef } from 'react'

export default function AdminProductCreatePage() {
  const nav = useNavigate()

  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className='space-y-6'>
      {/* TOP */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold'>Tạo sản phẩm mới</h1>
          <p className='mt-1 text-sm text-white/60'>Thêm sản phẩm vào hệ thống và cập nhật tồn kho.</p>
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
                placeholder='Ví dụ: Áo thun nam basic'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </label>

            {/* SKU */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>SKU</div>
              <input
                placeholder='Ví dụ: TSHIRT-001'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
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
                placeholder='Ví dụ: 299000'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </label>

            {/* STOCK */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Tồn kho</div>
              <input
                type='number'
                placeholder='Ví dụ: 50'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </label>

            {/* CATEGORY */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Danh mục</div>
              <select className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'>
                <option>Chọn danh mục</option>
                <option>Thời trang</option>
                <option>Giày dép</option>
                <option>Phụ kiện</option>
              </select>
            </label>

            {/* BRAND */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Thương hiệu</div>
              <select className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'>
                <option>Chọn thương hiệu</option>
                <option>Vibrant</option>
                <option>Nike</option>
                <option>Adidas</option>
              </select>
            </label>

            {/* SLUG */}
            <label className='block md:col-span-2'>
              <div className='text-sm font-semibold text-white/70'>Slug (tuỳ chọn)</div>
              <input
                placeholder='ao-thun-nam-basic'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
              <p className='mt-1 text-xs text-white/45'>Slug dùng cho URL thân thiện (SEO). Có thể để trống.</p>
            </label>
          </div>

          {/* DESC */}
          <label className='mt-4 block'>
            <div className='text-sm font-semibold text-white/70'>Mô tả sản phẩm</div>
            <textarea
              rows={6}
              placeholder='Nhập mô tả sản phẩm, chất liệu, kích thước, hướng dẫn sử dụng...'
              className='mt-1 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
            />
          </label>

          {/* ACTION */}
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button full variant='gradient' onClick={() => nav('/admin/products')}>
              Lưu sản phẩm
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
          <p className='mt-1 text-sm text-white/60'>Tải lên ảnh sản phẩm để hiển thị ngoài trang mua sắm.</p>

          <div
            onClick={() => fileRef.current?.click()}
            className='mt-4 flex h-40 cursor-pointer items-center justify-center rounded-2xl border border-dashed'
          >
            Bấm để chọn file
          </div>

          <input ref={fileRef} type='file' multiple hidden onChange={(e) => console.log(e.target.files)} />

          {/* PREVIEW MOCK */}
          <div className='mt-4 grid grid-cols-3 gap-3'>
            <div className='h-20 rounded-2xl bg-white/5' />
            <div className='h-20 rounded-2xl bg-white/5' />
            <div className='h-20 rounded-2xl bg-white/5' />
          </div>
        </div>
      </div>
    </div>
  )
}
