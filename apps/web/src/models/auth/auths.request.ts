export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface TokenPairResponse {
  access_token: string
  refresh_token: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  password: string
  confirm_password: string
  forgot_password_token: string
}
