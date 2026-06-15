import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BadgeCheck,
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
  Sparkles,
  UserRound,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import SavedAddressesPanel from '../../components/profile/SavedAddressesPanel'
import { ORDER_BADGE_CLASS } from '../../constants/order'
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

const panelClass = 'rounded-lg border border-[#eaded8] bg-white'

const TABS: { id: ProfileTab; label: string; icon: typeof UserRound }[] = [
  { id: 'personal', label: 'Thông tin', icon: UserRound },
  { id: 'addresses', label: 'Địa chỉ', icon: MapPin },
  { id: 'orders', label: 'Đơn hàng', icon: Package },
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
    <div className='mx-auto max-w-4xl px-4 py-8 md:px-6'>
      <div className='h-40 animate-pulse rounded-lg bg-[#eaded8]/40' />
      <div className='mt-6 h-64 animate-pulse rounded-lg bg-[#eaded8]/30' />
    </div>
  )
}

function RecentOrderCard({ order }: { order: OrderUI }) {
  return (
    <Link
      to={ROUTE_PATHS.USER_ORDER_DETAIL(order.id)}
      className='flex items-center justify-between gap-3 rounded-lg border border-[#f0e4de] bg-[#fdf8f6] p-4 transition hover:border-[#cbb8af]'
    >
      <div className='min-w-0'>
        <p className='font-semibold text-[#3d3330]'>{order.code}</p>
        <p className='mt-0.5 text-xs text-[#8a7a74]'>{order.date}</p>
      </div>
      <div className='flex shrink-0 flex-col items-end gap-1.5'>
        <StatusBadge tone={order.status} className={ORDER_BADGE_CLASS[order.status]}>
          {order.statusLabel}
        </StatusBadge>
        <span className='text-sm font-bold text-[#3d3330]'>{money(order.total)}</span>
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
      await logoutApi(refresh_token)
    }
    clearAuth()
    toast.success('Đăng xuất thành công!')
    navigate(ROUTE_PATHS.AUTH_LOGIN)
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (isError || !user || !displayUser) {
    return (
      <div className='mx-auto max-w-lg px-4 py-16 text-center md:px-6'>
        <div className={cn(panelClass, 'p-8')}>
          <p className='font-semibold text-[#3d3330]'>Không tải được hồ sơ</p>
          <p className='mt-2 text-sm text-[#8a7a74]'>Vui lòng thử lại sau giây lát.</p>
          <button
            type='button'
            onClick={() => refetch()}
            className='mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-[#3d3330] px-4 text-sm font-semibold text-[#3d3330] hover:bg-[#fdf8f6]'
          >
            <RefreshCw size={15} />
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (date: string) => {
    if (!date) return 'Chưa cập nhật'
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const initials = displayUser.name.trim().charAt(0).toUpperCase() || 'U'

  return (
    <div className='mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6'>
      <header className={cn(panelClass, 'overflow-hidden')}>
        <div className='bg-[linear-gradient(135deg,#fdf8f6_0%,#f0ebe3_50%,#eef4ef_100%)] px-5 py-8 md:px-8'>
          <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
            <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#f5ebe6] shadow-sm'>
              {displayUser.avatar ? (
                <img src={displayUser.avatar} alt='' className='h-full w-full object-cover' />
              ) : (
                <div className='flex h-full items-center justify-center text-2xl font-semibold text-[#b07a72]'>{initials}</div>
              )}
            </div>

            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-2xl font-semibold text-[#3d3330]'>{displayUser.name}</h1>
                {user.verify_status === 1 ? (
                  <span className='inline-flex items-center gap-1 rounded-full border border-[#eaded8] bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6b8f71]'>
                    <BadgeCheck size={12} />
                    Verified
                  </span>
                ) : null}
                <span className='inline-flex items-center gap-1 rounded-full bg-[#b07a72]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#b07a72]'>
                  <Sparkles size={12} />
                  Glow member
                </span>
              </div>
              <p className='mt-1 text-sm text-[#8a7a74]'>@{displayUser.username}</p>
              <p className='mt-1 flex items-center gap-1.5 text-sm text-[#6b5f59]'>
                <Mail size={14} className='text-[#b07a72]' />
                {user.email}
              </p>
            </div>

            {!editing ? (
              <button
                type='button'
                onClick={startEditing}
                className='inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-md border border-[#3d3330] px-4 text-sm font-semibold text-[#3d3330] hover:bg-white/80 sm:self-center'
              >
                <PenLine size={15} />
                Chỉnh sửa
              </button>
            ) : null}
          </div>
          <p className='mt-4 text-xs text-[#8a7a74]'>Beauty profile — quản lý routine và thông tin giao hàng của bạn.</p>
        </div>
      </header>

      <nav className='flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type='button'
            onClick={() => setActiveTab(id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
              activeTab === id
                ? 'border-[#3d3330] bg-[#3d3330] text-white'
                : 'border-[#eaded8] bg-white text-[#6b5f59] hover:border-[#cbb8af]'
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'personal' ? (
        <section className={cn(panelClass, 'p-5 md:p-7')}>
          <h2 className='text-lg font-semibold text-[#3d3330]'>Thông tin cá nhân</h2>
          <p className='mt-1 text-sm text-[#8a7a74]'>Cập nhật beauty profile để trải nghiệm mua sắm cá nhân hơn.</p>

          {editing && form ? (
            <div className='mt-6 space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField label='Họ tên' value={form.name} onChange={(v) => updateField('name', v)} />
                <FormField label='Username' value={form.username} onChange={(v) => updateField('username', v)} />
                <FormField label='Ngày sinh' type='date' value={form.date_of_birth || ''} onChange={(v) => updateField('date_of_birth', v)} />
                <FormField label='Địa điểm' value={form.location || ''} onChange={(v) => updateField('location', v)} />
                <FormField label='Website' value={form.website || ''} onChange={(v) => updateField('website', v)} />
                <FormField label='Avatar URL' value={form.avatar || ''} onChange={(v) => updateField('avatar', v)} />
              </div>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-[#3d3330]'>Giới thiệu</span>
                <textarea
                  rows={4}
                  value={form.bio || ''}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className='w-full resize-none rounded-md border border-[#eaded8] px-4 py-3 text-sm outline-none focus:border-[#cbb8af] focus:ring-2 focus:ring-[#f5d5cf]/40'
                />
              </label>
              <div className='flex flex-wrap gap-2'>
                <Button onClick={handleSave} loading={updating} className='!rounded-md !bg-[#3d3330] hover:!bg-[#2a2421]'>
                  <Save size={16} />
                  Lưu thay đổi
                </Button>
                <Button variant='secondary' onClick={cancelEditing} className='!rounded-md'>
                  <X size={16} />
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <div className='mt-6 grid gap-3 sm:grid-cols-2'>
              <InfoItem icon={<Mail size={16} />} label='Email' value={user.email} />
              <InfoItem icon={<UserRound size={16} />} label='Ngày sinh' value={formatDate(user.date_of_birth)} />
              <InfoItem icon={<MapPin size={16} />} label='Địa điểm' value={user.location || 'Chưa cập nhật'} />
              <InfoItem icon={<Globe2 size={16} />} label='Website' value={user.website || 'Chưa cập nhật'} />
              {user.bio ? (
                <div className='sm:col-span-2 rounded-lg border border-[#f0e4de] bg-[#fdf8f6] p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-[#8a7a74]'>Giới thiệu</p>
                  <p className='mt-2 text-sm leading-6 text-[#6b5f59]'>{user.bio}</p>
                </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}

      {activeTab === 'addresses' ? (
        <section className={cn(panelClass, 'p-5 md:p-7')}>
          <h2 className='text-lg font-semibold text-[#3d3330]'>Sổ địa chỉ</h2>
          <p className='mt-1 text-sm text-[#8a7a74]'>Địa chỉ đã lưu giúp checkout nhanh hơn.</p>
          <div className='mt-5'>
            <SavedAddressesPanel variant='cosmetics' />
          </div>
        </section>
      ) : null}

      {activeTab === 'orders' ? (
        <section className={cn(panelClass, 'p-5 md:p-7')}>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h2 className='text-lg font-semibold text-[#3d3330]'>Đơn hàng gần đây</h2>
              <p className='mt-1 text-sm text-[#8a7a74]'>3 đơn mới nhất của bạn.</p>
            </div>
            <Link to={ROUTE_PATHS.USER_ORDERS} className='text-sm font-semibold text-[#b07a72] hover:text-[#8f5f58]'>
              Xem tất cả
            </Link>
          </div>

          <div className='mt-5 space-y-3'>
            {ordersLoading ? (
              <div className='h-24 animate-pulse rounded-lg bg-[#fdf8f6]' />
            ) : recentOrders.length === 0 ? (
              <div className='rounded-lg border border-dashed border-[#dccbc4] bg-[#fdf8f6] px-5 py-10 text-center'>
                <Package size={28} className='mx-auto text-[#cbb8af]' />
                <p className='mt-3 text-sm font-semibold text-[#6b5f59]'>No beauty orders yet</p>
                <Link
                  to={ROUTE_PATHS.USER_HOME}
                  className='mt-4 inline-flex h-10 items-center rounded-md bg-[#3d3330] px-4 text-sm font-semibold text-white hover:bg-[#2a2421]'
                >
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
        <section className={cn(panelClass, 'p-5 md:p-7')}>
          <h2 className='text-lg font-semibold text-[#3d3330]'>Bảo mật tài khoản</h2>
          <p className='mt-1 text-sm text-[#8a7a74]'>Quản lý mật khẩu và phiên đăng nhập.</p>

          <div className='mt-6 space-y-3'>
            <Link
              to={ROUTE_PATHS.USER_CHANGE_PASSWORD}
              className='flex items-center justify-between gap-3 rounded-lg border border-[#f0e4de] bg-[#fdf8f6] p-4 transition hover:border-[#cbb8af]'
            >
              <div className='flex items-center gap-3'>
                <span className='grid h-10 w-10 place-items-center rounded-md bg-white text-[#b07a72]'>
                  <KeyRound size={18} />
                </span>
                <div>
                  <p className='font-semibold text-[#3d3330]'>Đổi mật khẩu</p>
                  <p className='text-xs text-[#8a7a74]'>Cập nhật mật khẩu đăng nhập</p>
                </div>
              </div>
            </Link>

            <button
              type='button'
              onClick={handleLogout}
              className='flex w-full items-center justify-between gap-3 rounded-lg border border-rose-200/80 bg-rose-50/50 p-4 text-left transition hover:bg-rose-50'
            >
              <div className='flex items-center gap-3'>
                <span className='grid h-10 w-10 place-items-center rounded-md bg-white text-rose-600'>
                  <LogOut size={18} />
                </span>
                <div>
                  <p className='font-semibold text-[#3d3330]'>Đăng xuất</p>
                  <p className='text-xs text-[#8a7a74]'>Thoát khỏi tài khoản trên thiết bị này</p>
                </div>
              </div>
            </button>
          </div>
        </section>
      ) : null}
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
      <span className='mb-2 block text-sm font-semibold text-[#3d3330]'>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='h-10 w-full rounded-md border border-[#eaded8] px-3 text-sm outline-none focus:border-[#cbb8af] focus:ring-2 focus:ring-[#f5d5cf]/40'
      />
    </label>
  )
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className='rounded-lg border border-[#f0e4de] bg-[#fdf8f6] p-4'>
      <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8a7a74]'>
        <span className='text-[#b07a72]'>{icon}</span>
        {label}
      </div>
      <div className='mt-2 break-words text-sm font-semibold text-[#3d3330]'>{value}</div>
    </div>
  )
}
