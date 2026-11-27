import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUp, MessageCircleHeart, RotateCcw, Sparkles, X } from 'lucide-react'
import { skincareChatApi, type ChatProduct, type ChatTurn } from '../../services/ai.services'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatImageUrl } from '../../utils/formatImageUrl'
import money from '../../utils/money'
import cn from '../../utils/cn'
import { ROUTE_PATHS } from '../../routes/route.paths'

type Message = ChatTurn & { id: number; products?: ChatProduct[]; error?: boolean }

const STORAGE_KEY = 'vm_chat_v1'
const MAX_CHARS = 1000
const HISTORY_TURNS = 6

const QUICK_PROMPTS = ['Da dầu hay nổi mụn nên dùng gì?', 'Routine sáng cho da khô', 'Kem chống nắng cho da nhạy cảm', 'Làm mờ thâm mụn thế nào?']

const GREETING: Message = {
  id: 0,
  role: 'assistant',
  content: 'Chào bạn! Mình là trợ lý chăm sóc da của Vibrant Mart. Kể mình nghe loại da và điều bạn đang băn khoăn nhé.'
}

function loadMessages(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Message[]) : null
    return Array.isArray(parsed) && parsed.length ? parsed : [GREETING]
  } catch {
    return [GREETING]
  }
}

/** Hide the launcher where a mobile sticky action bar already owns the bottom of the screen. */
const HIDE_LAUNCHER_ON_MOBILE = [/^\/user\/products\/[^/]+$/, /^\/user\/checkout/, /^\/user\/cart/]

export default function ChatAssistant() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(loadMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)))
  }, [messages])

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, sending])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const send = async (text: string) => {
    const content = text.trim().slice(0, MAX_CHARS)
    if (!content || sending) return
    const history: ChatTurn[] = messages
      .filter((m) => m.id !== GREETING.id && !m.error)
      .slice(-HISTORY_TURNS)
      .map(({ role, content: c }) => ({ role, content: c }))

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content }])
    setInput('')
    setSending(true)
    try {
      const res = await skincareChatApi(content, history)
      const { answer, products } = res.data.result
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: answer, products }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          error: true,
          content: getApiErrorMessage(err, 'Trợ lý đang bận. Bạn thử lại sau ít phút nhé.')
        }
      ])
    } finally {
      setSending(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  const reset = () => setMessages([GREETING])
  const hideOnMobile = HIDE_LAUNCHER_ON_MOBILE.some((re) => re.test(pathname))
  const onlyGreeting = messages.length === 1

  return (
    <>
      {!open ? (
        <button
          type='button'
          onClick={() => setOpen(true)}
          aria-label='Mở trợ lý chăm sóc da'
          className={cn(
            'group fixed bottom-[5.75rem] right-4 z-[60] h-14 cursor-pointer items-center gap-2 rounded-full bg-ink-950 pl-4 pr-5 text-white shadow-lift transition hover:bg-berry-600 lg:bottom-6 lg:right-6',
            hideOnMobile ? 'hidden lg:inline-flex' : 'inline-flex'
          )}
        >
          <span className='relative grid h-8 w-8 place-items-center rounded-full bg-berry-500 transition group-hover:bg-white group-hover:text-berry-600'>
            <MessageCircleHeart size={18} aria-hidden />
            <span className='absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-lime-300 ring-2 ring-ink-950 group-hover:ring-berry-600' />
          </span>
          <span className='text-sm font-semibold'>Hỏi trợ lý da</span>
        </button>
      ) : null}

      {open ? (
        <div
          role='dialog'
          aria-modal='false'
          aria-label='Trợ lý chăm sóc da'
          className='fixed inset-x-0 bottom-0 z-[95] flex h-[85vh] flex-col overflow-hidden rounded-t-4xl bg-canvas shadow-lift ring-1 ring-ink-100 animate-fade-up sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[640px] sm:max-h-[calc(100vh-3rem)] sm:w-[400px] sm:rounded-4xl'
        >
          {/* header */}
          <div className='relative overflow-hidden bg-ink-950 px-5 pb-5 pt-4 text-white'>
            <div aria-hidden className='pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-berry-500/50 blur-3xl' />
            <div className='relative flex items-center gap-3'>
              <span className='grid h-11 w-11 place-items-center rounded-2xl bg-berry-300 text-ink-950'>
                <Sparkles size={20} aria-hidden />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='font-display text-lg font-bold leading-tight'>Trợ lý da Vibrant</p>
                <p className='flex items-center gap-1.5 text-xs text-ink-300'>
                  <span className='h-1.5 w-1.5 rounded-full bg-lime-300' aria-hidden /> Gợi ý từ sản phẩm đang có hàng
                </p>
              </div>
              <button
                type='button'
                onClick={reset}
                aria-label='Bắt đầu cuộc trò chuyện mới'
                title='Trò chuyện mới'
                className='grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink-300 transition hover:bg-white/10 hover:text-white'
              >
                <RotateCcw size={16} />
              </button>
              <button
                type='button'
                onClick={() => setOpen(false)}
                aria-label='Đóng trợ lý'
                className='grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink-300 transition hover:bg-white/10 hover:text-white'
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* messages */}
          <div ref={listRef} className='flex-1 space-y-3 overflow-y-auto px-4 py-4' aria-live='polite'>
            {messages.map((m) => (
              <div key={m.id} className={cn('flex flex-col', m.role === 'user' ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-line rounded-3xl px-4 py-2.5 text-[14px] leading-relaxed',
                    m.role === 'user'
                      ? 'rounded-br-lg bg-ink-950 text-white'
                      : m.error
                        ? 'rounded-bl-lg bg-rose-50 text-rose-700'
                        : 'rounded-bl-lg bg-white text-ink-900 ring-1 ring-ink-100'
                  )}
                >
                  {m.content}
                </div>
                {m.products?.length ? (
                  <div className='no-scrollbar mt-2 flex w-full gap-2 overflow-x-auto pb-1'>
                    {m.products.map((p) => {
                      const img = formatImageUrl(p.thumbnail)
                      return (
                        <Link
                          key={p._id}
                          to={ROUTE_PATHS.USER_PRODUCT_DETAIL(p._id)}
                          onClick={() => setOpen(false)}
                          className='flex w-44 shrink-0 items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-ink-100 transition hover:ring-ink-950'
                        >
                          <span className='h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-berry-50'>
                            {img ? <img src={img} alt='' className='h-full w-full object-contain p-0.5 mix-blend-multiply' /> : null}
                          </span>
                          <span className='min-w-0'>
                            <span className='line-clamp-2 text-xs font-semibold leading-snug'>{p.name}</span>
                            <span className='text-xs text-ink-600'>{money(p.price)}</span>
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            ))}

            {sending ? (
              <div className='flex items-center gap-1 rounded-3xl rounded-bl-lg bg-white px-4 py-3.5 ring-1 ring-ink-100 w-fit' aria-label='Trợ lý đang trả lời'>
                {[0, 150, 300].map((d) => (
                  <span key={d} className='h-2 w-2 animate-bounce rounded-full bg-berry-400' style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            ) : null}

            {onlyGreeting && !sending ? (
              <div className='flex flex-wrap gap-2 pt-1'>
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type='button'
                    onClick={() => void send(q)}
                    className='chip cursor-pointer border-[1.5px] border-ink-200 bg-white text-left text-ink-800 transition hover:border-ink-950'
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* composer */}
          <form onSubmit={onSubmit} className='border-t border-ink-100 bg-white px-3 pb-3 pt-3'>
            <div className='flex items-end gap-2 rounded-3xl bg-ink-50 p-1.5 pl-4 ring-1 ring-transparent focus-within:bg-white focus-within:ring-ink-950'>
              <label htmlFor='chat-input' className='sr-only'>
                Câu hỏi của bạn
              </label>
              <textarea
                id='chat-input'
                ref={inputRef}
                value={input}
                rows={1}
                maxLength={MAX_CHARS}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    void send(input)
                  }
                }}
                placeholder='Hỏi về routine, thành phần, sản phẩm…'
                className='max-h-28 min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-ink-400'
              />
              <button
                type='submit'
                disabled={!input.trim() || sending}
                aria-label='Gửi'
                className='grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-berry-600 text-white transition hover:bg-berry-700 disabled:cursor-not-allowed disabled:bg-ink-200'
              >
                <ArrowUp size={18} />
              </button>
            </div>
            <p className='mt-2 px-2 text-center text-[11px] text-ink-400'>
              Tư vấn tham khảo, không thay thế bác sĩ da liễu.
            </p>
          </form>
        </div>
      ) : null}
    </>
  )
}
