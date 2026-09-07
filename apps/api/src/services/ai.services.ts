import databaseService from '~/services/database.service'

const stripEnv = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '')

type ProductDescriptionInput = {
  name: string
  brand?: string
  ingredients?: string
  skin_type?: string
  benefits?: string
}

const buildFallback = (input: ProductDescriptionInput) => {
  const name = input.name?.trim() || 'Sản phẩm chăm sóc da'
  const brand = input.brand?.trim()
  const ingredients = input.ingredients?.trim()
  const skinType = input.skin_type?.trim() || 'nhiều loại da'
  const benefits = input.benefits?.trim() || 'hỗ trợ chăm sóc da hằng ngày'

  return [
    `${brand ? `${brand} ` : ''}${name} là lựa chọn phù hợp cho routine skincare hiện đại, tập trung vào trải nghiệm dịu nhẹ và cảm giác dễ chịu khi sử dụng.`,
    '',
    `Công dụng nổi bật: ${benefits}.`,
    ingredients ? `Thành phần chính: ${ingredients}.` : '',
    `Phù hợp tham khảo cho: ${skinType}.`,
    '',
    'Hướng dẫn sử dụng: dùng trên nền da sạch theo thứ tự routine phù hợp, kết hợp kem chống nắng vào ban ngày.',
    'Lưu ý: nên thử sản phẩm trên vùng da nhỏ trước khi dùng toàn mặt; ngưng dùng nếu có dấu hiệu kích ứng.'
  ]
    .filter(Boolean)
    .join('\n')
}

class AiService {
  async generateProductDescription(input: ProductDescriptionInput) {
    const apiKey = stripEnv(process.env.OPENAI_API_KEY)
    if (!apiKey) return { description: buildFallback(input), source: 'template' }

    const prompt = `Viết mô tả bán hàng tiếng Việt cho mỹ phẩm skincare. Chỉ dùng thông tin sau, không hứa điều trị bệnh.
Tên: ${input.name}
Brand: ${input.brand || ''}
Thành phần: ${input.ingredients || ''}
Loại da: ${input.skin_type || ''}
Công dụng: ${input.benefits || ''}

Trả về: mô tả ngắn, bullet công dụng, cách dùng, lưu ý test kích ứng.`

    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: prompt
      })
    })
    if (!res.ok) return { description: buildFallback(input), source: 'template' }

    const data = await res.json()
    const text =
      data.output_text ||
      data.output?.flatMap((item: any) => item.content || []).map((item: any) => item.text).filter(Boolean).join('\n')
    return { description: text || buildFallback(input), source: text ? 'openai' : 'template' }
  }

  /**
   * Trợ lý AI Skincare Chatbot trả lời câu hỏi và gợi ý sản phẩm thật từ Database
   */
  async skincareChat(message: string) {
    const text = (message || '').trim()
    if (!text) {
      return {
        answer: 'Xin chào! Tôi là Trợ lý AI Skincare của Vibrant Mart ✨ Bạn cần tư vấn về routine hay sản phẩm nào hôm nay?',
        products: []
      }
    }

    const lower = text.toLowerCase()

    // 1. Truy vấn sản phẩm thật từ MongoDB Database
    let dbProducts: any[] = []
    try {
      const searchTerms = text
        .replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/gi, '')
        .split(/\s+/)
        .filter((word) => word.length > 1)

      const regexList = searchTerms.map((t) => new RegExp(t, 'i'))

      if (regexList.length > 0) {
        dbProducts = await databaseService.products
          .find({
            status: 0,
            $or: [
              { name: { $in: regexList } },
              { description: { $in: regexList } },
              { name: new RegExp(lower, 'i') }
            ]
          })
          .limit(4)
          .toArray()
      }

      if (dbProducts.length === 0) {
        dbProducts = await databaseService.products.find({ status: 0 }).limit(4).toArray()
      }
    } catch (e) {
      console.error('Error querying products for AI chat:', e)
    }

    const formattedProducts = dbProducts.map((p) => ({
      _id: p._id?.toString(),
      name: p.name,
      price: p.price,
      thumbnail: p.thumbnail,
      tag: p.quantity > 0 ? 'Bán chạy' : 'Cháy hàng'
    }))

    // 2. Nếu có OPENAI_API_KEY, gọi API OpenAI GPT
    const apiKey = stripEnv(process.env.OPENAI_API_KEY)
    if (apiKey) {
      try {
        const productContext = dbProducts
          .map((p) => `- ${p.name}: ${p.price?.toLocaleString('vi-VN')}đ`)
          .join('\n')

        const promptMessages = [
          {
            role: 'system',
            content:
              'Bạn là Trợ lý AI Skincare thông minh, tư vấn dịu dàng và chuyên nghiệp của shop mỹ phẩm Vibrant Mart. Trả lời tư vấn ngắn gọn (2-4 câu), chuẩn khoa học da liễu và giới thiệu sản phẩm liên quan.'
          },
          {
            role: 'user',
            content: `Khách hàng hỏi: "${text}"\nSản phẩm shop có sẵn:\n${productContext}`
          }
        ]

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: promptMessages,
            temperature: 0.7
          })
        })

        if (res.ok) {
          const data = await res.json()
          const aiAnswer = data.choices?.[0]?.message?.content
          if (aiAnswer) {
            return {
              answer: aiAnswer,
              products: formattedProducts
            }
          }
        }
      } catch (err) {
        console.error('OpenAI Chat error:', err)
      }
    }

    // 3. Dynamic Smart Response Fallback
    let answer =
      'Cảm ơn bạn đã nhắn! Bạn có thể tham khảo một số sản phẩm chăm sóc da hàng đầu bên dưới hoặc nhắn tin trực tiếp với chuyên viên để nhận tư vấn chi tiết nhé.'

    if (lower.includes('dầu') || lower.includes('mụn')) {
      answer =
        'Đối với da dầu mụn, bạn nên làm sạch sâu với sữa rửa mặt dịu nhẹ, kết hợp dung dịch BHA kiềm dầu và Serum Niacinamide 10% giúp thông thoáng lỗ chân lông và giảm sưng viêm hiệu quả.'
    } else if (lower.includes('thâm') || lower.includes('sáng') || lower.includes('serum')) {
      answer =
        'Để làm mờ thâm mụn và sáng da rạng rỡ, dòng Serum Vitamin C nguyên chất hoặc Niacinamide kết hợp là lựa chọn tuyệt vời. Nhớ dùng kèm kem chống nắng vào ban ngày nhé!'
    } else if (lower.includes('nắng') || lower.includes('spf')) {
      answer =
        'Kem chống nắng quang phổ rộng SPF 50+ PA++++ giúp nâng tông nhẹ, bảo vệ da tối đa trước tia UV và ánh sáng xanh mà không gây bít tắc lỗ chân lông.'
    } else if (lower.includes('giao hàng') || lower.includes('ship') || lower.includes('phí')) {
      answer =
        'Vibrant Mart miễn phí vận chuyển cho đơn hàng từ 299.000đ toàn quốc. Hàng được giao nhanh chỉ từ 1 - 3 ngày làm việc!'
    }

    return {
      answer,
      products: formattedProducts
    }
  }
}

const aiService = new AiService()
export default aiService
