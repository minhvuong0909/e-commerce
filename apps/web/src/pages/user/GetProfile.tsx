import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, Globe2, LogOut, Mail, MapPin, PenLine, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import type { User } from '../../models/AuthRequests'
import { getMeApi, logoutApi, updateMeApi } from '../../services/auths.services'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const navigate = useNavigate()

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true)

      const res = await updateMeApi({
        name: user?.name,
        date_of_birth: user?.date_of_birth,
        bio: user?.bio,
        location: user?.location,
        website: user?.website,
        username: user?.username,
        avatar: user?.avatar,
        cover_photo: user?.cover_photo
      })

      toast.success('Cập nhật thông tin thành công')
      setUser(res.data.result)
    } catch (error) {
      toast.error('Cập nhật thất bại')
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await getMeApi()
        setUser(res.data.result)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN')

  const handleLogout = async () => {
    const refresh_token = localStorage.getItem('refresh_token')
    if (refresh_token) {
      await logoutApi(refresh_token)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    toast.success('Đăng xuất thành công!')
    navigate('/auth/login')
  }

  if (loading) {
    return (
      <div className='mx-auto max-w-5xl px-4 py-10 md:px-6'>
        <div className='h-[520px] animate-pulse rounded-3xl bg-white shadow-sm' />
      </div>
    )
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className='mx-auto max-w-5xl px-4 py-8 md:px-6'
    >
      <div className='surface-card overflow-hidden rounded-3xl'>
        <div className='relative h-60 w-full bg-slate-100'>
          {user.cover_photo ? (
            <img src={user.cover_photo} alt='cover' className='h-full w-full object-cover' />
          ) : (
            <div className='h-full w-full bg-[linear-gradient(135deg,#f8fafc_0%,#eef9ff_45%,#effdf7_100%)]' />
          )}
          <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_20%,rgba(255,255,255,0.94)_100%)]' />
        </div>

        <div className='relative px-5 pb-6 md:px-8 md:pb-8'>
          <div className='-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
            <div className='flex items-end gap-4'>
              <div className='relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-slate-100 shadow-lift'>
                {user.avatar ? (
                  <img src={user.avatar} alt='avatar' className='h-full w-full object-cover' />
                ) : (
                  <div className='flex h-full items-center justify-center text-4xl font-black text-slate-500'>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className='pb-2'>
                <div className='flex flex-wrap items-center gap-3'>
                  <h1 className='text-3xl font-black tracking-tight text-ink-950'>{user.name}</h1>
                  {user.verify_status === 1 ? (
                    <span className='inline-flex items-center gap-1 rounded-full bg-mint-50 px-3 py-1 text-xs font-black text-mint-600'>
                      <BadgeCheck size={14} />
                      Đã xác thực
                    </span>
                  ) : null}
                </div>
                <div className='mt-1 text-sm font-semibold text-slate-500'>@{user.username}</div>
              </div>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row'>
              <Button variant='secondary' onClick={handleUpdateProfile} loading={updating}>
                <PenLine size={17} />
                {updating ? 'Đang cập nhật...' : 'Chỉnh sửa'}
              </Button>

              <Button variant='danger' onClick={handleLogout}>
                <LogOut size={17} />
                Đăng xuất
              </Button>
            </div>
          </div>

          <div className='mt-8 grid gap-4 md:grid-cols-2'>
            <InfoItem icon={<Mail size={18} />} label='Email' value={user.email} />
            <InfoItem icon={<UserRound size={18} />} label='Ngày sinh' value={formatDate(user.date_of_birth)} />
            <InfoItem icon={<MapPin size={18} />} label='Địa điểm' value={user.location || 'Chưa cập nhật'} />
            <InfoItem icon={<Globe2 size={18} />} label='Website' value={user.website || 'Chưa cập nhật'} />
          </div>

          {user.bio ? (
            <div className='mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5'>
              <div className='text-xs font-black uppercase tracking-[0.16em] text-slate-400'>Giới thiệu</div>
              <div className='mt-2 text-sm leading-7 text-slate-700'>{user.bio}</div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
      <div className='flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400'>
        <span className='text-slate-500'>{icon}</span>
        {label}
      </div>
      <div className='mt-2 break-words text-base font-black text-ink-950'>{value}</div>
    </div>
  )
}
