import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { getCategoryByIdApi, updateCategoryApi, type CategoryPayload } from '../../../services/categories.services'
import { getApiErrorMessage } from '../../../utils/apiError'
import { ROUTE_PATHS } from '../../../routes/route.paths'

export default function AdminCategoryEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<CategoryPayload>({ name: '', desc: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await getCategoryByIdApi(id)
        const category = res.data.result
        setForm({ name: category.name || '', desc: category.desc || '' })
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không tải được danh mục'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError('')

    try {
      setSubmitting(true)
      await updateCategoryApi(id, { name: form.name.trim(), desc: form.desc.trim() })
      toast.success('Cập nhật danh mục thành công')
      navigate(ROUTE_PATHS.ADMIN_CATEGORIES)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật danh mục'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-[280px] flex-col items-center justify-center gap-3'>
        <RefreshCw className='h-8 w-8 animate-spin text-brand-600' />
        <p className='text-sm font-semibold text-slate-500'>Đang tải danh mục...</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Category editor</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Chỉnh sửa danh mục</h1>
        </div>
        <Link to={ROUTE_PATHS.ADMIN_CATEGORIES} className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại
        </Link>
      </div>

      {error ? <Alert variant='error' title='Lỗi' desc={error} /> : null}

      <form onSubmit={handleSubmit} className='surface-strong max-w-3xl rounded-3xl p-6'>
        <label className='block'>
          <div className='mb-2 text-sm font-black text-ink-950'>Tên danh mục</div>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
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
            className='w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-950 outline-none transition focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10'
            required
          />
        </label>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
          <Button type='submit' loading={submitting} disabled={submitting}>
            Cập nhật
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
