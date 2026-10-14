import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Droplets, Leaf, Pause, Play, ShieldCheck, Sparkles, Sun, Tag } from 'lucide-react'

interface SlideItem {
  id: number
  badge: string
  badgeIcon: React.ElementType
  title: string
  highlightTitle?: string
  description: string
  buttonText: string
  buttonLink: string
  image: string
  footerIcon1: React.ElementType
  footerText1: string
  footerIcon2: React.ElementType
  footerText2: string
  cardIcon: React.ElementType
  cardTitle: string
  cardSub: string
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: 'Skincare & Natural Routine',
    badgeIcon: Sparkles,
    title: 'Làn da dịu nhẹ,',
    highlightTitle: 'vẻ đẹp tự nhiên.',
    description: 'Một chút chăm sóc mỗi ngày. Khám phá những sản phẩm chuẩn chuyên gia nuôi dưỡng vẻ đẹp thuần khiết.',
    buttonText: 'Khám phá ngay',
    buttonLink: '#new-arrivals',
    image: '/images/hero_slide_routine.jpg',
    footerIcon1: Leaf,
    footerText1: 'Thành phần hữu cơ lành tính',
    footerIcon2: ShieldCheck,
    footerText2: 'Minh bạch nguồn gốc 100%',
    cardIcon: Droplets,
    cardTitle: 'Chăm da từ những điều giản dị',
    cardSub: 'Làm sạch · Dưỡng ẩm · Bảo vệ'
  },
  {
    id: 2,
    badge: 'Ưu đãi đặc biệt mùa hè',
    badgeIcon: Sun,
    title: 'Bảo vệ toàn diện,',
    highlightTitle: 'mùa hè không lo.',
    description: 'Bảo vệ làn da trước tia UV với dòng kem chống nắng quang phổ rộng, thẩm thấu nhanh, không nhờn rít. Tặng mã giảm 15% cho đơn đầu tiên.',
    buttonText: 'Săn Deal Chống Nắng',
    buttonLink: '#featured-products',
    image: '/images/hero_slide_sunscreen.jpg',
    footerIcon1: ShieldCheck,
    footerText1: 'Chỉ số SPF 50+ PA++++',
    footerIcon2: Tag,
    footerText2: 'Freeship đơn từ 299k',
    cardIcon: Sun,
    cardTitle: 'Chống nắng quang phổ rộng',
    cardSub: 'Mỏng nhẹ · Không bóng nhờn · Kháng nước'
  },
  {
    id: 3,
    badge: 'Làm sạch chuyên sâu',
    badgeIcon: Leaf,
    title: 'Sạch lỗ chân lông,',
    highlightTitle: 'da sáng mịn màng.',
    description: 'Combo bộ ba Tẩy trang - Sữa rửa mặt - Toner cấp ẩm dịu nhẹ giúp cân bằng độ pH tự nhiên và thu nhỏ lỗ chân lông hiệu quả.',
    buttonText: 'Xem Bộ Routine',
    buttonLink: '#featured-products',
    image: '/images/cleanser-routine-essentials.jpg',
    footerIcon1: Droplets,
    footerText1: 'Cấp ẩm tức thì 24H',
    footerIcon2: ShieldCheck,
    footerText2: 'Không chứa cồn & Paraben',
    cardIcon: Sparkles,
    cardTitle: 'Routine Làm Sạch Đạt Chuẩn',
    cardSub: 'Dịu nhẹ cho mọi loại da, kể cả da nhạy cảm'
  }
]

export default function HomeHero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length)
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(handleNext, 5000)
    return () => clearInterval(timer)
  }, [handleNext, isPaused])

  const slide = HERO_SLIDES[currentIndex]
  const BadgeIcon = slide.badgeIcon
  const FooterIcon1 = slide.footerIcon1
  const FooterIcon2 = slide.footerIcon2
  const CardIcon = slide.cardIcon

  return (
    <section className='bg-[#FAF7F2] px-4 py-6 md:px-6 md:py-8'>
      <div
        className='group relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[32px] border border-[#E7E0D8] bg-[#FFFFFF] p-6 shadow-soft md:grid-cols-[1.1fr_0.9fr] md:p-10 lg:gap-14 lg:p-14'
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Left text column */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <p className='inline-flex items-center gap-2 rounded-full border border-[#E7E0D8] bg-[#FAF7F2] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A16207]'>
              <BadgeIcon size={14} className='text-[#A16207]' />
              <span>{slide.badge}</span>
            </p>

            <h1 className='mt-6 font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-[#1C1917] sm:text-5xl lg:text-6xl'>
              {slide.title}<br />
              <span className='italic font-serif text-[#A16207]'>{slide.highlightTitle}</span>
            </h1>

            <p className='mt-5 max-w-md text-sm leading-relaxed text-[#594D42] md:text-base'>
              {slide.description}
            </p>

            <div className='mt-8 flex flex-wrap items-center gap-3.5'>
              <a
                href={slide.buttonLink}
                className='inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1C1917] px-8 text-sm font-bold text-[#FAF7F2] shadow-sm transition-all duration-300 hover:bg-[#A16207] hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A16207] focus-visible:ring-offset-2'
              >
                <span>{slide.buttonText}</span>
                <ArrowRight size={16} />
              </a>

              <button
                type='button'
                onClick={() => setIsPaused((p) => !p)}
                className='inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E7E0D8] bg-white text-[#594D42] transition hover:border-[#A16207] hover:text-[#1C1917] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A16207]'
                aria-label={isPaused ? 'Phát trình chiếu banner' : 'Tạm dừng trình chiếu banner'}
                title={isPaused ? 'Tiếp tục tự động chuyển slide' : 'Tạm dừng tự động chuyển slide'}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>
            </div>

            <div className='mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#E7E0D8] pt-5 text-xs font-semibold text-[#786C60]'>
              <span className='inline-flex items-center gap-2'>
                <FooterIcon1 size={16} className='text-[#A16207]' />
                <span>{slide.footerText1}</span>
              </span>
              <span className='inline-flex items-center gap-2'>
                <FooterIcon2 size={16} className='text-[#A16207]' />
                <span>{slide.footerText2}</span>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right image carousel */}
        <div className='relative aspect-[4/3] w-full overflow-hidden rounded-2xl md:aspect-auto md:h-[420px] bg-[#F5EFE6] border border-[#E7E0D8]'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className='h-full w-full'
            >
              <img
                src={slide.image}
                alt={slide.title}
                className='h-full w-full object-cover rounded-2xl shadow-sm'
              />
            </motion.div>
          </AnimatePresence>

          {/* Floating spec badge card */}
          <div className='absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-[#E7E0D8] bg-white/95 p-4 shadow-lg backdrop-blur-md'>
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FAF7F2] text-[#A16207] border border-[#E7E0D8]'>
              <CardIcon size={21} />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-xs font-bold text-[#1C1917]'>{slide.cardTitle}</p>
              <p className='mt-0.5 truncate text-[11px] font-medium text-[#786C60]'>{slide.cardSub}</p>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          type='button'
          onClick={handlePrev}
          className='absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-[#E7E0D8] bg-white/95 text-[#1C1917] shadow-sm opacity-0 transition duration-200 group-hover:opacity-100 hover:bg-[#1C1917] hover:text-white z-10 cursor-pointer focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#A16207]'
          aria-label='Slide trước'
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type='button'
          onClick={handleNext}
          className='absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-[#E7E0D8] bg-white/95 text-[#1C1917] shadow-sm opacity-0 transition duration-200 group-hover:opacity-100 hover:bg-[#1C1917] hover:text-white z-10 cursor-pointer focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#A16207]'
          aria-label='Slide sau'
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots indicator */}
        <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10'>
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type='button'
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#A16207] ${
                currentIndex === idx ? 'w-7 bg-[#A16207]' : 'w-2 bg-[#D6C8B8] hover:bg-[#786C60]'
              }`}
              aria-label={`Chuyển sang slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
