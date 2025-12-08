import { TokenType } from '~/constants/enums'
import { signToken, verifyToken } from '~/utils/jwt'
import databaseService from './database.service'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { comparePassword, hashPassword } from '~/utils/crypto'
import RefreshToken from '~/models/schemas/Refresh_Tokens.schema'
import { compareSync } from 'bcrypt'

class UserServices {
  // kí access_token bằng jwt
  private signAccessToken(user_id: string) {
    // signToken là bất đồng bộ nên khi nào sử dụng hàm này thì mới xử lý await
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRE_IN as string) }
    })
  }

  // hàm kí refresh token
  private signRefreshToken(user_id: string, exp?: Number) {
    // check nếu tồn tại thời gian của token thì khỏi cần truyền thời gian hết hạn
    if (exp) {
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    } else {
      // nếu kh có thời gian thì lấy thời gian mặc định trong env
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
        options: { expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRE_IN as string) }
      })
    }
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
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422
        message: USERS_MESSAGES.EMAIL_IS_INCORRECT
      })
    }
    if (!comparePassword(password, user.password)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422
        message: USERS_MESSAGES.Password_IS_INCORRECT
      })
    }
    // xóa refresh

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
}

let usersService = new UserServices()
export default usersService
