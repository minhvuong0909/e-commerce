import { RoleStatus, TokenType, USER_ROLE, UserVerifyStatus } from '~/constants/enums'
import { signToken, verifyToken } from '~/utils/jwt'
import databaseService from './database.service'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { comparePassword, hashPassword } from '~/utils/crypto'
import RefreshToken from '~/models/schemas/Refresh_Tokens.schema'
import User from '~/models/schemas/Users.schema'
import { RegisterRequestBody } from '~/models/requests/Users.requests'
import { update } from 'lodash'
import { Resend } from 'resend'

class UserServices {
  // kí access_token bằng jwt
  private signAccessToken(user_id: string) {
    // signToken là bất đồng bộ nên khi nào sử dụng hàm này thì mới xử lý await
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }

  // hàm kí refresh token
  private signRefreshToken(user_id: string, exp?: number) {
    if (exp !== undefined) {
      // tự set exp cho refresh token (timestamp kiểu số giây)
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }

    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }

  // decode refresh_token để xác thưc token
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }
  // hàm gửi mail xác thức token
  async sendEmail(to: string, subject: string, html: string) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    try {
      const result = await resend.emails.send({
        from: process.env.EMAIL_ECOMMERCE as string,
        to,
        subject,
        html
      })
      return result
    } catch (error) {
      console.error('Email error:', error)
      throw error
    }
  }
  // async sendVerifyEmail(email: string, token: string) {
  //   const verifyUrl = `https://yourdomain.com/verify-email?token=${token}`

  //   await this.sendEmail(
  //     email,
  //     'Verify your account',
  //     `
  //     <h2>Welcome to My E-commerce</h2>
  //     <p>Click the link below to verify your account:</p>
  //     <a href="${verifyUrl}">${verifyUrl}</a>
  //   `
  //   )
  // }
  // hàm kí access_token và refresh_token
  async signAccessAndRefreshTokens(user_id: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    return { access_token, refresh_token }
  }
  // check email exist
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  // find user by id
  async findUserById(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    return user
  }
  // hàm login
  async login({ email, password }: { email: string; password: string }) {
    const user = await databaseService.users.findOne({ email })
    // nếu email error
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_IS_INCORRECT,
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY // 422
      })
    }
    // password error
    if (!comparePassword(password, user.password)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422
        message: USERS_MESSAGES.Password_IS_INCORRECT
      })
    }
    // check
    // nếu có user thì tạo access_token và refresh_token
    const user_id = user._id.toString()
    // gọi hàm kí 2 token
    const tokens = await this.signAccessAndRefreshTokens(user_id)
    const { iat, exp } = await this.decodeRefreshToken(tokens.refresh_token)
    // lưu vào refresh_token lại
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: tokens.refresh_token,
        iat,
        exp
      })
    )
    return { tokens }
  }

  // hàm sign email verify token
  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN
      }
    })
  }
  // check email verify token, kiểm tra user có sở hữu 2 thông tin này không
  async checkEmailVerifyToken({ user_id, email_verify_token }: { user_id: string; email_verify_token: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      email_verify_token
    })
    // nếu kh có thì token này đã bị thay thế
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID
      })
    }
    return user
  }

  // check refresh token có tồn tại trong db và cùng user_id không
  async checkRefreshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    const refreshToken = await databaseService.refreshTokens.findOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })
    if (!refreshToken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }
    return refreshToken
  }

  // hàm verify email ( check email token đúng mã, user ), cập nhật status account
  async verifyEmail(user_id: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            verify_status: UserVerifyStatus.Verified,
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }
  // hàm register
  async register(payload: RegisterRequestBody) {
    let user_id = new ObjectId() // lấy id sau khi success
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    const result = await databaseService.users.insertOne(
      new User({
        _id: user_id,
        username: `user${user_id.toString()}`, // dùng mã để tạo ra username mặc định
        email_verify_token,
        ...payload,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    // sau khi insert vào db thì sign token cho nó
    const tokens = await this.signAccessAndRefreshTokens(user_id.toString())
    // check có đúng email verify token gửi lên không
    const uri = `http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}`
    await this.sendEmail(
      payload.email,
      'Verify your account',
      `
          <h2>Welcome to My E-commerce</h2>
          <p>Click the link below to verify your account:</p>
          <a href="${uri}">${uri}</a>
        `
    )
    console.log(`Gửi mail link xác thực sau: 
        http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
      `)
    const { iat, exp } = await this.decodeRefreshToken(tokens.refresh_token)

    // lưu refresh_token
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: tokens.refresh_token,
        iat,
        exp
      })
    )
    return { tokens }
  }

  // hàm logout
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
  }

  // hàm resend-verify-email
  async resendEmailVerify(user_id: string) {
    // cho nó kí lại email verify token
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    // tìm user đúng id
    const user = await this.findUserById(user_id)
    const uri = `http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}`
    await this.sendEmail(
      user.email,
      'Verify your account',
      `
          <h2>Welcome to My E-commerce</h2>
          <p>Click the link below to verify your account:</p>
          <a href="${uri}">${uri}</a>
        `
    )
    console.log(`Gửi mail link xác thực sau: 
      http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
    `)

    // lưu vào db
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            email_verify_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  // hàm kí sign forgot password token
  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN
      }
    })
  }
  // hàm forgot password
  async forgotPassword(email: string) {
    // email tìm user lấy id tạo forgot_password_token
    const user = await databaseService.users.findOne({
      email
    })
    if (user) {
      const user_id = user._id.toString()
      // kí forgot_token_token
      const forgot_password_token = await this.signForgotPasswordToken(user_id)
      // lưu vào database
      await databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        [
          {
            $set: {
              forgot_password_token,
              updated_at: '$$NOW'
            }
          }
        ]
      )
      const uri = `http://localhost:3000/users/reset-password/?forgot_password_token=${forgot_password_token}`
      await this.sendEmail(
        user.email,
        'Verify your account',
        `
          <h2>Welcome to My E-commerce</h2>
          <p>Click the link below to verify your account:</p>
          <a href="${uri}">${uri}</a>
        `
      )
      // gửi email cái link cho người dùng
      console.log(`Gửi mail link xác thực sau: 
        http://localhost:3000/users/reset-password/?forgot_password_token=${forgot_password_token}
      `)
    }
  }
  // reset password khi gửi mail forgot password
  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            password: hashPassword(password),
            forgot_password_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }
}

let usersService = new UserServices()
export default usersService
