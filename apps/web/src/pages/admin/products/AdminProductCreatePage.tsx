import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ImagePlus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import AdminTableShell from '../../../components/ui/AdminTable'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import {
  createProductSchema,
  type CreateProductFormInput,
  type CreateProductFormValues
} from '../../../middlewares/products.middlewares'
import { getBrandsApi } from '../../../services/brands.services'
import { getCategoriesApi } from '../../../services/categories.services'
import { uploadImageApi } from '../../../services/medias.services'
import { createProductApi } from '../../../services/products.services'

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
  return <p className='mt-2 text-xs font-semibold text-rose-600'>{message}</p>
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
  return findArrayData(response)
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
    setMediaPreview((prev) => [
      ...prev,
      ...imageFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        name: file.name,
        type: 0,
        file
      }))
    ])

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
        const uploadedUrl = getUploadedImageUrl(uploadResponse)

        if (!uploadedUrl) {
          throw new Error('Upload thành công nhưng không lấy được URL ảnh.')
        }

        return {
          url: uploadedUrl,
          type: item.type
        }
      })
    )
  }

  const onSubmit = async (values: CreateProductFormValues) => {
    try {
      setSubmitError('')
      setSubmitSuccess('')

      const payload = {
        ...values,
        medias: await uploadAllMedias()
      }

      await createProductApi(payload)
      setSubmitSuccess('Tạo sản phẩm thành công.')

      setTimeout(() => {
        nav('/admin/products')
      }, 700)
    } catch (error) {
      console.error(error)
      setSubmitError('Không thể tạo sản phẩm hoặc upload ảnh. Vui lòng thử lại.')
    }
  }

  return (
    <AdminTableShell
      title='Thêm sản phẩm'
      subTitle='Tạo sản phẩm mới, tồn kho, thông số vận chuyển và media.'
      createTo='/admin/products'
      createLabel='Quay lại danh sách'
    >
      <div className='space-y-5'>
        {submitError ? <Alert variant='error' title='Không thể lưu' desc={submitError} /> : null}
        {submitSuccess ? <Alert variant='success' title='Hoàn tất' desc={submitSuccess} /> : null}

        <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6 2xl:grid-cols-[1.7fr_0.9fr]'>
          <section className='surface-strong rounded-3xl p-5 md:p-7'>
            <div className='mb-7'>
              <h2 className='text-xl font-black text-ink-950'>Thông tin sản phẩm</h2>
              <p className='mt-2 text-sm leading-6 text-slate-500'>Nhập thông tin cơ bản, giá bán, tồn kho và mô tả.</p>
            </div>

            <div className='grid gap-5 md:grid-cols-2'>
              <label className='md:col-span-2'>
                <div className='mb-2 text-sm font-black text-ink-950'>Tên sản phẩm</div>
                <input {...register('name')} placeholder='Áo thun nam basic' className='premium-input h-14 text-base' />
                <InputError message={errors.name?.message} />
              </label>

              <label>
                <div className='mb-2 text-sm font-black text-ink-950'>Thương hiệu</div>
                <select {...register('brand_id')} disabled={optionLoading} className='premium-input h-14 cursor-pointer text-base disabled:opacity-60'>
                  <option value=''>{optionLoading ? 'Đang tải thương hiệu...' : 'Chọn thương hiệu'}</option>
                  {brandOptions.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <InputError message={errors.brand_id?.message} />
              </label>

              <label>
                <div className='mb-2 text-sm font-black text-ink-950'>Danh mục</div>
                <select {...register('category_id')} disabled={optionLoading} className='premium-input h-14 cursor-pointer text-base disabled:opacity-60'>
                  <option value=''>{optionLoading ? 'Đang tải danh mục...' : 'Chọn danh mục'}</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <InputError message={errors.category_id?.message} />
              </label>

              <FormInput label='Giá bán (VND)' type='number' register={register('price', { valueAsNumber: true })} error={errors.price?.message} />
              <FormInput label='Tồn kho' type='number' register={register('quantity', { valueAsNumber: true })} error={errors.quantity?.message} />
              <FormInput label='Xuất xứ' register={register('origin')} error={errors.origin?.message} placeholder='Việt Nam' />

              <FormInput
                label='Dung tích'
                type='number'
                register={register('volume', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
                error={errors.volume?.message}
                placeholder='Tùy chọn'
              />
              <FormInput
                label='Trọng lượng'
                type='number'
                register={register('weight', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
                error={errors.weight?.message}
                placeholder='Tùy chọn'
              />
              <FormInput
                label='Độ rộng'
                type='number'
                register={register('width', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
                error={errors.width?.message}
                placeholder='Tùy chọn'
              />
              <FormInput
                label='Độ cao'
                type='number'
                register={register('height', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
                error={errors.height?.message}
                placeholder='Tùy chọn'
              />

              <label className='md:col-span-2'>
                <div className='mb-2 text-sm font-black text-ink-950'>Mô tả sản phẩm</div>
                <textarea
                  rows={7}
                  {...register('description')}
                  placeholder='Mô tả sản phẩm...'
                  className='w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10'
                />
                <InputError message={errors.description?.message} />
              </label>
            </div>

            <div className='mt-7 flex flex-col gap-3 sm:flex-row'>
              <Button type='submit' disabled={!canSubmit} loading={isSubmitting}>
                <Save size={18} />
                Tạo sản phẩm
              </Button>
              <Button type='button' variant='secondary' onClick={handleReset}>
                <RotateCcw size={16} />
                Làm mới form
              </Button>
              <Link
                to='/admin/products'
                className='inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-ink-950'
              >
                <ArrowLeft size={16} />
                Quay lại
              </Link>
            </div>
          </section>

          <section className='surface-card rounded-3xl p-5 md:p-7'>
            <div>
              <h2 className='text-xl font-black text-ink-950'>Hình ảnh</h2>
              <p className='mt-2 text-sm leading-6 text-slate-500'>Quản lý ảnh hiển thị ngoài trang mua sắm.</p>
            </div>

            <button
              type='button'
              onClick={() => fileRef.current?.click()}
              className='mt-5 flex h-[188px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
            >
              <ImagePlus size={28} />
              <span className='mt-3 text-sm font-black'>Bấm để chọn ảnh</span>
            </button>

            <input ref={fileRef} type='file' hidden multiple accept='image/*' onChange={handleMediaChange} />

            <InputError message={errors.medias?.message as string | undefined} />

            <div className='mt-5 grid grid-cols-2 gap-3'>
              {mediaPreview.length > 0
                ? mediaPreview.slice(0, 6).map((item) => (
                    <div key={item.id} className='group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3'>
                      <div className='line-clamp-2 flex h-16 items-center text-xs font-bold text-slate-500'>{item.name}</div>
                      <button
                        type='button'
                        onClick={() => removeMedia(item.id)}
                        className='absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-rose-600 opacity-0 shadow-sm transition group-hover:opacity-100'
                        aria-label='Xóa ảnh'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                : Array.from({ length: 4 }).map((_, index) => <div key={index} className='h-24 rounded-2xl bg-slate-50' />)}
            </div>

            <div className='mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5'>
              <div className='text-base font-black text-ink-950'>Xem nhanh</div>
              <div className='mt-4 space-y-3 text-sm'>
                <PreviewRow label='Tên sản phẩm' value={watchedValues.name || '-'} />
                <PreviewRow label='Giá' value={`${Number(watchedValues.price || 0).toLocaleString('vi-VN')}đ`} />
                <PreviewRow label='Tồn kho' value={String(watchedValues.quantity || 0)} />
                <PreviewRow label='Xuất xứ' value={watchedValues.origin || '-'} />
                <PreviewRow label='Ảnh' value={String(mediaPreview.length)} />
              </div>
            </div>
          </section>
        </form>
      </div>
    </AdminTableShell>
  )
}

function FormInput({
  label,
  register,
  error,
  type = 'text',
  placeholder
}: {
  label: string
  register: any
  error?: string
  type?: string
  placeholder?: string
}) {
  return (
    <label>
      <div className='mb-2 text-sm font-black text-ink-950'>{label}</div>
      <input type={type} min={type === 'number' ? 0 : undefined} {...register} placeholder={placeholder} className='premium-input h-14 text-base' />
      <InputError message={error} />
    </label>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <span className='text-slate-500'>{label}</span>
      <span className='text-right font-black text-ink-950'>{value}</span>
    </div>
  )
}
