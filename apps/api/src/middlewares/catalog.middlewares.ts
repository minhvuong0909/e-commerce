import { USER_ROLE } from '~/constants/enums'
import { accessTokenValidator, checkPermissions, requireVerifiedEmail } from './users.middlewares'

/** Catalog writes share one policy; read endpoints remain separately configured. */
export const verifiedAdmin = [accessTokenValidator, checkPermissions(USER_ROLE.Admin), requireVerifiedEmail]
