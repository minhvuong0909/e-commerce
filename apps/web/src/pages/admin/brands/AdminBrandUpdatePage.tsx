import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { getBrandByIdApi, updateBrandApi, type BrandPayload } from '../../../services/brands.services'
import { getApiErrorMessage } from '../../../utils/apiError'
import { ROUTE_PATHS } from '../../../routes/route.paths'

export default function AdminBrandEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<BrandPayload>({ name: '', hotline: '', address: '', desc: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await getBrandByIdApi(id)
        const brand = res.data.result
        setForm({
          name: brand.name || '',
          hotline: brand.hotline || '',
          address: brand.address || '',
          desc: brand.desc || ''
        })
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không tải được thương hiệu'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const updateField = (field: keyof BrandPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError('')

    try {
      setSubmitting(true)
      await updateBrandApi(id, {
        name: form.name.trim(),
        hotline: form.hotline.trim(),
        address: form.address.trim(),
        desc: form.desc.trim()
      })
      toast.success('Cập nhật thương hiệu thành công')
      navigate(ROUTE_PATHS.ADMIN_BRANDS)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật thương hiệu'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-[280px] flex-col items-center justify-center gap-3'>
        <RefreshCw className='h-8 w-8 animate-spin text-brand-600' />
        <p className='text-sm font-semibold text-slate-500'>Đang tải thương hiệu...</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Brand editor</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Chỉnh sửa thương hiệu</h1>
        </div>
        <Link to={ROUTE_PATHS.ADMIN_BRANDS} className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại
        </Link>
      </div>

      {error ? <Alert variant='error' title='Lỗi' desc={error} /> : null}

      <form onSubmit={handleSubmit} className='surface-strong max-w-3xl rounded-3xl p-6'>
        <div className='space-y-4'>
          <label className='block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Tên thương hiệu</div>
            <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className='premium-input' required />
          </label>

          <label className='block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Hotline</div>
            <input value={form.hotline} onChange={(e) => updateField('hotline', e.target.value)} className='premium-input' required />
          </label>

          <label className='block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Địa chỉ</div>
            <input value={form.address} onChange={(e) => updateField('address', e.target.value)} className='premium-input' required />
          </label>

          <label className='block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Mô tả</div>
            <textarea
              rows={6}
              value={form.desc}
              onChange={(e) => updateField('desc', e.target.value)}
              className='w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-950 outline-none transition focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10'
              required
            />
          </label>
        </div>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
          <Button type='submit' loading={submitting} disabled={submitting}>
            Cập nhật
          </Button>
          <Link
            to={ROUTE_PATHS.ADMIN_BRANDS}
            className='inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-ink-950 shadow-sm transition hover:border-slate-300 hover:shadow-card'
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  )
}
