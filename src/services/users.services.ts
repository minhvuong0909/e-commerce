import { TokenType } from '~/constants/enums'
import { signToken } from '~/utils/jwt'

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
}

let usersService = new UserServices()
export default usersService
