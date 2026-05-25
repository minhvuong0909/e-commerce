import { Link, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'

export default function AdminCategoryEditPage() {
  const { id } = useParams()

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Category editor</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Chỉnh sửa danh mục #{id}</h1>
        </div>
        <Link to='/admin/categories' className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại
        </Link>
      </div>

      <section className='surface-strong rounded-3xl p-6'>
        <label className='block'>
          <div className='mb-2 text-sm font-black text-ink-950'>Tên danh mục</div>
          <input className='premium-input' defaultValue='Clothes' />
        </label>

        <label className='mt-4 block'>
          <div className='mb-2 text-sm font-black text-ink-950'>Mô tả</div>
          <textarea
            className='w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-950 outline-none transition focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10'
            rows={6}
            defaultValue='Category description demo...'
          />
        </label>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
          <Button>Update Category</Button>
          <Link
            to='/admin/categories'
            className='inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-ink-950 shadow-sm transition hover:border-slate-300 hover:shadow-card'
          >
            Hủy
          </Link>
        </div>
      </section>
    </div>
  )
}
