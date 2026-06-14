import nodemailer from 'nodemailer'
import type Transporter from 'nodemailer/lib/mailer'

/** App Password Gmail hiển thị dạng "xxxx xxxx xxxx xxxx" — SMTP cần 16 ký tự liền, không space */
export function getGmailAuth() {
  const user = process.env.GMAIL_USER?.trim()
  const pass = process.env.GMAIL_PASS?.replace(/\s/g, '')

  return { user, pass }
}

export function createMailTransporter(): Transporter {
  const { user, pass } = getGmailAuth()

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
  return process.env.HOST?.trim() || `http://localhost:${process.env.PORT || 3000}`
}
