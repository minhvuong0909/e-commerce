import { useEffect } from 'react'
import { Link, Navigate, NavLink, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, MapPin, MessageCircle, Phone, RotateCcw, ShieldCheck, Store, Truck, type LucideIcon } from 'lucide-react'
import { POLICIES, POLICY_SLUGS, POLICY_UPDATED_AT, type PolicySlug } from '../../constants/policies'
import { getShopSettingsApi } from '../../services/shop_settings.services'
import { ROUTE_PATHS } from '../../routes/route.paths'
import cn from '../../utils/cn'

const ICONS: Record<PolicySlug, LucideIcon> = {
  'doi-tra': RotateCcw,
  'van-chuyen': Truck,
  'bao-mat': ShieldCheck,
  'dieu-khoan': FileText
}

// giá trị mặc định ở backend — không đủ ý nghĩa để hiển thị như "ghi chú từ cửa hàng"
const DEFAULT_RETURN_NOTE = 'Hỗ trợ đổi trả minh bạch theo chính sách của cửa hàng.'

const isPolicySlug = (s?: string): s is PolicySlug => POLICY_SLUGS.includes(s as PolicySlug)

function ContactCard() {
  const { data } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: async () => (await getShopSettingsApi()).data.result,
    staleTime: 5 * 60_000
  })
  const items = [
    data?.hotline ? { icon: Phone, label: data.hotline, href: `tel:${data.hotline.replace(/\s+/g, '')}` } : null,
    data?.zalo_url ? { icon: MessageCircle, label: 'Nhắn Zalo', href: data.zalo_url } : null,
    data?.messenger_url ? { icon: MessageCircle, label: 'Nhắn Messenger', href: data.messenger_url } : null
  ].filter(Boolean) as { icon: LucideIcon; label: string; href: string }[]

  return (
    <div className='rounded-3xl border border-berry-100 bg-berry-50/60 p-5 sm:p-6'>
      <h2 className='font-display text-xl font-bold'>Cần hỗ trợ thêm?</h2>
      <p className='mt-1 text-sm text-ink-600'>Gửi kèm mã đơn hàng để chúng tôi xử lý nhanh hơn.</p>
      <div className='mt-4 flex flex-wrap gap-2'>
        {items.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith('tel:') ? undefined : '_blank'}
            rel='noreferrer'
            className='inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-berry-700 ring-1 ring-berry-100 transition hover:bg-berry-600 hover:text-white'
          >
            <Icon size={16} aria-hidden /> {label}
          </a>
        ))}
        <Link
          to={ROUTE_PATHS.USER_TRACK_ORDER}
          className='inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink-700 ring-1 ring-ink-200 transition hover:text-berry-700'
        >
          <Store size={16} aria-hidden /> Tra cứu đơn
        </Link>
      </div>
      {data?.warehouse_address ? (
        <p className='mt-4 flex items-start gap-2 text-sm text-ink-600'>
          <MapPin size={16} className='mt-0.5 shrink-0 text-berry-600' aria-hidden /> {data.warehouse_address}
        </p>
      ) : null}
      {items.length === 0 ? <p className='mt-3 text-sm text-ink-600'>Hoặc nhắn trợ lý tư vấn ở góc phải màn hình.</p> : null}
    </div>
  )
}

function ShopReturnNote() {
  const { data } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: async () => (await getShopSettingsApi()).data.result,
    staleTime: 5 * 60_000
  })
  const note = data?.return_policy?.trim()
  if (!note || note === DEFAULT_RETURN_NOTE) return null
  return (
    <div className='mt-6 rounded-2xl border border-peach-200 bg-peach-50 px-5 py-4'>
      <p className='text-xs font-bold uppercase tracking-[0.14em] text-ink-700'>Ghi chú từ cửa hàng</p>
      <p className='mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-800'>{note}</p>
    </div>
  )
}

export default function PolicyPage() {
  const { slug } = useParams()
  const { hash } = useLocation()

  // link dạng /policies/bao-mat#ben-thu-ba: App cuộn lên đầu khi đổi trang, nên cuộn tới mục sau khi render
  useEffect(() => {
    if (!hash) return
    const id = requestAnimationFrame(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView())
    return () => cancelAnimationFrame(id)
  }, [slug, hash])

  if (!isPolicySlug(slug)) return <Navigate to={ROUTE_PATHS.USER_POLICY('doi-tra')} replace />
  const policy = POLICIES[slug]
  const Icon = ICONS[slug]

  return (
    <div className='mx-auto max-w-[1180px] px-4 py-8 md:px-6 md:py-12'>
      {/* mobile: tab ngang */}
      <nav aria-label='Các chính sách' className='-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden'>
        {POLICY_SLUGS.map((s) => (
          <NavLink
            key={s}
            to={ROUTE_PATHS.USER_POLICY(s)}
            className={({ isActive }) =>
              cn(
                'chip shrink-0 border',
                isActive ? 'border-berry-200 bg-berry-50 text-berry-700' : 'border-ink-200 bg-white text-ink-700'
              )
            }
          >
            {POLICIES[s].short}
          </NavLink>
        ))}
      </nav>

      <div className='grid gap-10 lg:grid-cols-[250px_1fr]'>
        <aside className='hidden lg:block'>
          <div className='sticky top-28 space-y-8'>
            <nav aria-label='Các chính sách'>
              <p className='text-xs font-bold uppercase tracking-[0.16em] text-ink-500'>Chính sách</p>
              <ul className='mt-3 space-y-1'>
                {POLICY_SLUGS.map((s) => {
                  const ItemIcon = ICONS[s]
                  return (
                    <li key={s}>
                      <NavLink
                        to={ROUTE_PATHS.USER_POLICY(s)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                            isActive ? 'bg-berry-50 text-berry-700' : 'text-ink-700 hover:bg-ink-50'
                          )
                        }
                      >
                        <ItemIcon size={17} aria-hidden /> {POLICIES[s].title}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <nav aria-label='Trên trang này'>
              <p className='text-xs font-bold uppercase tracking-[0.16em] text-ink-500'>Trên trang này</p>
              <ul className='mt-3 space-y-2 border-l border-ink-200 pl-4 text-sm'>
                {policy.sections.map((sec) => (
                  <li key={sec.id}>
                    <a href={`#${sec.id}`} className='text-ink-600 transition hover:text-berry-700'>
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <article className='min-w-0'>
          <header className='flex items-start gap-4'>
            <span className='grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-berry-50 text-berry-700'>
              <Icon size={26} aria-hidden />
            </span>
            <div>
              <h1 className='font-display text-3xl font-bold leading-tight md:text-4xl'>{policy.title}</h1>
              <p className='mt-1 text-sm text-ink-500'>Cập nhật lần cuối: {POLICY_UPDATED_AT}</p>
            </div>
          </header>
          <p className='mt-6 max-w-3xl text-lg leading-relaxed text-ink-700'>{policy.intro}</p>

          {slug === 'doi-tra' ? <ShopReturnNote /> : null}

          <div className='mt-8 space-y-4'>
            {policy.sections.map((sec, i) => (
              <section key={sec.id} id={sec.id} className='scroll-mt-28 rounded-3xl border border-ink-200 bg-white p-5 sm:p-7'>
                <h2 className='flex items-center gap-3 font-display text-xl font-bold'>
                  <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-100 text-xs font-bold text-ink-700'>
                    {i + 1}
                  </span>
                  {sec.title}
                </h2>
                <div className='mt-3 space-y-3 text-[15px] leading-relaxed text-ink-700'>
                  {sec.body.map((block, j) =>
                    Array.isArray(block) ? (
                      <ul key={j} className='space-y-2'>
                        {block.map((li) => (
                          <li key={li} className='flex gap-3'>
                            <span aria-hidden className='mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-berry-500' />
                            <span>{li}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p key={j}>{block}</p>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>

          <div className='mt-8'>
            <ContactCard />
          </div>
        </article>
      </div>
    </div>
  )
}
