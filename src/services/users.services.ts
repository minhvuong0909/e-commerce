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
}

let usersService = new UserServices()
export default usersService
