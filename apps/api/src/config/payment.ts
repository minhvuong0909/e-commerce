const stripEnv = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '')

export const PAYMENT_MODE = stripEnv(process.env.PAYMENT_MODE) || 'sandbox'
export const isPaymentProduction = PAYMENT_MODE === 'production'

const MOMO_SANDBOX_DEFAULTS = {
  partnerCode: 'MOMO',
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
}

const MOMO_PRODUCTION_ENDPOINT = 'https://payment.momo.vn/v2/gateway/api/create'

const apiBaseUrl = stripEnv(process.env.HOST) || stripEnv(process.env.API_URL) || 'http://localhost:3000'
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

export const assertMoMoProductionReady = () => {
  if (isPaymentProduction && !hasMoMoCredentials) {
    throw new Error(
      'Chua cau hinh MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY. Lay tu https://business.momo.vn/'
    )
  }
}
