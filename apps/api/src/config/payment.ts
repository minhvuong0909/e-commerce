import { PayOS } from '@payos/node'

const stripEnv = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '')

/** URL public của API — dùng cho MoMo redirect/ipn, PayPal return. Không dùng domain frontend. */
export function resolveApiBaseUrl(): string {
  const raw = stripEnv(process.env.API_URL) || stripEnv(process.env.HOST) || 'http://localhost:3000'
  return raw.replace(/\/+$/, '')
}

export const PAYMENT_MODE = stripEnv(process.env.PAYMENT_MODE) || 'sandbox'
export const isPaymentProduction = PAYMENT_MODE === 'production'

const MOMO_SANDBOX_DEFAULTS = {
  partnerCode: 'MOMO',
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
}

const MOMO_PRODUCTION_ENDPOINT = 'https://payment.momo.vn/v2/gateway/api/create'

const apiBaseUrl = resolveApiBaseUrl()
const clientBaseUrl = stripEnv(process.env.CLIENT_URL) || 'http://localhost:5173'

const envPartnerCode = stripEnv(process.env.MOMO_PARTNER_CODE)
const envAccessKey = stripEnv(process.env.MOMO_ACCESS_KEY)
const envSecretKey = stripEnv(process.env.MOMO_SECRET_KEY)
const hasMoMoCredentials = Boolean(envPartnerCode && envAccessKey && envSecretKey)

// Nếu chưa có key production → tự dùng sandbox để dev/test vẫn chạy được
const useMoMoSandbox =
  !hasMoMoCredentials ||
  stripEnv(process.env.MOMO_ENDPOINT).includes('test-payment.momo.vn') ||
  (!isPaymentProduction && !hasMoMoCredentials)

const momoEndpoint =
  stripEnv(process.env.MOMO_ENDPOINT) ||
  (isPaymentProduction && hasMoMoCredentials ? MOMO_PRODUCTION_ENDPOINT : MOMO_SANDBOX_DEFAULTS.endpoint)

const isMoMoSandbox = useMoMoSandbox || momoEndpoint.includes('test-payment.momo.vn')

export const MOMO_CONFIG = {
  partnerCode: envPartnerCode || MOMO_SANDBOX_DEFAULTS.partnerCode,
  accessKey: envAccessKey || MOMO_SANDBOX_DEFAULTS.accessKey,
  secretKey: envSecretKey || MOMO_SANDBOX_DEFAULTS.secretKey,
  endpoint: isMoMoSandbox ? MOMO_SANDBOX_DEFAULTS.endpoint : momoEndpoint,
  ipnUrl: stripEnv(process.env.MOMO_IPN_URL) || `${apiBaseUrl}/payment/momo/webhook`,
  redirectUrl: stripEnv(process.env.MOMO_REDIRECT_URL) || `${apiBaseUrl}/payment/momo/return`
}

export const isMoMoSandboxMode = isMoMoSandbox

export const PAYPAL_CONFIG = {
  apiUrl:
    stripEnv(process.env.PAYPAL_API_URL) ||
    (isPaymentProduction ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'),
  returnUrl: stripEnv(process.env.PAYPAL_RETURN_URL) || `${apiBaseUrl}/payment/paypal/success`,
  cancelUrl: stripEnv(process.env.PAYPAL_CANCEL_URL) || `${clientBaseUrl}/user/orders`,
  clientId: stripEnv(process.env.PAYPAL_CLIENT_ID),
  clientSecret: stripEnv(process.env.PAYPAL_CLIENT_SECRET),
  vndPerUsd: (() => {
    const parsed = Number(stripEnv(process.env.PAYPAL_VND_PER_USD))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 25000
  })()
}

export const PAYOS_CONFIG = {
  clientId: stripEnv(process.env.PAYOS_CLIENT_ID),
  apiKey: stripEnv(process.env.PAYOS_API_KEY),
  checksumKey: stripEnv(process.env.PAYOS_CHECKSUM_KEY),
  cancelUrl: stripEnv(process.env.PAYOS_CANCEL_URL) || `${clientBaseUrl}/user/orders`,
  returnUrl: stripEnv(process.env.PAYOS_RETURN_URL) || `${apiBaseUrl}/payment/payos/return`
}

export const payos = new PayOS({
  clientId: PAYOS_CONFIG.clientId,
  apiKey: PAYOS_CONFIG.apiKey,
  checksumKey: PAYOS_CONFIG.checksumKey
})

export const assertMoMoProductionReady = () => {
  if (isPaymentProduction && !hasMoMoCredentials) {
    throw new Error(
      'Chua cau hinh MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY. Lay tu https://business.momo.vn/'
    )
  }

  const clientUrl = clientBaseUrl.replace(/\/+$/, '')
  if (MOMO_CONFIG.redirectUrl.startsWith(clientUrl)) {
    throw new Error(
      'MOMO_REDIRECT_URL phai tro ve API (/payment/momo/return), khong tro ve CLIENT_URL (frontend).'
    )
  }
}
