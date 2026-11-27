import { useMemo, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, RefreshCw, Search, TicketPercent, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import AdminTableShell from '../../../components/ui/AdminTable'
import Button from '../../../components/ui/Button'
import { useConfirm } from '../../../components/ui/ConfirmDialog'
import {
  createVoucherApi,
  deleteVoucherApi,
  getVouchersApi,
  updateVoucherApi,
  type Voucher,
  type VoucherPayload
} from '../../../services/vouchers.services'
import { getApiErrorMessage } from '../../../utils/apiError'
import money from '../../../utils/money'
import cn from '../../../utils/cn'

const QUERY_KEY = ['admin-vouchers']

type Status = 'active' | 'scheduled' | 'expired' | 'exhausted' | 'disabled'

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  active: { label: 'Đang chạy', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  scheduled: { label: 'Sắp diễn ra', cls: 'bg-lilac-50 text-lilac-700 ring-lilac-200' },
  expired: { label: 'Hết hạn', cls: 'bg-ink-100 text-ink-600 ring-ink-200' },
  exhausted: { label: 'Hết lượt', cls: 'bg-peach-50 text-peach-700 ring-peach-200' },
  disabled: { label: 'Đã tắt', cls: 'bg-ink-100 text-ink-500 ring-ink-200' }
}

function statusOf(v: Voucher, now = Date.now()): Status {
  if (!v.active) return 'disabled'
  if (v.ends_at && new Date(v.ends_at).getTime() < now) return 'expired'
  if (v.starts_at && new Date(v.starts_at).getTime() > now) return 'scheduled'
  if (v.usage_limit > 0 && v.used_count >= v.usage_limit) return 'exhausted'
  return 'active'
}

const describeDiscount = (v: Pick<Voucher, 'discount_type' | 'discount_value' | 'max_discount_value'>) =>
  v.discount_type === 'percent'
    ? `Giảm ${v.discount_value}%${v.max_discount_value ? `, tối đa ${money(v.max_discount_value)}` : ''}`
    : `Giảm ${money(v.discount_value)}`

/** ISO → value for <input type="datetime-local"> in the browser's local time. */
const toLocalInput = (iso?: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null)
const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

type FormState = {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: string
  max_discount_value: string
  min_order_value: string
  usage_limit: string
  starts_at: string
  ends_at: string
  active: boolean
}

const EMPTY_FORM: FormState = {
  code: '',
  discount_type: 'percent',
  discount_value: '10',
  max_discount_value: '',
  min_order_value: '0',
  usage_limit: '0',
  starts_at: '',
  ends_at: '',
  active: true
}

const fromVoucher = (v: Voucher): FormState => ({
  code: v.code,
  discount_type: v.discount_type,
  discount_value: String(v.discount_value),
  max_discount_value: v.max_discount_value ? String(v.max_discount_value) : '',
  min_order_value: String(v.min_order_value || 0),
  usage_limit: String(v.usage_limit || 0),
  starts_at: toLocalInput(v.starts_at),
  ends_at: toLocalInput(v.ends_at),
  active: v.active
})

const toPayload = (f: FormState): VoucherPayload => ({
  code: f.code.trim().toUpperCase(),
  discount_type: f.discount_type,
  discount_value: Number(f.discount_value),
  max_discount_value: f.discount_type === 'percent' && f.max_discount_value ? Number(f.max_discount_value) : null,
  min_order_value: Number(f.min_order_value || 0),
  usage_limit: Number(f.usage_limit || 0),
  starts_at: fromLocalInput(f.starts_at),
  ends_at: fromLocalInput(f.ends_at),
  active: f.active
})

function VoucherForm({ initial, onClose }: { initial: Voucher | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(initial ? fromVoucher(initial) : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))
  const codeLocked = Boolean(initial && initial.used_count > 0)
  const preview = Number(form.discount_value) > 0 ? describeDiscount({ discount_type: form.discount_type, discount_value: Number(form.discount_value), max_discount_value: Number(form.max_discount_value) || null }) : ''

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = toPayload(form)
      if (initial) {
        if (codeLocked) {
          const { code: _code, ...rest } = payload
          void _code
          await updateVoucherApi(initial._id, rest)
        } else await updateVoucherApi(initial._id, payload)
        toast.success(`Đã cập nhật voucher ${payload.code}`)
      } else {
        await createVoucherApi(payload)
        toast.success(`Đã tạo voucher ${payload.code}`)
      }
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      onClose()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không lưu được voucher'))
    } finally {
      setSaving(false)
    }
  }

  const field = 'premium-input'
  const label = 'mb-1.5 block text-sm font-semibold text-ink-800'

  return (
    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-ink-950/40 p-0 sm:items-center sm:p-4' onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='voucher-form-title'
        className='max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl'
      >
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h2 id='voucher-form-title' className='font-display text-xl font-bold'>
              {initial ? `Sửa voucher ${initial.code}` : 'Tạo voucher mới'}
            </h2>
            {preview ? <p className='mt-1 text-sm text-berry-700'>{preview}</p> : null}
          </div>
          <button type='button' onClick={onClose} aria-label='Đóng' className='grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100'>
            <X size={18} />
          </button>
        </div>

        <div className='mt-6 grid gap-4 sm:grid-cols-2'>
          <div className='sm:col-span-2'>
            <label htmlFor='v-code' className={label}>
              Mã voucher
            </label>
            <input
              id='v-code'
              required
              value={form.code}
              disabled={codeLocked}
              onChange={(e) => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              maxLength={32}
              placeholder='VD: GLOW10'
              className={cn(field, 'font-mono uppercase tracking-wider', codeLocked && 'bg-ink-50 text-ink-500')}
            />
            <p className='mt-1 text-xs text-ink-500'>
              {codeLocked ? 'Voucher đã được dùng nên không đổi được mã.' : '3–32 ký tự: chữ, số, "-" và "_".'}
            </p>
          </div>

          <fieldset className='sm:col-span-2'>
            <legend className={label}>Loại giảm giá</legend>
            <div className='inline-flex rounded-lg bg-ink-100 p-1'>
              {(['percent', 'fixed'] as const).map((t) => (
                <button
                  key={t}
                  type='button'
                  aria-pressed={form.discount_type === t}
                  onClick={() => setForm((f) => ({ ...f, discount_type: t, discount_value: t === 'percent' ? '10' : '50000' }))}
                  className={cn('h-9 rounded-md px-4 text-sm font-semibold transition', form.discount_type === t ? 'bg-white text-berry-700 shadow-xs' : 'text-ink-600')}
                >
                  {t === 'percent' ? 'Theo %' : 'Số tiền cố định'}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor='v-value' className={label}>
              {form.discount_type === 'percent' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (đ)'}
            </label>
            <input
              id='v-value'
              type='number'
              required
              min={form.discount_type === 'percent' ? 1 : 1000}
              max={form.discount_type === 'percent' ? 100 : 100_000_000}
              step={form.discount_type === 'percent' ? 1 : 1000}
              value={form.discount_value}
              onChange={(e) => set('discount_value', e.target.value)}
              className={field}
            />
          </div>
          {form.discount_type === 'percent' ? (
            <div>
              <label htmlFor='v-cap' className={label}>
                Giảm tối đa (đ) <span className='font-normal text-ink-500'>tùy chọn</span>
              </label>
              <input
                id='v-cap'
                type='number'
                min={0}
                step={1000}
                value={form.max_discount_value}
                onChange={(e) => set('max_discount_value', e.target.value)}
                placeholder='Không giới hạn'
                className={field}
              />
            </div>
          ) : (
            <div />
          )}

          <div>
            <label htmlFor='v-min' className={label}>
              Đơn tối thiểu (đ)
            </label>
            <input id='v-min' type='number' min={0} step={1000} value={form.min_order_value} onChange={(e) => set('min_order_value', e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor='v-limit' className={label}>
              Tổng lượt dùng <span className='font-normal text-ink-500'>0 = không giới hạn</span>
            </label>
            <input
              id='v-limit'
              type='number'
              min={initial?.used_count ? initial.used_count : 0}
              step={1}
              value={form.usage_limit}
              onChange={(e) => set('usage_limit', e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label htmlFor='v-start' className={label}>
              Bắt đầu <span className='font-normal text-ink-500'>tùy chọn</span>
            </label>
            <input id='v-start' type='datetime-local' value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor='v-end' className={label}>
              Kết thúc <span className='font-normal text-ink-500'>tùy chọn</span>
            </label>
            <input id='v-end' type='datetime-local' value={form.ends_at} min={form.starts_at || undefined} onChange={(e) => set('ends_at', e.target.value)} className={field} />
          </div>

          <label className='flex cursor-pointer items-center gap-3 sm:col-span-2'>
            <input type='checkbox' checked={form.active} onChange={(e) => set('active', e.target.checked)} className='h-5 w-5 accent-berry-600' />
            <span className='text-sm font-semibold'>Cho phép sử dụng</span>
          </label>
        </div>

        <div className='mt-8 flex justify-end gap-2'>
          <Button variant='ghost' onClick={onClose}>
            Hủy
          </Button>
          <Button type='submit' loading={saving}>
            {initial ? 'Lưu thay đổi' : 'Tạo voucher'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function AdminVouchersPage() {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Voucher | 'new' | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => (await getVouchersApi()).data.result ?? []
  })

  const vouchers = useMemo(() => {
    const q = search.trim().toUpperCase()
    return q ? data.filter((v) => v.code.includes(q)) : data
  }, [data, search])

  const counts = useMemo(() => {
    const c: Record<Status, number> = { active: 0, scheduled: 0, expired: 0, exhausted: 0, disabled: 0 }
    data.forEach((v) => (c[statusOf(v)] += 1))
    return c
  }, [data])

  const toggle = async (v: Voucher) => {
    try {
      setBusyId(v._id)
      await updateVoucherApi(v._id, { active: !v.active })
      toast.success(v.active ? `Đã tắt ${v.code}` : `Đã bật ${v.code}`)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không cập nhật được voucher'))
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (v: Voucher) => {
    if (!(await confirm(`Xóa voucher ${v.code}? Hành động không thể hoàn tác.`, { danger: true, confirmLabel: 'Xóa' }))) return
    try {
      setBusyId(v._id)
      await deleteVoucherApi(v._id)
      toast.success(`Đã xóa ${v.code}`)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không xóa được voucher'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminTableShell title='Voucher' subTitle='Tạo mã giảm giá, đặt thời hạn, giới hạn lượt dùng và theo dõi số lượt đã dùng.'>
      <div className='space-y-5'>
        <div className='surface-card space-y-3 rounded-3xl p-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <div className='relative w-full sm:max-w-xs'>
              <Search size={16} className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400' aria-hidden />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Tìm theo mã...' aria-label='Tìm voucher' className='premium-input pl-10 uppercase' />
            </div>
            <div className='flex shrink-0 gap-2 sm:ml-auto'>
              <Button variant='secondary' onClick={() => refetch()} disabled={isFetching} aria-label='Làm mới'>
                <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              </Button>
              <Button className='whitespace-nowrap' onClick={() => setEditing('new')}>
                <Plus size={16} /> Tạo voucher
              </Button>
            </div>
          </div>
          {data.length ? (
            <div className='flex flex-wrap items-center gap-2 text-xs'>
              {(Object.keys(STATUS_META) as Status[]).map((s) =>
                counts[s] ? (
                  <span key={s} className={cn('whitespace-nowrap rounded-full px-2.5 py-1 font-semibold ring-1', STATUS_META[s].cls)}>
                    {STATUS_META[s].label}: {counts[s]}
                  </span>
                ) : null
              )}
            </div>
          ) : null}
        </div>

        {isError ? (
          <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>Không tải được danh sách voucher.</div>
        ) : null}

        <div className='surface-strong overflow-x-auto rounded-3xl'>
          <table className='w-full min-w-[860px] text-sm'>
            <thead>
              <tr className='border-b border-ink-200 bg-ink-50/80 text-left text-xs font-semibold uppercase tracking-[0.1em] text-ink-500'>
                <th className='px-5 py-3.5'>Mã</th>
                <th className='px-5 py-3.5'>Ưu đãi</th>
                <th className='px-5 py-3.5'>Điều kiện</th>
                <th className='px-5 py-3.5'>Lượt dùng</th>
                <th className='px-5 py-3.5'>Thời hạn</th>
                <th className='px-5 py-3.5'>Trạng thái</th>
                <th className='px-5 py-3.5 text-right'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className='px-5 py-10'>
                    <div className='h-24 animate-pulse rounded-2xl bg-ink-100' />
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className='px-5 py-14 text-center'>
                    <TicketPercent size={28} className='mx-auto text-ink-300' aria-hidden />
                    <p className='mt-3 font-semibold'>{search ? 'Không có voucher khớp' : 'Chưa có voucher nào'}</p>
                    {!search ? (
                      <Button className='mt-4' onClick={() => setEditing('new')}>
                        <Plus size={16} /> Tạo voucher đầu tiên
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const st = statusOf(v)
                  const pct = v.usage_limit > 0 ? Math.min(100, Math.round((v.used_count / v.usage_limit) * 100)) : 0
                  return (
                    <tr key={v._id} className='border-b border-ink-100 last:border-0 hover:bg-ink-50/60'>
                      <td className='px-5 py-4 font-mono font-bold tracking-wider text-ink-950'>{v.code}</td>
                      <td className='px-5 py-4 text-ink-800'>{describeDiscount(v)}</td>
                      <td className='px-5 py-4 text-ink-600'>{v.min_order_value ? `Đơn từ ${money(v.min_order_value)}` : 'Mọi đơn'}</td>
                      <td className='px-5 py-4'>
                        <span className='font-semibold'>{v.used_count}</span>
                        <span className='text-ink-500'> / {v.usage_limit > 0 ? v.usage_limit : '∞'}</span>
                        {v.usage_limit > 0 ? (
                          <div className='mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-ink-100'>
                            <div className='h-full rounded-full bg-berry-500' style={{ width: `${pct}%` }} />
                          </div>
                        ) : null}
                      </td>
                      <td className='px-5 py-4 text-xs text-ink-600'>
                        <div>Từ: {shortDate(v.starts_at)}</div>
                        <div>Đến: {shortDate(v.ends_at)}</div>
                      </td>
                      <td className='px-5 py-4'>
                        <span className={cn('whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1', STATUS_META[st].cls)}>{STATUS_META[st].label}</span>
                      </td>
                      <td className='px-5 py-4'>
                        <div className='flex items-center justify-end gap-1.5'>
                          <button
                            type='button'
                            role='switch'
                            aria-checked={v.active}
                            aria-label={v.active ? `Tắt ${v.code}` : `Bật ${v.code}`}
                            disabled={busyId === v._id}
                            onClick={() => toggle(v)}
                            className={cn('relative h-6 w-11 rounded-full transition disabled:opacity-50', v.active ? 'bg-berry-600' : 'bg-ink-300')}
                          >
                            <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition', v.active ? 'left-[1.375rem]' : 'left-0.5')} />
                          </button>
                          <button type='button' onClick={() => setEditing(v)} aria-label={`Sửa ${v.code}`} className='grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-950'>
                            <Pencil size={16} />
                          </button>
                          <button
                            type='button'
                            onClick={() => remove(v)}
                            disabled={busyId === v._id || v.used_count > 0}
                            aria-label={`Xóa ${v.code}`}
                            title={v.used_count > 0 ? 'Voucher đã được dùng — hãy tắt thay vì xóa' : 'Xóa'}
                            className='grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? <VoucherForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} /> : null}
    </AdminTableShell>
  )
}
