import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { User } from '../../models/AuthRequests'
import { getMeApi, logoutApi, updateMeApi } from '../../services/auths.services'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  // call api update profile
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

  const navigate = useNavigate()

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
    return <div className='flex justify-center py-20 text-white/60'>Đang tải thông tin...</div>
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='mx-auto max-w-4xl space-y-12'
    >
      {/* COVER */}
      <div className='relative rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-xl'>
        <div className='relative h-56 w-full'>
          {user.cover_photo ? (
            <img src={user.cover_photo} alt='cover' className='h-full w-full object-cover' />
          ) : (
            <div className='h-full w-full bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-indigo-500/20' />
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
        </div>

        {/* AVATAR */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='absolute left-8 bottom-9 translate-y-1/2'
        >
          <div className='relative h-36 w-36'>
            {/* Glow */}
            <div className='absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/40 to-pink-500/40 blur-xl' />

            {/* Avatar */}
            <div className='relative h-36 w-36 overflow-hidden rounded-full border-[6px] border-[#0b0b10] bg-white/10 shadow-2xl'>
              {user.avatar ? (
                <img src={user.avatar} alt='avatar' className='h-full w-full object-cover' />
              ) : (
                <div className='flex h-full items-center justify-center text-4xl font-bold text-white/60'>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* INFO CARD */}
      <div className='mt-10 rounded-3xl border border-white/10 bg-black/50 p-10 backdrop-blur-xl shadow-lg'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-4'>
              <h2 className='text-3xl font-extrabold'>{user.name}</h2>

              {user.verify_status === 1 && (
                <span className='rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300'>
                  ✓ Đã xác thực
                </span>
              )}
            </div>

            <div className='mt-2 text-sm text-white/60'>@{user.username}</div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={handleUpdateProfile}
              className='rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20'
            >
              {updating ? 'Đang cập nhật...' : 'Chỉnh sửa'}
            </button>

            <button
              onClick={handleLogout}
              className='rounded-2xl bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/30'
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* INFO GRID */}
        <div className='mt-10 grid gap-8 md:grid-cols-2'>
          <InfoItem label='Email' value={user.email} />
          <InfoItem label='Ngày sinh' value={formatDate(user.date_of_birth)} />
          <InfoItem label='Địa điểm' value={user.location || 'Chưa cập nhật'} />
          <InfoItem label='Website' value={user.website || 'Chưa cập nhật'} />
        </div>

        {user.bio && (
          <div className='mt-10'>
            <div className='text-xs uppercase tracking-wider text-white/50'>Giới thiệu</div>
            <div className='mt-2 text-white/80 leading-relaxed'>{user.bio}</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className='text-xs uppercase tracking-wider text-white/50'>{label}</div>
      <div className='mt-1 text-lg font-semibold'>{value}</div>
    </div>
  )
}
