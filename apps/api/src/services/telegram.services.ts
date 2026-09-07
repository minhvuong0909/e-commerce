import https from 'https'

const stripEnv = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '')

class TelegramService {
  private token = stripEnv(process.env.TELEGRAM_BOT_TOKEN)
  private chatId = stripEnv(process.env.TELEGRAM_CHAT_ID)

  isEnabled() {
    return Boolean(this.token && this.chatId)
  }

  async sendMessage(text: string) {
    if (!this.isEnabled()) return

    const body = JSON.stringify({
      chat_id: this.chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })

    await new Promise<void>((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.telegram.org',
          path: `/bot${this.token}/sendMessage`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        },
        (res) => {
          let response = ''
          res.on('data', (chunk) => (response += chunk))
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve()
              return
            }
            reject(new Error(`Telegram API error ${res.statusCode}: ${response}`))
          })
        }
      )
      req.on('error', reject)
      req.write(body)
      req.end()
    })
  }
}

const telegramService = new TelegramService()
export default telegramService
