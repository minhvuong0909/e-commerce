import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Bot,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  X
} from 'lucide-react'
import { getShopSettingsApi, type ShopSettings } from '../../services/shop_settings.services'
import { skincareChatApi } from '../../services/ai.services'
import money from '../../utils/money'
import { formatImageUrl } from '../../utils/formatImageUrl'
import { ROUTE_PATHS } from '../../routes/route.paths'

const fallbackSettings: ShopSettings = {
  shop_name: 'Vibrant Mart',
  hotline: import.meta.env.VITE_SHOP_HOTLINE || '0909123456',
  zalo_url: import.meta.env.VITE_SHOP_ZALO_URL || 'https://zalo.me',
  messenger_url: import.meta.env.VITE_SHOP_MESSENGER_URL || 'https://m.me'
}

interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
  recommendations?: Array<{ _id?: string; name: string; price: number; tag: string; thumbnail?: string }>
}

const INITIAL_AI_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'ai',
    text: 'Xin chào! Tôi là Trợ lý AI Skincare của Vibrant Mart ✨ Bạn cần tư vấn về routine chăm sóc da hay tìm sản phẩm nào cho làn da của mình hôm nay?',
    timestamp: 'Vừa xong'
  }
]

const QUICK_PROMPTS = [
  '💡 Gợi ý routine cho da dầu mụn?',
  '✨ Serum nào mờ thâm tốt nhất?',
  '☀️ Chọn kem chống nắng SPF50+?',
  '🚚 Chính sách giao hàng & Freeship?'
]

const generateMessageId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
const getFormattedTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function FloatingContactWidget() {
  const [settings, setSettings] = useState<ShopSettings>(fallbackSettings)
  const [isOpen, setIsOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_AI_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getShopSettingsApi()
      .then((res) => setSettings({ ...fallbackSettings, ...res.data.result }))
      .catch(() => setSettings(fallbackSettings))
  }, [])

  useEffect(() => {
    if (isAiModalOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isAiModalOpen])

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputValue).trim()
    if (!text) return

    const userMsg: ChatMessage = {
      id: generateMessageId(),
      sender: 'user',
      text,
      timestamp: getFormattedTime()
    }

    setMessages((prev) => [...prev, userMsg])
    if (!customText) setInputValue('')
    setIsTyping(true)

    try {
      const res = await skincareChatApi(text)
      const data = res.data.result
      const aiMsg: ChatMessage = {
        id: generateMessageId(),
        sender: 'ai',
        text: data.answer,
        timestamp: getFormattedTime(),
        recommendations: data.products
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      const aiMsg: ChatMessage = {
        id: generateMessageId(),
        sender: 'ai',
        text: 'Cảm ơn bạn đã nhắn! Để nhận tư vấn chuyên sâu hơn cho tình trạng da cụ thể, bạn có thể gọi hotline hoặc chat trực tiếp qua Zalo/Messenger với chuyên viên nhé.',
        timestamp: getFormattedTime()
      }
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const hotlineHref = settings.hotline ? `tel:${settings.hotline}` : 'tel:0909123456'
  const zaloHref = settings.zalo_url || 'https://zalo.me'
  const messengerHref = settings.messenger_url || 'https://m.me'

  return (
    <>
      {/* Speed Dial Floating Action Button (FAB) Container */}
      <div className='fixed bottom-[84px] right-4 z-50 flex flex-col items-end md:bottom-6 md:right-6'>
        {/* Speed Dial Menu List */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className='mb-3 flex flex-col gap-2.5 items-end'
            >
              {/* Option 1: AI Skincare Assistant */}
              <button
                type='button'
                onClick={() => {
                  setIsOpen(false)
                  setIsAiModalOpen(true)
                }}
                className='group flex items-center gap-3 rounded-2xl border border-[#eaded8] bg-white px-4 py-2.5 shadow-xl shadow-[#3d3330]/10 transition hover:-translate-y-0.5 hover:bg-[#fdf8f6]'
              >
                <span className='text-xs font-bold text-[#3d3330] group-hover:text-[#c65f4a]'>
                  🤖 Hỏi trợ lý AI Skincare
                </span>
                <span className='grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-r from-[#3d3330] to-[#c65f4a] text-white shadow-sm'>
                  <Sparkles size={17} />
                </span>
              </button>

              {/* Option 2: Zalo Chat */}
              <a
                href={zaloHref}
                target='_blank'
                rel='noreferrer'
                onClick={() => setIsOpen(false)}
                className='group flex items-center gap-3 rounded-2xl border border-[#eaded8] bg-white px-4 py-2.5 shadow-xl shadow-[#3d3330]/10 transition hover:-translate-y-0.5 hover:bg-[#fdf8f6]'
              >
                <span className='text-xs font-bold text-[#3d3330] group-hover:text-blue-600'>
                  💬 Chat qua Zalo
                </span>
                <span className='grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm'>
                  <MessageCircle size={17} />
                </span>
              </a>

              {/* Option 3: Facebook Messenger */}
              <a
                href={messengerHref}
                target='_blank'
                rel='noreferrer'
                onClick={() => setIsOpen(false)}
                className='group flex items-center gap-3 rounded-2xl border border-[#eaded8] bg-white px-4 py-2.5 shadow-xl shadow-[#3d3330]/10 transition hover:-translate-y-0.5 hover:bg-[#fdf8f6]'
              >
                <span className='text-xs font-bold text-[#3d3330] group-hover:text-indigo-600'>
                  👤 Facebook Messenger
                </span>
                <span className='grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm'>
                  <MessageSquare size={17} />
                </span>
              </a>

              {/* Option 4: Hotline Call */}
              <a
                href={hotlineHref}
                onClick={() => setIsOpen(false)}
                className='group flex items-center gap-3 rounded-2xl border border-[#eaded8] bg-white px-4 py-2.5 shadow-xl shadow-[#3d3330]/10 transition hover:-translate-y-0.5 hover:bg-[#fdf8f6]'
              >
                <span className='text-xs font-bold text-[#3d3330] group-hover:text-emerald-600'>
                  📞 Hotline
                </span>
                <span className='grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm'>
                  <Phone size={17} />
                </span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Welcome Bubble Header when FAB menu is closed */}
        {!isOpen && !isAiModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
            onClick={() => {
              setIsOpen(false)
              setIsAiModalOpen(true)
            }}
            className='group mb-2 cursor-pointer rounded-2xl border border-[#eaded8] bg-white p-3 shadow-xl shadow-[#3d3330]/10 transition hover:-translate-y-1 hover:border-[#c65f4a]'
          >
            <div className='flex items-center gap-2.5'>
              <div className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fdf2f0] text-[#c65f4a]'>
                <Sparkles size={14} className='animate-spin' />
              </div>
              <div>
                <p className='text-[11px] font-bold text-[#3d3330] group-hover:text-[#c65f4a]'>
                  👋 Xin chào! Cần tư vấn da?
                </p>
                <p className='text-[10px] text-[#786452]'>Chat ngay với Trợ lý AI Skincare ✨</p>
              </div>
            </div>
            {/* Arrow tail pointing down */}
            <div className='absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-[#eaded8] bg-white' />
          </motion.div>
        )}

        {/* Main Trigger Button */}
        <button
          type='button'
          onClick={() => setIsOpen((prev) => !prev)}
          className='group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#3d3330] via-[#4e403c] to-[#c65f4a] p-3 pl-4 text-white shadow-2xl shadow-[#3d3330]/30 transition duration-300 hover:scale-105 active:scale-95'
          aria-label='Hỗ trợ & Trợ lý AI Skincare'
        >
          <span className='text-xs font-bold tracking-wide text-white pr-1 hidden sm:inline-block'>
            {isOpen ? 'Đóng menu' : 'Hỗ trợ'}
          </span>

          <span className='grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md'>
            {isOpen ? <X size={20} /> : <Sparkles size={18} className='animate-pulse' />}
          </span>

          {/* Pulsing indicator ring when closed */}
          {!isOpen && (
            <span className='absolute -top-1 -right-1 flex h-4 w-4'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex rounded-full h-4 w-4 bg-emerald-500' />
            </span>
          )}
        </button>
      </div>

      {/* AI Skincare Assistant Chat Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className='fixed inset-0 z-[100] flex items-end justify-end p-2 sm:p-6 bg-black/40 backdrop-blur-xs'>
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className='flex h-[560px] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[#eaded8] bg-white shadow-2xl'
            >
              {/* Header */}
              <div className='flex items-center justify-between border-b border-[#eaded8] bg-gradient-to-r from-[#3d3330] to-[#4e403c] p-4 text-white'>
                <div className='flex items-center gap-3'>
                  <div className='grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-md'>
                    <Bot size={22} />
                  </div>
                  <div>
                    <h3 className='text-sm font-bold text-white'>Trợ lý AI Skincare ✨</h3>
                    <p className='text-[11px] text-white/80 flex items-center gap-1'>
                      <span className='h-2 w-2 rounded-full bg-emerald-400 animate-pulse' />
                      Sẵn sàng tư vấn 24/7
                    </p>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={() => setIsAiModalOpen(false)}
                  className='grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20'
                  aria-label='Đóng khung chat'
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat Message List */}
              <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF7F2]'>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#3d3330] text-white rounded-br-none'
                          : 'bg-white text-[#3d3330] border border-[#eaded8] rounded-bl-none'
                      }`}
                    >
                      <p className='leading-relaxed'>{msg.text}</p>

                      {/* Recommended Products */}
                      {msg.recommendations && msg.recommendations.length > 0 ? (
                        <div className='mt-3 space-y-2 border-t border-[#f0e4de] pt-2'>
                          <p className='text-[11px] font-bold text-[#c65f4a] uppercase tracking-wider'>
                            Gợi ý sản phẩm từ cửa hàng:
                          </p>
                          {msg.recommendations.map((p, i) => {
                            const cardContent = (
                              <div className='flex items-center justify-between gap-2.5 rounded-xl border border-[#eaded8] bg-[#fdf8f6] p-2 text-xs font-semibold text-[#3d3330] transition hover:border-[#c65f4a] hover:bg-white'>
                                <div className='flex items-center gap-2 overflow-hidden min-w-0'>
                                  {p.thumbnail ? (
                                    <img
                                      src={formatImageUrl(p.thumbnail)}
                                      alt={p.name}
                                      className='h-9 w-9 shrink-0 rounded-lg object-cover border border-[#eaded8]'
                                    />
                                  ) : null}
                                  <div className='truncate'>
                                    <span className='block font-bold text-[#3d3330] truncate'>{p.name}</span>
                                    <span className='text-[11px] font-bold text-[#c65f4a]'>{money(p.price)}</span>
                                  </div>
                                </div>
                                <span className='shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700'>
                                  {p.tag}
                                </span>
                              </div>
                            )

                            return p._id ? (
                              <Link
                                key={i}
                                to={`${ROUTE_PATHS.USER_PRODUCTS}/${p._id}`}
                                onClick={() => setIsAiModalOpen(false)}
                                className='block text-left'
                              >
                                {cardContent}
                              </Link>
                            ) : (
                              <div key={i}>{cardContent}</div>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
                    <span className='mt-1 text-[10px] font-medium text-[#8a7a74] px-1'>
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className='flex items-center gap-2 rounded-2xl bg-white border border-[#eaded8] px-4 py-3 text-xs font-semibold text-[#8a7a74] w-fit'>
                    <Bot size={16} className='text-[#c65f4a] animate-spin' />
                    AI đang soạn câu trả lời...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts Chips */}
              <div className='border-t border-[#eaded8] bg-white p-2 overflow-x-auto flex gap-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                {QUICK_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                    className='shrink-0 rounded-full border border-[#eaded8] bg-[#FAF7F2] px-3 py-1.5 text-[11px] font-bold text-[#6b5f59] transition hover:border-[#c65f4a] hover:bg-[#fdf8f6] hover:text-[#c65f4a]'
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className='border-t border-[#eaded8] bg-white p-3 flex items-center gap-2'>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder='Nhập thắc mắc về da hoặc sản phẩm...'
                  className='h-11 flex-1 rounded-full border border-[#eaded8] bg-[#FAF7F2] px-4 text-xs font-semibold text-[#3d3330] outline-none focus:border-[#c65f4a] focus:ring-2 focus:ring-[#f5d5cf]/60'
                />
                <button
                  type='button'
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#3d3330] text-white shadow-md transition hover:bg-[#2b2118] disabled:opacity-50'
                  aria-label='Gửi tin nhắn'
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
