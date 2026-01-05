import { NextFunction, Request, Response } from 'express'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Users.requests'
import mediaServices from '~/services/medias.services'
import usersService from '~/services/users.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  // check login ròi mới cho upload
  // const { user_id } = req.decode_authorization as TokenPayload
  // const user = await usersService.findUserById(user_id)
  // // check verify
  // if (user.verify_status === UserVerifyStatus.Unverified) {
  //   throw new ErrorWithStatus({
  //     status: HTTP_STATUS.UNAUTHORIZED,
  //     message: USERS_MESSAGES.USER_NOT_VERIFIED
  //   })
  // }

  // check banned
  // if (user.verify_status === UserVerifyStatus.Banned) {
  //   throw new ErrorWithStatus({
  //     status: HTTP_STATUS.UNAUTHORIZED,
  //     message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED
  //   })
  // }

  const url = await mediaServices.hanleUploadImage(req)
  res.status(HTTP_STATUS.OK).json({
    message: 'Upload image Successfully',
    url
  })
}

// export const uploadVideoController = async (
//   req: Request<>,
//   res: Response,
//   next: NextFunction
// ) => {

// }
