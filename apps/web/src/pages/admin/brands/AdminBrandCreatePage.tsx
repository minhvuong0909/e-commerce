import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { createBrandApi, type BrandPayload } from '../../../services/brands.services'
import { getApiErrorMessage } from '../../../utils/apiError'
import { ROUTE_PATHS } from '../../../routes/route.paths'

const emptyForm: BrandPayload = {
  name: '',
  hotline: '',
  address: '',
  desc: ''
}

export default function AdminBrandCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<BrandPayload>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field: keyof BrandPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.hotline.trim() || !form.address.trim() || !form.desc.trim()) {
      setError('Vui lòng điền đầy đủ thông tin thương hiệu.')
      return
    }

    try {
      setSubmitting(true)
      await createBrandApi({
        name: form.name.trim(),
        hotline: form.hotline.trim(),
        address: form.address.trim(),
        desc: form.desc.trim()
      })
      toast.success('Tạo thương hiệu thành công')
      navigate(ROUTE_PATHS.ADMIN_BRANDS)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tạo thương hiệu'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Brand editor</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Tạo thương hiệu</h1>
          <p className='mt-2 text-sm text-slate-500'>Thêm thương hiệu mới cho cửa hàng.</p>
        </div>

        <Link to={ROUTE_PATHS.ADMIN_BRANDS} className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại danh sách
        </Link>
      </div>

      {error ? <Alert variant='error' title='Không thể lưu' desc={error} /> : null}

      <form onSubmit={handleSubmit} className='surface-strong max-w-3xl rounded-3xl p-6'>
        <div className='space-y-4'>
          <label className='block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Tên thương hiệu</div>
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder='Ví dụ: Nike'
              className='premium-input'
              required
            />
          </label>

          <label className='block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Hotline</div>
            <input
              value={form.hotline}
              onChange={(e) => updateField('hotline', e.target.value)}
              placeholder='0901234567'
              className='premium-input'
              required
            />
          </label>

          <label className='block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Địa chỉ</div>
            <input
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder='Địa chỉ trụ sở / showroom'
              className='premium-input'
              required
            />
          </label>

          <label className='block'>
            <div className='mb-2 text-sm font-black text-ink-950'>Mô tả</div>
            <textarea
              rows={6}
              value={form.desc}
              onChange={(e) => updateField('desc', e.target.value)}
              placeholder='Mô tả ngắn về thương hiệu...'
              className='w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10'
              required
            />
          </label>
        </div>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
          <Button type='submit' loading={submitting} disabled={submitting}>
            Lưu thương hiệu
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
