import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import cn from '../../utils/cn'

type ConfirmOptions = {
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  /** red confirm button for destructive actions */
  danger?: boolean
}

type ConfirmFn = (message: string, options?: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/** Drop-in async replacement for window.confirm: `if (!(await confirm('...'))) return` */
// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return ctx
}

type Pending = { message: string; options: ConfirmOptions; resolve: (v: boolean) => void }

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback<ConfirmFn>(
    (message, options = {}) => new Promise<boolean>((resolve) => setPending({ message, options, resolve })),
    []
  )

  const close = useCallback(
    (result: boolean) => {
      pending?.resolve(result)
      setPending(null)
    },
    [pending]
  )

  useEffect(() => {
    if (!pending) return
    confirmBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, close])

  const o = pending?.options
  const danger = o?.danger ?? true

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending
        ? createPortal(
            <div className='fixed inset-0 z-[300] grid place-items-center p-4'>
              <div className='absolute inset-0 bg-ink-950/50' onClick={() => close(false)} aria-hidden />
              <div
                role='alertdialog'
                aria-modal='true'
                aria-labelledby='confirm-title'
                className='relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift animate-soft-pop'
              >
                <h2 id='confirm-title' className='font-display text-lg font-semibold text-ink-950'>
                  {o?.title ?? 'Xác nhận'}
                </h2>
                <p className='mt-2 text-sm leading-relaxed text-ink-600'>{pending.message}</p>
                <div className='mt-6 flex justify-end gap-2'>
                  <button
                    type='button'
                    onClick={() => close(false)}
                    className='h-10 cursor-pointer rounded-lg border border-ink-200 px-4 text-sm font-semibold text-ink-800 transition hover:border-berry-300'
                  >
                    {o?.cancelLabel ?? 'Hủy'}
                  </button>
                  <button
                    ref={confirmBtnRef}
                    type='button'
                    onClick={() => close(true)}
                    className={cn(
                      'h-10 cursor-pointer rounded-lg px-4 text-sm font-semibold text-white transition',
                      danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-berry-600 hover:bg-berry-700'
                    )}
                  >
                    {o?.confirmLabel ?? 'Đồng ý'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </ConfirmContext.Provider>
  )
}
