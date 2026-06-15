import nodemailer from 'nodemailer'
import type Transporter from 'nodemailer/lib/mailer'

const stripEnv = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '')

/** App Password Gmail hiển thị dạng "xxxx xxxx xxxx xxxx" — SMTP cần 16 ký tự liền, không space */
export function getGmailAuth() {
  const user = stripEnv(process.env.GMAIL_USER)
  const pass = stripEnv(process.env.GMAIL_PASS).replace(/\s/g, '')

  return { user, pass }
}

export function createMailTransporter(): Transporter {
  const { user, pass } = getGmailAuth()

  if (!user || !pass) {
    throw new Error('Missing Gmail SMTP configuration. Set GMAIL_USER and GMAIL_PASS.')
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user,
      pass
    }
  })
}

export function getApiBaseUrl() {
  return stripEnv(process.env.HOST) || `http://localhost:${process.env.PORT || 3000}`
}
