import { ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product } from '../../models/ProductRequests'
import { hoverLift } from '../../constants/motion'
import money from '../../utils/money'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.medias?.[0]?.url
  const isLowStock = product.quantity > 0 && product.quantity <= 5

  return (
    <motion.article
      whileHover={hoverLift}
      className='surface-card group overflow-hidden rounded-3xl transition hover:border-slate-400/[0.45]'
    >
      <Link to={`/user/products/${product._id}`} className='block'>
        <div className='relative aspect-[4/3] overflow-hidden bg-slate-100'>
          {image ? (
            <motion.img
              src={image}
              alt={product.name}
              className='h-full w-full object-cover'
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.35 }}
            />
          ) : (
            <div className='grid h-full place-items-center text-sm font-semibold text-slate-400'>Chưa có ảnh</div>
          )}

          <div className='absolute left-3 top-3 flex gap-2'>
            <span className='rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-700 shadow-sm'>
              Chính hãng
            </span>
            {isLowStock ? (
              <span className='rounded-full bg-amber-50/95 px-3 py-1 text-xs font-bold text-amber-700 shadow-sm'>
                Còn ít
              </span>
            ) : null}
          </div>
        </div>

        <div className='p-4'>
          <h3 className='line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900'>{product.name}</h3>
          <div className='mt-3 flex items-center justify-between gap-2 text-xs font-semibold text-slate-600'>
            <span className='inline-flex items-center gap-1'>
              <Star size={14} className='fill-amber-400 text-amber-400' />
              {product.rating_number || '5.0'}
            </span>
            <span>{product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng'}</span>
          </div>
          <div className='mt-3 flex items-center justify-between gap-3'>
            <p className='text-base font-bold text-slate-900'>{money(product.price)}</p>
            <span className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-white transition group-hover:bg-brand-600'>
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
