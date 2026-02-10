import { useState } from 'react'

type MediaItem = {
  id: string
  type: 'image' | 'video'
  name: string
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([
    { id: '1', type: 'image', name: 'img_01.jpg' },
    { id: '2', type: 'image', name: 'img_02.jpg' },
    { id: '3', type: 'video', name: 'intro.mp4' }
  ])

  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id))

  return (
    <div>
      <h1 className='text-2xl font-extrabold text-gray-900'>Media Library</h1>
      <p className='mt-1 text-gray-600'>Upload images/videos và gắn vào Product/Brand/Category (demo UI).</p>

      {/* Upload */}
      <div className='mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='font-bold text-gray-900'>Upload</div>
            <div className='text-sm text-gray-600'>Multiple upload + preview grid.</div>
          </div>

          <button className='rounded-2xl px-4 py-2 font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-md'>
            + Upload Media
          </button>
        </div>

        <div className='mt-4 h-40 rounded-3xl border border-dashed flex items-center justify-center text-gray-500'>
          Kéo thả file vào đây (demo)
        </div>
      </div>

      {/* Preview Grid */}
      <div className='mt-6 grid gap-6 md:grid-cols-3'>
        {items.map((m) => (
          <div key={m.id} className='rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5'>
            <div className='h-40 rounded-2xl bg-gray-100 flex items-center justify-center text-5xl'>
              {m.type === 'image' ? '🖼️' : '🎬'}
            </div>

            <div className='mt-3 flex items-start justify-between gap-3'>
              <div>
                <div className='font-semibold'>{m.name}</div>
                <div className='text-xs text-gray-500'>{m.type}</div>
              </div>

              <button
                onClick={() => remove(m.id)}
                className='rounded-xl border px-3 py-1 font-semibold hover:bg-gray-50'
              >
                ❌
              </button>
            </div>

            <button className='mt-3 w-full rounded-2xl border bg-white px-4 py-2 font-semibold hover:bg-gray-50'>
              Attach to Product (demo)
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
