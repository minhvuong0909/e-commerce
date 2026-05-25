import { Link } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import Button from '../../../components/ui/Button'

export default function AdminCategoryCreatePage() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Category editor</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Tạo danh mục</h1>
          <p className='mt-2 text-sm text-slate-500'>Thêm danh mục mới để tổ chức sản phẩm trong cửa hàng.</p>
        </div>
        <Link to='/admin/categories' className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại
        </Link>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <section className='surface-strong rounded-3xl p-6 md:col-span-2'>
          <label className='block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Tên danh mục</div>
            <input className='premium-input' placeholder='Category name' />
          </label>

          <label className='mt-4 block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Mô tả</div>
            <textarea
              className='w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10'
              rows={6}
              placeholder='Description (optional)'
            />
          </label>

          <div className='mt-6'>
            <Button>Save Category</Button>
          </div>
        </section>

        <aside className='surface-card rounded-3xl p-6'>
          <div className='font-black text-ink-950'>Category Thumbnail</div>
          <div className='mt-4 flex h-40 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-slate-500'>
            <ImagePlus size={24} />
          </div>
        </aside>
      </div>
    </div>
  )
}
