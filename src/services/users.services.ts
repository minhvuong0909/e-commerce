import { TokenType } from '~/constants/enums'
import { signToken } from '~/utils/jwt'

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
}

let usersService = new UserServices()
export default usersService
