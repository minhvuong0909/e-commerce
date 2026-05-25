import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import Button from '../../../components/ui/Button'

export default function AdminBrandCreatePage() {
  const [logo, setLogo] = useState<string | null>(null)

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Brand editor</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Tạo thương hiệu</h1>
          <p className='mt-2 text-sm text-slate-500'>Thêm thương hiệu mới và quản lý logo hiển thị.</p>
        </div>

        <Link to='/admin/brands' className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại danh sách
        </Link>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <section className='surface-strong rounded-3xl p-6 md:col-span-2'>
          <div className='space-y-4'>
            <label className='block'>
              <div className='mb-2 text-sm font-black text-ink-950'>Tên thương hiệu</div>
              <input placeholder='Ví dụ: Nike' className='premium-input' />
            </label>

            <label className='block'>
              <div className='mb-2 text-sm font-black text-ink-950'>Mô tả thương hiệu</div>
              <textarea
                rows={6}
                placeholder='Mô tả ngắn về thương hiệu, xuất xứ, phong cách...'
                className='w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10'
              />
            </label>
          </div>

          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button>Lưu thương hiệu</Button>
            <Link
              to='/admin/brands'
              className='inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-ink-950 shadow-sm transition hover:border-slate-300 hover:shadow-card'
            >
              Hủy
            </Link>
          </div>
        </section>

        <aside className='surface-card rounded-3xl p-6'>
          <div className='font-black text-ink-950'>Logo thương hiệu</div>
          <p className='mt-1 text-sm leading-6 text-slate-500'>PNG/JPG, nền trong suốt. Kích thước tối thiểu 512x512.</p>

          <label className='mt-4 flex h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm font-bold text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'>
            <ImagePlus size={24} />
            <span className='mt-2'>{logo ? 'Thay đổi logo' : 'Chọn logo'}</span>
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

          {logo ? (
            <div className='mt-4 flex justify-center'>
              <img src={logo} alt='Brand logo preview' className='h-32 w-32 rounded-2xl bg-slate-50 object-contain p-2' />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
