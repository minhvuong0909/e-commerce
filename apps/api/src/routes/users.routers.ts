import express, { Router } from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  changePasswordController,
  forgotPasswordController,
  getProfileController,
  getUsers,
  loginController,
  loginWithGoogleController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unbanUserController,
  updateProfileController,
  verifyEmailController,
  verifyForgotPasswordTokenController,
  banUserController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  checkPermissions,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateProfileValidator
} from '~/middlewares/users.middlewares'
import { UpdateProfileRequestBody } from '~/models/requests/Users.requests'
import { wrapAsync } from '~/utils/handlers'
import { authLimiter, forgotPasswordLimiter } from '~/middlewares/rateLimit.middlewares'
import userAddressesRouter from './user_addresses.routers'

const userRouter = express.Router()

/**
 * POST /users/login
 * Customer/admin login.
 * Features: rate-limited authentication that returns access/refresh tokens for the web app.
 */
userRouter.post('/login', authLimiter, loginValidator, wrapAsync(loginController))

/**
 * POST /users/register
 * Customer registration.
 * Features: creates an account with name, email and password, then starts the email verification flow.
 */
userRouter.post('/register', registerValidator, wrapAsync(registerController))

/**
 * GET /users/verify-email
 * Email verification callback.
 * Features: validates email_verify_token from the query string and marks the user email as verified.
 */
userRouter.get('/verify-email', emailVerifyTokenValidator, wrapAsync(verifyEmailController))

/**
 * POST /users/logout
 * End the current session.
 * Auth: access token and refresh token.
 * Features: revokes the refresh token so the user cannot refresh the session after logout.
 */
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/**
 * POST /users/resend-verify-email
 * Resend email verification.
 * Auth: access token.
 * Features: sends a new verification link when the customer did not receive or lost the first one.
 */
userRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/**
 * POST /users/forgot-password
 * Start password recovery.
 * Features: rate-limited flow that sends a reset link when the email exists in the system.
 */
userRouter.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidator, wrapAsync(forgotPasswordController))

/**
 * POST /users/verify-forgot-password
 * Verify password reset token.
 * Features: checks whether the forgot-password token from email is still valid before allowing reset.
 */
userRouter.post('/verify-forgot-password', forgotPasswordTokenValidator, wrapAsync(verifyForgotPasswordTokenController))

/**
 * POST /users/reset-password
 * Complete password recovery.
 * Features: replaces the user's password after a valid forgot-password token is supplied.
 */
userRouter.post(
  '/reset-password',
  resetPasswordValidator,
  forgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/**
 * POST /users/me
 * Current user profile.
 * Auth: access token.
 * Features: returns account/profile data used by account menus and protected screens.
 */
userRouter.post('/me', accessTokenValidator, wrapAsync(getProfileController))

/**
 * PATCH /users/me
 * Update current user profile.
 * Auth: access token.
 * Features: edits public profile fields, avatar, cover photo and optional personal information.
 */
userRouter.patch(
  '/me',
  filterMiddleware<UpdateProfileRequestBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  accessTokenValidator,
  updateProfileValidator,
  wrapAsync(updateProfileController)
)

/**
 * PUT /users/change-password
 * Change password while logged in.
 * Auth: access token.
 * Features: validates old password before saving the new password.
 */
userRouter.put('/change-password', accessTokenValidator, changePasswordValidator, wrapAsync(changePasswordController))

/**
 * POST /users/refresh-token
 * Refresh an expired access token.
 * Features: validates refresh_token and returns a new authenticated session token pair.
 */
userRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

/**
 * GET /users
 * Admin user management list.
 * Auth: access token, Admin role.
 * Features: returns all users for dashboard moderation and account management.
 */
userRouter.get('', accessTokenValidator, checkPermissions(USER_ROLE.Admin), wrapAsync(getUsers))

/**
 * PATCH /users/:user_id/ban
 * Ban a user account.
 * Auth: access token, Admin role.
 * Features: blocks an account from normal authenticated usage.
 */
userRouter.patch('/:user_id/ban', accessTokenValidator, checkPermissions(USER_ROLE.Admin), wrapAsync(banUserController))

/**
 * PATCH /users/:user_id/unban
 * Unban a user account.
 * Auth: access token, Admin role.
 * Features: restores a previously banned account.
 */
userRouter.patch(
  '/:user_id/unban',
  accessTokenValidator,
  checkPermissions(USER_ROLE.Admin),
  wrapAsync(unbanUserController)
)

/**
 * POST /users/login-with-google
 * Google OAuth login.
 * Features: verifies Google token and signs the user into the same access/refresh token flow.
 */
userRouter.post('/login-with-google', wrapAsync(loginWithGoogleController))

/**
 * /users/addresses
 * Nested saved-address routes.
 * Features: customer checkout address CRUD lives in user_addresses.routers.ts.
 */
userRouter.use('/addresses', userAddressesRouter)

export default userRouter
