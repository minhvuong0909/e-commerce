import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Globe2,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Package,
  PenLine,
  RefreshCw,
  Save,
  Shield,
  UserRound,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import SavedAddressesPanel from '../../components/profile/SavedAddressesPanel'
import type { UpdateUserPayload, User } from '../../models/AuthRequests'
import type { OrderUI } from '../../models/OrderRequests'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { getMeApi, logoutApi, updateMeApi } from '../../services/auths.services'
import { useMyOrders } from '../../hooks/useMyOrders'
import { getApiErrorMessage } from '../../utils/apiError'
import { clearAuth, getRefreshToken } from '../../utils/authSession'
import money from '../../utils/money'
import cn from '../../utils/cn'

type ProfileForm = UpdateUserPayload & { name: string; username: string }
type ProfileTab = 'personal' | 'addresses' | 'orders' | 'security'

const TABS: { id: ProfileTab; label: string; icon: typeof UserRound }[] = [
  { id: 'personal', label: 'Thông tin cá nhân', icon: UserRound },
  { id: 'addresses', label: 'Sổ địa chỉ', icon: MapPin },
  { id: 'orders', label: 'Đơn gần đây', icon: Package },
  { id: 'security', label: 'Bảo mật', icon: Shield }
]

function toForm(user: User): ProfileForm {
  return {
    name: user.name,
    username: user.username,
    date_of_birth: user.date_of_birth?.slice(0, 10),
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    avatar: user.avatar || '',
    cover_photo: user.cover_photo || ''
  }
}

function ProfileSkeleton() {
  return (
    <div className='mx-auto grid max-w-[1100px] gap-6 px-4 py-10 md:px-6 lg:grid-cols-[300px_1fr]'>
      <div className='h-80 animate-pulse rounded-4xl bg-ink-100' />
      <div className='h-96 animate-pulse rounded-4xl bg-ink-100' />
    </div>
  )
}

function RecentOrderCard({ order }: { order: OrderUI }) {
  return (
    <Link
      to={ROUTE_PATHS.USER_ORDER_DETAIL(order.id)}
      className='group flex items-center justify-between gap-3 rounded-3xl p-4 ring-1 ring-ink-100 transition hover:ring-berry-300'
    >
      <div className='min-w-0'>
        <p className='font-semibold'>Đơn {order.code}</p>
        <p className='text-sm text-ink-500'>{order.date}</p>
      </div>
      <div className='flex shrink-0 items-center gap-3'>
        <div className='flex flex-col items-end gap-1'>
          <StatusBadge tone={order.status}>{order.statusLabel}</StatusBadge>
          <span className='text-sm font-semibold'>{money(order.total)}</span>
        </div>
        <ChevronRight size={18} className='text-ink-400 transition group-hover:translate-x-0.5' aria-hidden />
      </div>
    </Link>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [updating, setUpdating] = useState(false)

  const {
    data: user,
    isLoading: loading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['profile-me'],
    queryFn: async () => {
      const res = await getMeApi()
      return res.data.result as User
    }
  })

  const { data: orders = [], isLoading: ordersLoading } = useMyOrders()
  const recentOrders = useMemo(() => orders.slice(0, 3), [orders])

  const displayUser = useMemo(() => {
    if (!user) return null
    if (!editing || !form) return user
    return { ...user, ...form }
  }, [user, editing, form])

  const startEditing = () => {
    if (!user) return
    setForm(toForm(user))
    setEditing(true)
    setActiveTab('personal')
  }

  const cancelEditing = () => {
    setEditing(false)
    setForm(null)
  }

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSave = async () => {
    if (!form) return
    try {
      setUpdating(true)
      await updateMeApi({
        name: form.name.trim(),
        username: form.username.trim(),
        date_of_birth: form.date_of_birth,
        bio: form.bio?.trim(),
        location: form.location?.trim(),
        website: form.website?.trim(),
        avatar: form.avatar?.trim(),
        cover_photo: form.cover_photo?.trim()
      })
      toast.success('Cập nhật thông tin thành công')
      setEditing(false)
      setForm(null)
      refetch()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Cập nhật thất bại'))
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    const refresh_token = getRefreshToken()
    if (refresh_token) {
      try {
        await logoutApi(refresh_token)
      } catch {
        // token may already be invalid; local sign-out still proceeds
      }
    }
    clearAuth()
    toast.success('Đăng xuất thành công!')
    navigate(ROUTE_PATHS.AUTH_LOGIN)
  }

  if (loading) return <ProfileSkeleton />

  if (isError || !user || !displayUser) {
    return (
      <div className='mx-auto max-w-lg px-4 py-16'>
        <EmptyState
          icon={<RefreshCw size={26} />}
          title='Không tải được hồ sơ'
          desc='Vui lòng thử lại sau giây lát.'
          action={
            <Button variant='primary' onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  const formatDate = (date: string) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa cập nhật')
  const initials = displayUser.name.trim().charAt(0).toUpperCase() || 'U'

  return (
    <div className='mx-auto max-w-[1100px] px-4 py-8 md:px-6 md:py-12'>
      <div className='grid gap-6 lg:grid-cols-[300px_1fr]'>
        {/* identity + nav */}
        <aside className='h-fit space-y-3 lg:sticky lg:top-36'>
          <div className='relative overflow-hidden rounded-4xl border border-berry-100 bg-berry-50 p-6 text-ink-950'>
            <div className='relative'>
              <div className='h-20 w-20 overflow-hidden rounded-[1.75rem] bg-berry-200 ring-4 ring-white'>
                {displayUser.avatar ? (
                  <img src={displayUser.avatar} alt='' className='h-full w-full object-cover' />
                ) : (
                  <div className='grid h-full place-items-center font-display text-3xl font-bold text-berry-800'>{initials}</div>
                )}
              </div>
              <h1 className='mt-4 font-display text-2xl font-bold leading-tight'>{displayUser.name}</h1>
              <p className='text-sm text-ink-600'>@{displayUser.username}</p>
              {user.verify_status === 1 ? (
                <span className='chip mt-3 bg-lime-300 px-2.5 py-1 text-xs text-ink-950'>
                  <BadgeCheck size={13} aria-hidden /> Đã xác thực
                </span>
              ) : (
                <Link to={ROUTE_PATHS.AUTH_RESEND_VERIFY} className='chip mt-3 bg-peach-200 px-2.5 py-1 text-xs text-ink-950'>
                  Chưa xác thực email →
                </Link>
              )}
            </div>
          </div>

          <nav aria-label='Hồ sơ' className='no-scrollbar flex gap-1 overflow-x-auto rounded-4xl bg-white p-2 ring-1 ring-ink-100 lg:flex-col'>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type='button'
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 cursor-pointer items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-semibold transition',
                  activeTab === id ? 'bg-berry-50 text-berry-700' : 'text-ink-700 hover:bg-ink-50'
                )}
              >
                <Icon size={18} aria-hidden />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* content */}
        <div className='min-w-0'>
          {activeTab === 'personal' ? (
            <section className='rounded-4xl bg-white p-6 ring-1 ring-ink-100 sm:p-8'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div>
                  <h2 className='font-display text-2xl font-bold'>Thông tin cá nhân</h2>
                  <p className='mt-1 text-sm text-ink-500'>Thông tin này giúp shop phục vụ bạn tốt hơn.</p>
                </div>
                {!editing ? (
                  <Button variant='secondary' size='sm' onClick={startEditing}>
                    <PenLine size={15} /> Chỉnh sửa
                  </Button>
                ) : null}
              </div>

              {editing && form ? (
                <div className='mt-6 space-y-4'>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <FormField label='Họ tên' value={form.name} onChange={(v) => updateField('name', v)} />
                    <FormField label='Username' value={form.username} onChange={(v) => updateField('username', v)} />
                    <FormField label='Ngày sinh' type='date' value={form.date_of_birth || ''} onChange={(v) => updateField('date_of_birth', v)} />
                    <FormField label='Địa điểm' value={form.location || ''} onChange={(v) => updateField('location', v)} />
                    <FormField label='Website' value={form.website || ''} onChange={(v) => updateField('website', v)} />
                    <FormField label='Ảnh đại diện (URL)' value={form.avatar || ''} onChange={(v) => updateField('avatar', v)} />
                  </div>
                  <label className='block'>
                    <span className='field-label'>Giới thiệu</span>
                    <textarea rows={4} value={form.bio || ''} onChange={(e) => updateField('bio', e.target.value)} className='field resize-none' />
                  </label>
                  <div className='flex flex-wrap gap-2 pt-2'>
                    <Button onClick={handleSave} loading={updating} variant='accent'>
                      <Save size={16} /> Lưu thay đổi
                    </Button>
                    <Button variant='ghost' onClick={cancelEditing}>
                      <X size={16} /> Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <dl className='mt-6 grid gap-px overflow-hidden rounded-3xl bg-ink-100 ring-1 ring-ink-100 sm:grid-cols-2'>
                  <InfoItem icon={<Mail size={16} />} label='Email' value={user.email} />
                  <InfoItem icon={<CalendarDays size={16} />} label='Ngày sinh' value={formatDate(user.date_of_birth)} />
                  <InfoItem icon={<MapPin size={16} />} label='Địa điểm' value={user.location || 'Chưa cập nhật'} />
                  <InfoItem icon={<Globe2 size={16} />} label='Website' value={user.website || 'Chưa cập nhật'} />
                  {user.bio ? (
                    <div className='bg-white p-5 sm:col-span-2'>
                      <dt className='text-sm text-ink-500'>Giới thiệu</dt>
                      <dd className='mt-1 text-sm leading-relaxed'>{user.bio}</dd>
                    </div>
                  ) : null}
                </dl>
              )}
            </section>
          ) : null}

          {activeTab === 'addresses' ? (
            <section className='rounded-4xl bg-white p-6 ring-1 ring-ink-100 sm:p-8'>
              <h2 className='font-display text-2xl font-bold'>Sổ địa chỉ</h2>
              <p className='mt-1 text-sm text-ink-500'>Địa chỉ đã lưu giúp thanh toán nhanh hơn.</p>
              <div className='mt-6'>
                <SavedAddressesPanel />
              </div>
            </section>
          ) : null}

          {activeTab === 'orders' ? (
            <section className='rounded-4xl bg-white p-6 ring-1 ring-ink-100 sm:p-8'>
              <div className='flex items-center justify-between gap-3'>
                <h2 className='font-display text-2xl font-bold'>Đơn gần đây</h2>
                <Link to={ROUTE_PATHS.USER_ORDERS} className='text-sm font-semibold text-berry-600 hover:underline'>
                  Xem tất cả
                </Link>
              </div>
              <div className='mt-6 space-y-3'>
                {ordersLoading ? (
                  <div className='h-24 animate-pulse rounded-3xl bg-ink-100' />
                ) : recentOrders.length === 0 ? (
                  <div className='rounded-3xl border border-dashed border-ink-200 px-5 py-10 text-center'>
                    <Package size={26} className='mx-auto text-ink-300' aria-hidden />
                    <p className='mt-3 font-semibold'>Chưa có đơn hàng</p>
                    <Link to={ROUTE_PATHS.USER_HOME} className='mt-4 inline-flex h-10 items-center rounded-lg bg-berry-600 px-5 text-sm font-semibold text-white hover:bg-berry-700'>
                      Khám phá sản phẩm
                    </Link>
                  </div>
                ) : (
                  recentOrders.map((order) => <RecentOrderCard key={order.id} order={order} />)
                )}
              </div>
            </section>
          ) : null}

          {activeTab === 'security' ? (
            <section className='rounded-4xl bg-white p-6 ring-1 ring-ink-100 sm:p-8'>
              <h2 className='font-display text-2xl font-bold'>Bảo mật</h2>
              <p className='mt-1 text-sm text-ink-500'>Mật khẩu và phiên đăng nhập.</p>
              <div className='mt-6 grid gap-3 sm:grid-cols-2'>
                <Link
                  to={ROUTE_PATHS.USER_CHANGE_PASSWORD}
                  className='group flex flex-col rounded-3xl bg-lilac-50 p-5 transition hover:bg-lilac-100'
                >
                  <span className='grid h-11 w-11 place-items-center rounded-2xl bg-white text-lilac-700'>
                    <KeyRound size={20} aria-hidden />
                  </span>
                  <span className='mt-6 font-semibold'>Đổi mật khẩu</span>
                  <span className='text-sm text-ink-600'>Cập nhật mật khẩu đăng nhập</span>
                </Link>
                <button
                  type='button'
                  onClick={handleLogout}
                  className='flex cursor-pointer flex-col rounded-3xl bg-rose-50 p-5 text-left transition hover:bg-rose-100'
                >
                  <span className='grid h-11 w-11 place-items-center rounded-2xl bg-white text-rose-600'>
                    <LogOut size={20} aria-hidden />
                  </span>
                  <span className='mt-6 font-semibold'>Đăng xuất</span>
                  <span className='text-sm text-ink-600'>Thoát khỏi thiết bị này</span>
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  type = 'text'
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className='block'>
      <span className='field-label'>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className='field' />
    </label>
  )
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className='bg-white p-5'>
      <dt className='flex items-center gap-2 text-sm text-ink-500'>
        <span className='text-berry-600' aria-hidden>
          {icon}
        </span>
        {label}
      </dt>
      <dd className='mt-1 break-words font-semibold'>{value}</dd>
    </div>
  )
}
