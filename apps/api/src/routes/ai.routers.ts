import { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import { generateProductDescriptionController, skincareChatController } from '~/controllers/ai.controllers'
import { accessTokenValidator, checkPermissions, requireVerifiedEmail } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const aiRouter = Router()

/**
 * POST /ai/chat
 * Public skincare assistant for storefront users.
 * Features: answers skincare/product questions with inventory-aware guardrails.
 */
aiRouter.post('/chat', wrapAsync(skincareChatController))

/**
 * POST /ai/product-description
 * Admin/Staff tool for generating SEO product descriptions.
 * Auth: access token, verified email, Admin or Staff role.
 * Features: turns product name/ingredients/usage hints into sales copy for the product form.
 */
aiRouter.post(
  '/product-description',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Admin, USER_ROLE.Staff),
  requireVerifiedEmail,
  wrapAsync(generateProductDescriptionController)
)

export default aiRouter
