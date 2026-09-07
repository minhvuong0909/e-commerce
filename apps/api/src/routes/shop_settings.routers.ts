import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getShopSettingsController, updateShopSettingsController } from '~/controllers/shop_settings.controllers'
import { accessTokenValidator, checkPermissions, requireVerifiedEmail } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const shopSettingsRouter = Router()

/**
 * GET /shop-settings
 * Public shop configuration.
 * Features: returns logo, banners, contact buttons, hotline, address and storefront display settings.
 */
shopSettingsRouter.get('', wrapAsync(getShopSettingsController))

/**
 * PUT /shop-settings
 * Admin shop configuration update.
 * Auth: access token, verified email, Admin role.
 * Features: updates brand identity, contact links, store address and storefront settings without code changes.
 */
shopSettingsRouter.put(
  '',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Admin),
  requireVerifiedEmail,
  wrapAsync(updateShopSettingsController)
)

export default shopSettingsRouter
