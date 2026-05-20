import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ImagePlus, Save, Trash2, RotateCcw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import AdminTableShell from '../../../components/ui/AdminTable'
import { createProductApi } from '../../../services/products.services'
import {
  createProductSchema,
  type CreateProductFormInput,
  type CreateProductFormValues
} from '../../../middlewares/products.middlewares'
import { getBrandsApi } from '../../../services/brands.services'
import { getCategoriesApi } from '../../../services/categories.services'
import { uploadImageApi } from '../../../services/medias.services'

type MediaPreview = {
  id: string
  name: string
  type: number
  file: File
}

type SelectOption = {
  id: string
  name: string
}

type ApiOptionItem = {
  _id?: string
  id?: string
  name?: string
  title?: string
}

function InputError({ message }: { message?: string }) {
  if (!message) return null
  return <p className='mt-2 text-xs text-rose-300'>{message}</p>
}

function findArrayData(value: unknown): unknown[] {
  if (Array.isArray(value)) return value

  if (!value || typeof value !== 'object') return []

  const obj = value as Record<string, unknown>
  const keys = ['data', 'result', 'items', 'brands', 'categories']

  for (const key of keys) {
    const found = findArrayData(obj[key])
    if (found.length) return found
  }

  return []
}

function normalizeOptions(response: unknown): SelectOption[] {
  const rawData = findArrayData(response)

  return rawData
    .map((item) => {
      const option = item as ApiOptionItem
      const id = String(option._id || option.id || '')

      return {
        id,
        name: option.name || option.title || id
      }
    })
    .filter((item) => item.id)
}

function getUploadedImageUrl(uploadResponse: any) {
  return (
    uploadResponse.data?.url?.url ||
    uploadResponse.data?.url ||
    uploadResponse.data?.data?.url?.url ||
    uploadResponse.data?.data?.url ||
    uploadResponse.data?.data?.image_url ||
    uploadResponse.data?.data?.secure_url ||
    uploadResponse.data?.image_url ||
    uploadResponse.data?.secure_url ||
    ''
  )
}

const defaultValues: CreateProductFormInput = {
  name: '',
  price: 0,
  quantity: 0,
  description: '',
  rating_number: 0,
  origin: '',
  brand_id: '',
  category_id: '',
  volume: undefined,
  weight: undefined,
  width: undefined,
  height: undefined,
  medias: []
}

export default function AdminProductCreatePage() {
  const nav = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [mediaPreview, setMediaPreview] = useState<MediaPreview[]>([])
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const [brandOptions, setBrandOptions] = useState<SelectOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([])
  const [optionLoading, setOptionLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<CreateProductFormInput, any, CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues
  })

  const watchedValues = watch()
  const canSubmit = useMemo(() => isValid && !isSubmitting, [isValid, isSubmitting])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptionLoading(true)

        const [brandsRes, categoriesRes] = await Promise.all([getBrandsApi(), getCategoriesApi()])

        setBrandOptions(normalizeOptions(brandsRes))
        setCategoryOptions(normalizeOptions(categoriesRes))
      } catch (error) {
        console.error(error)
        setSubmitError('Không thể tải danh sách thương hiệu hoặc danh mục.')
      } finally {
        setOptionLoading(false)
      }
    }

    fetchOptions()
  }, [])

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    if (!imageFiles.length) {
      setSubmitError('Vui lòng chọn file ảnh hợp lệ.')
      e.target.value = ''
      return
    }

    setSubmitError('')

    const nextItems: MediaPreview[] = imageFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      type: 0,
      file
    }))

    setMediaPreview((prev) => [...prev, ...nextItems])

    e.target.value = ''
  }

  const removeMedia = (id: string) => {
    setMediaPreview((prev) => prev.filter((item) => item.id !== id))
  }

  const handleReset = () => {
    setMediaPreview([])
    setSubmitError('')
    setSubmitSuccess('')
    reset(defaultValues)
  }

  const uploadAllMedias = async () => {
    if (!mediaPreview.length) return []

    return Promise.all(
      mediaPreview.map(async (item) => {
        const formData = new FormData()
        formData.append('image', item.file)

        const uploadResponse = await uploadImageApi(formData)

        console.log('UPLOAD RESPONSE DATA:', uploadResponse.data)

        const uploadedUrl = getUploadedImageUrl(uploadResponse)

        console.log('UPLOADED URL:', uploadedUrl)

        if (!uploadedUrl) {
          throw new Error('Upload thành công nhưng không lấy được URL ảnh thật.')
        }

        return {
          url: uploadedUrl,
          type: item.type
        }
      })
    )
  }

  const onInvalid = (formErrors: typeof errors) => {
    console.log('FORM INVALID:', formErrors)
    setSubmitError('Form chưa hợp lệ. Vui lòng kiểm tra các trường bắt buộc.')
  }

  const onSubmit = async (values: CreateProductFormValues) => {
    try {
      setSubmitError('')
      setSubmitSuccess('')

      console.log('START SUBMIT')
      console.log('SUBMIT VALUES:', values)

      const uploadedMedias = await uploadAllMedias()

      console.log('UPLOADED MEDIAS:', uploadedMedias)

      const payload = {
        ...values,
        medias: uploadedMedias
      }

      console.log('CREATE PRODUCT PAYLOAD:', payload)

      const createProductResponse = await createProductApi(payload)

      console.log('CREATE PRODUCT RESPONSE:', createProductResponse.data)

      setSubmitSuccess('Tạo sản phẩm thành công.')

      setTimeout(() => {
        nav('/admin/products')
      }, 700)
    } catch (error) {
      console.error('SUBMIT ERROR:', error)
      setSubmitError('Không thể tạo sản phẩm hoặc upload ảnh. Vui lòng thử lại.')
    }
  }

  return (
    <AdminTableShell
      title='Thêm sản phẩm'
      subTitle='Tạo mới sản phẩm, thông tin vận chuyển, tồn kho và media.'
      createTo='/admin/products'
      createLabel='Quay lại danh sách'
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='min-h-screen p-5 text-white sm:p-7'
        style={{
          background: `
            radial-gradient(ellipse 55% 35% at 85% 0%, rgba(255,140,66,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 45% 30% at 15% 100%, rgba(79,142,247,0.06) 0%, transparent 50%),
            linear-gradient(180deg, #080c18 0%, #0d1424 50%, #0f172a 100%)
          `
        }}
      >
        <div className='mx-auto max-w-[1400px] space-y-5'>
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className='rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300'
              >
                {submitError}
              </motion.div>
            )}

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className='rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300'
              >
                {submitSuccess}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className='grid gap-6 2xl:grid-cols-[1.9fr_0.9fr]'>
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className='rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(119,72,255,0.08),transparent_35%),#0c0f17] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.32)] sm:p-7'
            >
              <div className='mb-7'>
                <h2 className='text-[22px] font-extrabold text-white'>Thông tin sản phẩm</h2>
                <p className='mt-2 text-sm text-white/50'>
                  Nhập thông tin cơ bản, giá bán, tồn kho và thông số vận chuyển.
                </p>
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <label className='md:col-span-2'>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>Tên sản phẩm</div>
                  <input
                    {...register('name')}
                    placeholder='Áo thun nam basic'
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-white/20'
                  />
                  <InputError message={errors.name?.message} />
                </label>

                <label>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>Thương hiệu</div>
                  <select
                    {...register('brand_id')}
                    disabled={optionLoading}
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    <option value='' className='bg-slate-950'>
                      {optionLoading ? 'Đang tải thương hiệu...' : 'Chọn thương hiệu'}
                    </option>

                    {brandOptions.map((brand) => (
                      <option key={brand.id} value={brand.id} className='bg-slate-950'>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.brand_id?.message} />
                </label>

                <label>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>Danh mục</div>
                  <select
                    {...register('category_id')}
                    disabled={optionLoading}
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    <option value='' className='bg-slate-950'>
                      {optionLoading ? 'Đang tải danh mục...' : 'Chọn danh mục'}
                    </option>

                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id} className='bg-slate-950'>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.category_id?.message} />
                </label>

                <label>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>Giá bán (VND)</div>
                  <input
                    type='number'
                    min={0}
                    {...register('price', { valueAsNumber: true })}
                    placeholder='199000'
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-white/20'
                  />
                  <InputError message={errors.price?.message} />
                </label>

                <label>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>Tồn kho</div>
                  <input
                    type='number'
                    min={0}
                    {...register('quantity', { valueAsNumber: true })}
                    placeholder='20'
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-white/20'
                  />
                  <InputError message={errors.quantity?.message} />
                </label>

                <label>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>Xuất xứ</div>
                  <input
                    {...register('origin')}
                    placeholder='Việt Nam'
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-white/20'
                  />
                  <InputError message={errors.origin?.message} />
                </label>

                <label>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>
                    Dung tích <span className='text-white/35'>(tuỳ chọn)</span>
                  </div>
                  <input
                    type='number'
                    min={0}
                    {...register('volume', {
                      setValueAs: (value) => (value === '' ? undefined : Number(value))
                    })}
                    placeholder='Nhập volume nếu có'
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-white/20'
                  />
                  <InputError message={errors.volume?.message} />
                </label>

                <label>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>
                    Trọng lượng <span className='text-white/35'>(tuỳ chọn)</span>
                  </div>
                  <input
                    type='number'
                    min={0}
                    {...register('weight', {
                      setValueAs: (value) => (value === '' ? undefined : Number(value))
                    })}
                    placeholder='Nhập weight nếu có'
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-white/20'
                  />
                  <InputError message={errors.weight?.message} />
                </label>

                <label>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>
                    Độ rộng <span className='text-white/35'>(tuỳ chọn)</span>
                  </div>
                  <input
                    type='number'
                    min={0}
                    {...register('width', {
                      setValueAs: (value) => (value === '' ? undefined : Number(value))
                    })}
                    placeholder='Nhập width nếu có'
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-white/20'
                  />
                  <InputError message={errors.width?.message} />
                </label>

                <label>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>
                    Độ cao <span className='text-white/35'>(tuỳ chọn)</span>
                  </div>
                  <input
                    type='number'
                    min={0}
                    {...register('height', {
                      setValueAs: (value) => (value === '' ? undefined : Number(value))
                    })}
                    placeholder='Nhập height nếu có'
                    className='h-14 w-full rounded-[20px] border border-white/10 bg-black/25 px-5 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-white/20'
                  />
                  <InputError message={errors.height?.message} />
                </label>

                <label className='md:col-span-2'>
                  <div className='mb-3 text-[15px] font-bold text-white/80'>Mô tả sản phẩm</div>
                  <textarea
                    rows={7}
                    {...register('description')}
                    placeholder='Mô tả sản phẩm demo...'
                    className='w-full resize-none rounded-[24px] border border-white/10 bg-black/25 px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-white/20'
                  />
                  <InputError message={errors.description?.message} />
                </label>
              </div>

              <div className='mt-7 flex flex-col gap-3 sm:flex-row'>
                <motion.button
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type='submit'
                  disabled={!canSubmit}
                  className='inline-flex h-14 items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-orange-600 via-pink-600 to-rose-600 px-6 text-[15px] font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Save size={18} />
                  {isSubmitting ? 'Đang lưu...' : 'Tạo sản phẩm'}
                </motion.button>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type='button'
                  onClick={handleReset}
                  className='inline-flex h-14 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-6 text-[15px] font-semibold text-white/80 transition hover:bg-white/[0.06] hover:text-white'
                >
                  <RotateCcw size={16} />
                  Làm mới form
                </motion.button>

                <Link
                  to='/admin/products'
                  className='inline-flex h-14 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-6 text-[15px] font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white'
                >
                  <ArrowLeft size={16} />
                  Quay lại
                </Link>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className='rounded-[32px] border border-white/10 bg-[#0c0f17] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.32)] sm:p-7'
            >
              <div>
                <h2 className='text-[18px] font-extrabold text-white'>Hình ảnh</h2>
                <p className='mt-2 text-[15px] text-white/55'>Quản lý ảnh hiển thị ngoài trang mua sắm.</p>
              </div>

              <button
                type='button'
                onClick={() => fileRef.current?.click()}
                className='mt-5 flex h-[188px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-white/15 bg-white/[0.02] text-white/45 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-white'
              >
                <ImagePlus size={28} />
                <span className='mt-3 text-[16px] font-medium'>Bấm để chọn ảnh</span>
              </button>

              <input ref={fileRef} type='file' hidden multiple accept='image/*' onChange={handleMediaChange} />

              <InputError message={errors.medias?.message as string | undefined} />

              <div className='mt-5 grid grid-cols-3 gap-3'>
                {mediaPreview.length > 0
                  ? mediaPreview.slice(0, 6).map((item) => (
                      <div key={item.id} className='group relative overflow-hidden rounded-[18px] bg-white/[0.05]'>
                        <div className='flex h-[92px] w-full items-center justify-center px-3 text-center text-xs text-white/60'>
                          {item.name}
                        </div>

                        <button
                          type='button'
                          onClick={() => removeMedia(item.id)}
                          className='absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  : Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className='h-[92px] rounded-[18px] bg-white/[0.05]' />
                    ))}
              </div>

              <div className='mt-5 rounded-[26px] border border-rose-400/20 bg-[linear-gradient(180deg,rgba(110,28,44,0.45)_0%,rgba(79,21,38,0.65)_100%)] p-5'>
                <div className='text-[16px] font-extrabold text-rose-100'>Xem nhanh</div>
                <p className='mt-2 text-sm leading-6 text-rose-100/70'>
                  Kiểm tra lại thông tin trước khi tạo sản phẩm mới.
                </p>

                <div className='mt-5 rounded-[18px] bg-rose-900/40 px-5 py-4'>
                  <div className='space-y-2 text-sm text-rose-50/80'>
                    <div className='flex items-center justify-between gap-3'>
                      <span>Tên sản phẩm</span>
                      <span className='text-right font-semibold text-white'>{watchedValues.name || '-'}</span>
                    </div>

                    <div className='flex items-center justify-between gap-3'>
                      <span>Giá</span>
                      <span className='font-semibold text-white'>
                        {Number(watchedValues.price || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className='flex items-center justify-between gap-3'>
                      <span>Tồn kho</span>
                      <span className='font-semibold text-white'>{String(watchedValues.quantity || 0)}</span>
                    </div>

                    <div className='flex items-center justify-between gap-3'>
                      <span>Xuất xứ</span>
                      <span className='font-semibold text-white'>{watchedValues.origin || '-'}</span>
                    </div>

                    <div className='flex items-center justify-between gap-3'>
                      <span>Ảnh</span>
                      <span className='font-semibold text-white'>{mediaPreview.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </form>
        </div>
      </motion.div>
    </AdminTableShell>
  )
}
