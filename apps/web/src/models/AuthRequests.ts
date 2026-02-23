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

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface User {
  _id: string
  name: string
  email: string
  date_of_birth: string
  role: number
  verify_status: number
  bio?: string
  location: string
  website?: string
  username: string
  avatar?: string
  cover_photo?: string
}
