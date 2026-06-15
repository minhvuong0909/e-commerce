import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { createCategoryApi, type CategoryPayload } from '../../../services/categories.services'
import { getApiErrorMessage } from '../../../utils/apiError'
import { ROUTE_PATHS } from '../../../routes/route.paths'

export default function AdminCategoryCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CategoryPayload>({ name: '', desc: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.desc.trim()) {
      setError('Vui lòng nhập tên và mô tả danh mục.')
      return
    }

    try {
      setSubmitting(true)
      await createCategoryApi({ name: form.name.trim(), desc: form.desc.trim() })
      toast.success('Tạo danh mục thành công')
      navigate(ROUTE_PATHS.ADMIN_CATEGORIES)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tạo danh mục'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Category editor</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Tạo danh mục</h1>
          <p className='mt-2 text-sm text-slate-500'>Thêm danh mục mới để tổ chức sản phẩm.</p>
        </div>
        <Link to={ROUTE_PATHS.ADMIN_CATEGORIES} className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại
        </Link>
      </div>

      {error ? <Alert variant='error' title='Không thể lưu' desc={error} /> : null}

      <form onSubmit={handleSubmit} className='surface-strong max-w-3xl rounded-3xl p-6'>
        <label className='block'>
          <div className='mb-2 text-sm font-black text-ink-950'>Tên danh mục</div>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder='Ví dụ: Chăm sóc da'
            className='premium-input'
            required
          />
        </label>

        <label className='mt-4 block'>
          <div className='mb-2 text-sm font-black text-ink-950'>Mô tả</div>
          <textarea
            rows={6}
            value={form.desc}
            onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
            placeholder='Mô tả ngắn về danh mục...'
            className='w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10'
            required
          />
        </label>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
          <Button type='submit' loading={submitting} disabled={submitting}>
            Lưu danh mục
          </Button>
          <Link
            to={ROUTE_PATHS.ADMIN_CATEGORIES}
            className='inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-ink-950 shadow-sm transition hover:border-slate-300 hover:shadow-card'
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  )
}
