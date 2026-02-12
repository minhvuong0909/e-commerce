import { Link } from 'react-router-dom'
import { useState } from 'react'
import Button from '../../../components/ui/Button'

export default function AdminBrandCreatePage() {
  const [logo, setLogo] = useState<string | null>(null)

  return (
    <div className='space-y-6'>
      {/* HEADER */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold'>Tạo thương hiệu</h1>
          <p className='mt-1 text-sm text-white/60'>Thêm thương hiệu mới và quản lý logo hiển thị.</p>
        </div>

        <Link to='/admin/brands' className='text-sm font-semibold text-white/60 hover:text-white'>
          ← Quay lại danh sách
        </Link>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* FORM */}
        <div className='md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
          <div className='space-y-4'>
            {/* NAME */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Tên thương hiệu</div>
              <input
                placeholder='Ví dụ: Nike'
                className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </label>

            {/* DESC */}
            <label className='block'>
              <div className='text-sm font-semibold text-white/70'>Mô tả thương hiệu (tuỳ chọn)</div>
              <textarea
                rows={6}
                placeholder='Mô tả ngắn về thương hiệu, xuất xứ, phong cách...'
                className='mt-1 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </label>
          </div>

          {/* ACTION */}
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button full variant='gradient'>
              Lưu thương hiệu
            </Button>

            <Link to='/admin/brands' className='w-full'>
              <Button full variant='secondary'>
                Huỷ
              </Button>
            </Link>
          </div>
        </div>

        {/* LOGO */}
        <div className='rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
          <div className='font-extrabold'>Logo thương hiệu</div>
          <p className='mt-1 text-xs text-white/55'>PNG/JPG, nền trong suốt. Kích thước tối thiểu 512×512.</p>

          {/* UPLOAD */}
          <label className='mt-4 flex h-40 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/10 text-sm text-white/60 hover:bg-black/20'>
            {logo ? 'Thay đổi logo' : 'Kéo thả hoặc bấm để chọn logo'}

            <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setLogo(URL.createObjectURL(file))
              }}
            />
          </label>

          {/* PREVIEW */}
          {logo && (
            <div className='mt-4 flex justify-center'>
              <img
                src={logo}
                alt='Brand logo preview'
                className='h-32 w-32 rounded-2xl object-contain bg-black/20 p-2'
              />
            </div>
          )}

          <p className='mt-3 text-xs text-white/45'>Logo sẽ hiển thị ở trang sản phẩm và bộ lọc thương hiệu.</p>
        </div>
      </div>
    </div>
  )
}
